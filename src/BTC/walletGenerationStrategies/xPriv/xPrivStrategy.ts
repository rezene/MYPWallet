import BIP32Factory, { BIP32Interface } from 'bip32';
import RootKeyStrategy from '../rootKeyStrategy.js';
import * as ecc from 'tiny-secp256k1';
const bip32 = BIP32Factory(ecc);

export class xPrivStrategy implements RootKeyStrategy {
    private xPriv:  string; // Buffer |  Extended private key (can be Buffer or hex string)
    private network: any;

    constructor(xPriv:  string, network: any) {
        this.xPriv = xPriv;
        this.network = network;
    }

    generateRoot(): BIP32Interface {
        return bip32.fromBase58(this.xPriv, this.network);
    }
}