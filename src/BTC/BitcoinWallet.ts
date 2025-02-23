import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import StrategySelector from './walletGenerationStrategies/strategySelector.js';
import { httpClient } from '../utils/httpClient.js';
import BIP32Factory from 'bip32';
const bip32 = BIP32Factory(ecc);
export class BitcoinWallet {
    private network: bitcoin.Network;
    private root: BIP32Interface;
    
    constructor(strategySelector: StrategySelector, network: bitcoin.Network) {
        console.log(strategySelector.selectStrategy());
        this.network = network;
        const strategy = strategySelector.selectStrategy();
        this.root = strategy.generateRoot();
      
    }

    getNetwork(): bitcoin.Network {
        return this.network;
    }

    getRoot(): BIP32Interface {
        return this.root;
    }

    async createTransaction(
        recipientAddress: string,
        amount: number,
        fee: number,
        utxosExternal: any[],
        utxosInternal: any[]
    ): Promise<string> {
        const psbt = new bitcoin.Psbt({ network: this.network });
        let totalInput = 0;
        const utxos = [...(utxosExternal || []), ...(utxosInternal || [])];
      
        for (const utxo of utxos) {
            const input: any = {
                hash: utxo.txid,
                index: utxo.vout,
            };
            if (utxo.scriptPubKey.startsWith('0014')) {
                input.witnessUtxo = {
                    script: Buffer.from(utxo.scriptPubKey, 'hex'),
                    value: utxo.value,
                };
            } else {
                input.nonWitnessUtxo = Buffer.from(await this.fetchTransactionHex(utxo.txid), 'hex');
            }
            psbt.addInput(input);
            totalInput += utxo.value;
        }
    
        // Add outputs
        const remainingValue = totalInput - amount - fee;
        if (remainingValue < 0) throw new Error(`Insufficient funds, exceeded by ${remainingValue}`);
        psbt.addOutput({ address: recipientAddress, value: Number(amount) });
        if (remainingValue > 0) psbt.addOutput({ address: this.changeAddress(utxosInternal.length), value: remainingValue });
    
        // Sign inputs
        for (let i = 0; i < utxosExternal.length; i++) {
            const utxoAddress = utxosExternal[i].address;
            let child: BIP32Interface | undefined;
           
            // Check external addresses
            for (let idx = 0; idx < utxosExternal.length; idx++) {
                const derivedAddr = this.deriveExternalAddress(idx);
                if (utxoAddress === derivedAddr) {
                    child = this.root
                        .deriveHardened(44)
                        .deriveHardened(this.network === bitcoin.networks.bitcoin ? 0 : 1)
                        .deriveHardened(0)
                        .derive(0)
                        .derive(idx);
                    break;
                }
            }
            if (!child) throw new Error(`Could not derive key for UTXO address: ${utxoAddress}`);
        
            if (!child.privateKey) throw new Error('Private key unavailable');

            const signer = {
                publicKey: Buffer.from(child.publicKey),
                sign: (hash: Buffer) => Buffer.from(ecc.sign(hash, child.privateKey!)),
            };
            psbt.signInput(i, signer);
        }

        for (let i = 0; i < utxosInternal.length; i++) {
            const utxoAddress = utxosInternal[i].address;
            let child: BIP32Interface | undefined;
            // Check change addresses if no match
            if (!child) {
                for (let idx = 0; idx < 100; idx++) {
                    const derivedAddr = this.changeAddress(idx);
                    if (utxoAddress === derivedAddr) {
                        child = this.root
                            .deriveHardened(44)
                            .deriveHardened(this.network === bitcoin.networks.bitcoin ? 0 : 1)
                            .deriveHardened(0)
                            .derive(1)
                            .derive(idx);
                        break;
                    }
                }
            }
        
            if (!child) {
                throw new Error(`Could not derive key for UTXO address: ${utxoAddress}`);
            }
        
            if (!child.privateKey) throw new Error('Private key unavailable');

            const signer = {
                publicKey: Buffer.from(child.publicKey),
                sign: (hash: Buffer) => Buffer.from(ecc.sign(hash, child.privateKey!)),
            };
            psbt.signInput(i, signer);
        }
    
        psbt.finalizeAllInputs();
        const tx = psbt.extractTransaction();
        const rawTx = tx.toHex();
        return await this.broadcastTransaction(rawTx);
    }


changeAddress(index: number): string {

    // Derive the BIP44-compliant path for change addresses: m/44'/1'/0'/1/n
    const child = this.root
        .deriveHardened(44) // Purpose (BIP44)
        .deriveHardened(this.network === bitcoin.networks.bitcoin ? 0 : 1) // Coin type (0 for mainnet, 1 for testnet)
        .deriveHardened(0) // Account index
        .derive(1) // Change chain
        .derive(index); // Address index

    // Generate the P2WPKH address
    const changeAddress = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(child.publicKey), // Convert Uint8Array to Buffer
        network: this.network,
    }).address!;

    return changeAddress;
}

    deriveExternalAddress(index: number): string {
    //const node = bip32.fromBase58(this.root.toBase58(), this.network);

    // Derive the BIP44-compliant path for external addresses: m/44'/1'/0'/0/n
    const child = this.root
        .deriveHardened(44) // Purpose (BIP44)
        .deriveHardened(this.network === bitcoin.networks.bitcoin ? 0 : 1) // Coin type (0 for mainnet, 1 for testnet)
        .deriveHardened(0) // Account index
        .derive(0) // External chain
        .derive(index); // Address index

    // Generate the P2WPKH address
    const mainAddress = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(child.publicKey), // Convert Uint8Array to Buffer
        network: this.network,
    }).address!;

    return mainAddress;
}

    async fetchTransactionHex(txid: string): Promise<string> {
        const url = `/tx/${txid}/hex`;
        const response = await httpClient.get(url);
        return response.data;
    }

   /* signTransaction(psbt: bitcoin.Psbt, index: number = 0): bitcoin.Psbt {
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
    }*/

    async broadcastTransaction(hex: string): Promise<string> {
        try {
            const url = `/tx`;
            const response = await httpClient.post(url, hex, {
                headers: { 'Content-Type': 'text/plain' },
            });
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error broadcasting transaction:', error.message);
            } else {
                console.error('An unknown error occurred:', error);
            }
            throw error; // Re-throw the error to propagate it
        }
    }
}