import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';
const bip32 = BIP32Factory(ecc);

export class AddressService {
    private xpub:string;
    private network:any;
    constructor(xpub:string,network:any){
     this.xpub=xpub;
     this.network=network;
    }
// Derive main addresses (path m/44'/1'/0'/0/n)
 deriveMainAddress(index:number): string {
    const node: BIP32Interface = bip32.fromBase58(this.xpub, this.network);
    const mainAddress = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(node.derive(0).derive(index).publicKey), // Derive main address (path m/44'/1'/0'/0/index)
        network: this.network,
    }).address!;
    return mainAddress;
   
}

// Derive change addresses (path m/44'/1'/0'/1/n)
 deriveChangeAddress(index:number): string {
    const node: BIP32Interface = bip32.fromBase58(this.xpub, this.network);
    const changeAddress = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(node.derive(1).derive(index).publicKey), // Derive change address (path m/44'/1'/0'/1/index)
        network: this.network,
    }).address!;
    return changeAddress;
}

/*
    generateAccountXpub(rootNode: bip32.BIP32Interface, accountIndex: number = 0): string {
        // Derive the account node
        const accountNode = rootNode
            .deriveHardened(44)  // Purpose (BIP44)
            .deriveHardened(0)   // Coin type (Bitcoin)
            .deriveHardened(accountIndex); // Account index
    
        // Neutered the account node to get the xpub
        const accountXpub = accountNode.neutered().toBase58();
        return accountXpub;
    }

  */
}