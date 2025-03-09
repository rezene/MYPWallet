import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';
const bip32 = BIP32Factory(ecc);

export class AddressService {
    private node:BIP32Interface;
    private network;
    constructor(node:BIP32Interface, network:any){
     this.node=node;
     this.network=network;
    }
// external and main addresses (path m/44'/1'/0'/0/n)
deriveExternalAddress(index: number): string {
    const child = this.node
        .deriveHardened(44)
        .deriveHardened(this.network === bitcoin.networks.bitcoin ? 0 : 1) 
        .deriveHardened(0) 
        .derive(0) 
        .derive(index); 
    
    const mainAddress = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(child.publicKey), 
        network: this.network,
    }).address!;

    return mainAddress;
}

// Derive change addresses (path m/44'/1'/0'/1/n)
deriveChangeAddress(index: number): string {
    const child = this.node
        .deriveHardened(44)
        .deriveHardened(this.network === bitcoin.networks.bitcoin ? 0 : 1) 
        .deriveHardened(0) 
        .derive(1)
        .derive(index);

    const changeAddress = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(child.publicKey), // Convert Uint8Array to Buffer
        network: this.network,
    }).address!;

    return changeAddress;
}


/*
    generateAccountxpriv(rootNode: bip32.BIP32Interface, accountIndex: number = 0): string {
        // Derive the account node
        const accountNode = rootNode
            .deriveHardened(44)  
            .deriveHardened(0)   
            .deriveHardened(accountIndex); 
        
        const accountxpriv = accountNode.neutered().toBase58();
        return accountxpriv;
    }

  */
}