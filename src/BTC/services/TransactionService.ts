import * as bitcoin from 'bitcoinjs-lib';
import { ECPairInterface } from 'ecpair';
import axios from 'axios';

export class TransactionService {
    private baseUrl: string;
    private network: bitcoin.Network;

    constructor(baseUrl: string, network: bitcoin.Network) {
        this.baseUrl = baseUrl;
        this.network = network;
    }

    /**
     * Create a raw transaction.
     */
    createTransaction(
        utxos: any[],
        toAddress: string,
        amount: number,
        changeAddress: string,
        feeRate: number = 10 // satoshis per byte
    ): bitcoin.Psbt {
        const psbt = new bitcoin.Psbt({ network: this.network });

        let totalInput = 0;
        utxos.forEach((utxo) => {
            totalInput += utxo.value;
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: bitcoin.address.toOutputScript(utxo.address, this.network),
                    value: utxo.value,
                },
            });
        });

        const totalOutput = amount + feeRate * 100; // Estimate fee
        if (totalInput < totalOutput) {
            throw new Error('Insufficient funds');
        }

        psbt.addOutput({
            address: toAddress,
            value: amount,
        });

        // Add change output
        if (totalInput > totalOutput) {
            psbt.addOutput({
                address: changeAddress,
                value: totalInput - totalOutput,
            });
        }

        return psbt;
    }

    /**
     * Sign a transaction with a private key.
     */
    signTransaction(psbt: bitcoin.Psbt, keyPair: ECPairInterface): bitcoin.Psbt {
        const signer = toSigner(keyPair); // Convert ECPairInterface to Signer
        psbt.data.inputs.forEach((_, index) => {
            psbt.signInput(index, signer);
        });
        return psbt;
    }

    /**
     * Broadcast a signed transaction to the Bitcoin network.
     */
    async broadcastTransaction(hex: string): Promise<string> {
        const url = `${this.baseUrl}/tx`;
        const response = await axios.post(url, hex, {
            headers: { 'Content-Type': 'text/plain' },
        });
        return response.data;
    }

    /**
     * Send a transaction (combines create, sign, and broadcast).
     */
    async sendTransaction(
        utxos: any[],
        toAddress: string,
        amount: number,
        changeAddress: string,
        keyPair: ECPairInterface
    ): Promise<string> {
        const psbt = this.createTransaction(utxos, toAddress, amount, changeAddress);
        const signedPsbt = this.signTransaction(psbt, keyPair);
        const finalizedPsbt = signedPsbt.finalizeAllInputs();
        const txHex = finalizedPsbt.extractTransaction().toHex();
        return this.broadcastTransaction(txHex);
    }
}

// Convert ECPairInterface to a Signer-compatible object
function toSigner(keyPair: ECPairInterface): bitcoin.Signer {
    return {
        publicKey: Buffer.from(keyPair.publicKey),
        sign: (hash: Buffer) => Buffer.from(keyPair.sign(hash)),
    };
}