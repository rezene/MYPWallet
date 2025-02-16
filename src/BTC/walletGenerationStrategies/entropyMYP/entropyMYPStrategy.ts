import BIP32Factory, { BIP32Interface } from 'bip32';
import RootKeyStrategy from '../rootKeyStrategy.js';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { EntropyToSeed } from '../../../utils/entropyToSeed.js';
const bip32 = BIP32Factory(ecc);

export class EntropyMYPStrategy implements RootKeyStrategy {
    private entropy: string;
    private network: bitcoin.Network;

    constructor(entropy: string, network: bitcoin.Network) {
        this.entropy = entropy;
        this.network = network;
    }

    generateRoot(): BIP32Interface {
        const seed=EntropyToSeed(this.entropy);
        return bip32.fromSeed(seed, this.network);
    }
}