import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory, { BIP32Interface } from 'bip32';
import RootKeyStrategy from '../rootKeyStrategy.js';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';
const bip32 = BIP32Factory(ecc);

export class MnemonicStrategy implements RootKeyStrategy {
    private mnemonic: string;
    private network: bitcoin.Network;

    constructor(mnemonic: string, network: bitcoin.Network) {
        this.mnemonic = mnemonic;
        this.network = network;
    }

    generateRoot(): BIP32Interface {
        const seed = bip39.mnemonicToSeedSync(this.mnemonic);
        return bip32.fromSeed(seed, this.network);
    }
}