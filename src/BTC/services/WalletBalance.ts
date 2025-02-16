import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';
import {httpClient} from'../../utils/httpClient';
const bip32 = BIP32Factory(ecc);

const network = bitcoin.networks.testnet;

// Derive main addresses (path m/44'/1'/0'/0/n)
function deriveMainAddress(xpub: string, index: number): string {
    const node: BIP32Interface = bip32.fromBase58(xpub, network);
    const mainAddress = bitcoin.payments.p2pkh({
        pubkey: Buffer.from(node.derive(0).derive(index).publicKey), // Derive main address (path m/44'/1'/0'/0/index)
        network: network,
    }).address!;
    return mainAddress;
}

// Derive change addresses (path m/44'/1'/0'/1/n)
function deriveChangeAddress(xpub: string, index: number): string {
    const node: BIP32Interface = bip32.fromBase58(xpub, network);
    const changeAddress = bitcoin.payments.p2pkh({
        pubkey: Buffer.from(node.derive(1).derive(index).publicKey), // Derive change address (path m/44'/1'/0'/1/index)
        network: network,
    }).address!;
    return changeAddress;
}

async function getWalletBalance(xpub: string): Promise<number> {
    let totalBalance = 0;
    let index = 0;

    // Check main addresses
    while (true) {
        const mainAddress = deriveMainAddress(xpub, index);
        const balance = await getBalance(mainAddress);

        if (balance === 0) {
            break; // Stop if no UTXOs are found for this address
        }

        totalBalance += balance;
        index++;
    }
    // Reset index for change addresses
    index = 0;
    // Check change addresses
    while (true) {
        const changeAddress = deriveChangeAddress(xpub, index);
        const balance = await getBalance(changeAddress);

        if (balance === 0) {
            break; // Stop if no UTXOs are found for this address
        }

        totalBalance += balance;
        index++;
    }

    return totalBalance;
}

// Helper function to get balance for a single address
async function getBalance(address: string): Promise<number> {
    const url = `/address/${address}/utxo`;
    const response = await httpClient.get(url);
    const utxos = response.data;

    let balance = 0;
    utxos.forEach((utxo: any) => {
        balance += utxo.value;
    });

    return balance;
}
/*
const xpub = 'your-xpub-here';
const totalBalance = await getWalletBalance(xpub);
console.log('Total Wallet Balance:', totalBalance);
*/