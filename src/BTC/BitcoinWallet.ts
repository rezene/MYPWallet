import * as bitcoin from 'bitcoinjs-lib';
import  { BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import StrategySelector from './walletGenerationStrategies/strategySelector.js';
import { httpClient } from '../utils/httpClient.js';
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
/*
    // Generate a new Bitcoin address
    generateAddress(index: number = 0): string {
        const path = `m/44'/1'/0'/0/${index}`;
        const child = this.root.derivePath(path);

        const pubkeyBuffer = Buffer.from(child.publicKey);

        const { address } = bitcoin.payments.p2wpkh({
            pubkey: pubkeyBuffer,
            network: this.network,
        });
        return address!;
    }

    generateChangeAddress(index: number = 0): string {
        const path = `m/44'/1'/0'/1/${index}`;
        const child = this.root.derivePath(path);
      
        const pubkeyBuffer = Buffer.from(child.publicKey);
        const { address } = bitcoin.payments.p2wpkh({
            pubkey: pubkeyBuffer,
            network: this.network,
        });
        return address!;
    }*/
    // Create a transaction
    async createTransaction(recipientAddress: string, changeAddress: string, amount: number, fee: number, utxos:any[]): Promise<bitcoin.Psbt>{
        const psbt = new bitcoin.Psbt({ network: this.network });

        let totalInput = 0;
        for (const utxo of utxos) {
            const input: any = {
                hash: utxo.txid,
                index: utxo.vout,
            };
    
            // Check if the script is SegWit (P2WPKH or P2WSH)
            if (utxo.scriptPubKey.startsWith('0014') || utxo.scriptPubKey.startsWith('0020')) {
                // SegWit script: Use witnessUtxo
                input.witnessUtxo = {
                    script: Buffer.from(utxo.scriptPubKey, 'hex'),
                    value: utxo.value,
                };
            } else {
                // Non-SegWit script: Use nonWitnessUtxo
                const txHex = await this.fetchTransactionHex(utxo.txid); // Fetch the full transaction hex
                input.nonWitnessUtxo = Buffer.from(txHex, 'hex');
            }
            
            psbt.addInput(input);
            totalInput += utxo.value;
        }  
        if (totalInput < amount + fee) {
            throw new Error('Insufficient funds to cover the amount and fee.');
        }
        psbt.addOutput({
            address: recipientAddress,
            value: amount,
        });
        psbt.addOutput({
            address: changeAddress,
            value: totalInput - amount - fee,
        });

        return psbt;
    }
//TODO("to be removed")
    async fetchTransactionHex(txid: string): Promise<string> {
        const url = `/tx/${txid}/hex`; 
        const response = await httpClient.get(url);
        return response.data;
    }

    signTransaction(psbt: bitcoin.Psbt, index: number = 0): bitcoin.Psbt {
        const path = `m/44'/1'/0'/1/${index}`;
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

    async broadcastTransaction(hex: string): Promise<string> {
        try {
        const url = `/tx`;
        const response = await httpClient.post(url, hex, {
            headers: { 'Content-Type': 'text/plain' },
        });
        return response.data;
    }catch (error) {
        if (error instanceof Error) {
            console.error('Error broadcasting transaction:', error.message);
        } else {
            console.error('An unknown error occurred:', error);
        }
        throw error; // Re-throw the error to propagate it
    }
    }


}