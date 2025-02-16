import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';
const bip32 = BIP32Factory(ecc);


// Derive main addresses (path m/44'/1'/0'/0/n)
export function deriveMainAddress(xpub: string, index: number, network:any): string {
    const node: BIP32Interface = bip32.fromBase58(xpub, network);
    const mainAddress = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(node.derive(0).derive(index).publicKey), // Derive main address (path m/44'/1'/0'/0/index)
        network: network,
    }).address!;
    return mainAddress;
   
}

// Derive change addresses (path m/44'/1'/0'/1/n)
export function deriveChangeAddress(xpub: string, index: number, network:any): string {
    const node: BIP32Interface = bip32.fromBase58(xpub, network);
    const changeAddress = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(node.derive(1).derive(index).publicKey), // Derive change address (path m/44'/1'/0'/1/index)
        network: network,
    }).address!;
    return changeAddress;
}

/*
    function generateAccountXpub(rootNode: bip32.BIP32Interface, accountIndex: number = 0): string {
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