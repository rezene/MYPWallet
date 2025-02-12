import BIP32Factory, { BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bip39 from 'bip39';

import * as bitcoin from 'bitcoinjs-lib';

const bip32 = BIP32Factory(ecc);

export class BitcoinWallet {
    private network: bitcoin.Network;
    private mnemonic: string;
    private seed: Buffer;
    private root: BIP32Interface;

    constructor(mnemonic?: string, network: bitcoin.Network = bitcoin.networks.testnet) {
        this.network = network;
        this.mnemonic = mnemonic || bip39.generateMnemonic(256);
        this.seed = bip39.mnemonicToSeedSync(this.mnemonic);
        this.root = bip32.fromSeed(this.seed);
    }

    // Get the mnemonic phrase
    getMnemonic(): string {
        return this.mnemonic;
    }

    getSeed(): Buffer {
        return this.seed;
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
    //Partially Signed Bitcoin Transaction
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