import * as bitcoin from 'bitcoinjs-lib';
import  { BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import StrategySelector from './walletGenerationStrategies/strategySelector';
export class BitcoinWallet {
    private network: bitcoin.Network;
    private root: BIP32Interface;
    constructor(strategySelector: StrategySelector, network: bitcoin.Network) {
        this.network = network ;
        const strategy = strategySelector.selectStrategy();
        this.root = strategy.generateRoot();
    }

    getNetwork(): bitcoin.Network {
        return this.network;
    }

    getRoot(): BIP32Interface {
        return this.root;
    }

    // Generate a new Bitcoin address
    generateAddress(index: number = 0): string {
        const path = `m/44'/1'/0'/0/${index}`;
        const child = this.root.derivePath(path);

        const pubkeyBuffer = Buffer.from(child.publicKey);
        const { address } = bitcoin.payments.p2pkh({
            pubkey: pubkeyBuffer,
            network: this.network,
        });

        return address!;
    }

    // Create a transaction
    createTransaction(recipientAddress: string, amount: number, fee: number, utxos: any[]): bitcoin.Psbt {
        const psbt = new bitcoin.Psbt({ network: this.network });

        let totalInput = 0;
        for (const utxo of utxos) {
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: Buffer.from(utxo.scriptPubKey, 'hex'),
                    value: utxo.value,
                },
            });
            totalInput += utxo.value;
        }

        psbt.addOutput({
            address: recipientAddress,
            value: amount,
        });
        psbt.addOutput({
            address: this.generateAddress(),
            value: totalInput - amount - fee,
        });

        return psbt;
    }

    signTransaction(psbt: bitcoin.Psbt, index: number = 0): bitcoin.Psbt {
        const path = `m/44'/1'/0'/0/${index}`;
        const child = this.root.derivePath(path);

        if (!child.privateKey) {
            throw new Error('Private key not available for signing');
        }

        // Create a signer object
        const signer = {
            publicKey: Buffer.from(child.publicKey),
            sign: (hash: Buffer) => {
                const signature = ecc.sign(hash, child.privateKey!);
                return Buffer.from(signature); // Convert Uint8Array to Buffer
            },
        };

        psbt.signInput(index, signer);
        return psbt;
    }
}