import BIP32Factory, { BIP32Interface } from 'bip32';
import RootKeyStrategy from '../rootKeyStrategy.js';
import * as ecc from 'tiny-secp256k1';
const bip32 = BIP32Factory(ecc);

export class xPrivStrategy implements RootKeyStrategy {
    private xPriv:  Buffer | string; // Extended private key (can be Buffer or hex string)
    private network: any;

    constructor(xPriv: Buffer | string, network: any) {
        this.xPriv = xPriv;
        this.network = network;
    }

    generateRoot(): BIP32Interface {
        const xPrivBuffer = typeof this.xPriv === 'string' ? Buffer.from(this.xPriv, 'hex') : this.xPriv;
        return bip32.fromSeed(xPrivBuffer, this.network);
    }
}