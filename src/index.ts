import  {BitcoinWallet}  from './BTC/BitcoinWallet.js';

import bitcoin from 'bitcoinjs-lib';
import * as path from 'path';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';
// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(ecc);

import { httpClient } from './utils/httpClient.js';
import ConfigurationReader from './utils/ConfigurationReader.js';
import UTXOService from './BTC/services/UTXOService.js';
import {UTXOServiceDependencies} from './BTC/interfaces/IUTXOService-old.js';

import { MnemonicStrategySelector } from './BTC/walletGenerationStrategies/mnemonic/mnemonicStrategySelector.js';
import {EntropyMYPStrategySelector} from './BTC/walletGenerationStrategies/entropyMYP/entropyMYPStrategySelector.js'
import {getWalletBalance,  getBalance} from './BTC/services/WalletBalance.js'
import { getUTXOs } from './BTC/services/UTXOServices.js';
import crypto from 'crypto';
import { deriveChangeAddress, deriveMainAddress } from './BTC/services/AddressServices.js';
const network=  bitcoin.networks.testnet;
const myp2='f0bZbra0kgyjUdwQLG1xWhtjN6iIScWbjscaeZlvP8ioc8mo1SgXSELgS6ScF1cL74NEDntXp9go38fwlQSHwstP6iSy0UIEJyq6wt0G4IpssDeIop8douXzw5doC4eG'
console.log("myp2 lenght", myp2.length)
//console.log(entropyToBIP39Menemonic(myp2));

//const mnemonic= "moment wing lobster public flag palm cradle robot attract shoot screen prevent";
//const wallet = new BitcoinWallet(mnemonic, network);
/*
const mnemonicSelector = new MnemonicStrategySelector(mnemonic, network);
const wallet = new BitcoinWallet(mnemonicSelector, network);
*/
//const node: BIP32Interface = bip32.fromBase58('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi');

const entropyMYPSelector = new EntropyMYPStrategySelector(myp2, network);
const wallet = new BitcoinWallet(entropyMYPSelector, network);
//const address=wallet.generateAddress();
//console.log('Address-seed:', address);

const node: BIP32Interface = wallet.getRoot();
// Convert node to xpub string
const xpriv: string = node.toBase58();
const xpub = node.neutered().toBase58();
console.log("xpriv", xpriv);
console.log("xpub", xpub);

const totalBalance =await getWalletBalance(xpub,network);
console.log('Total Wallet Balance:', totalBalance);
const mainAddress=deriveMainAddress(xpub,0,network);
console.log('deriveMainAddress:', mainAddress);
console.log('balance main address:', await getBalance(mainAddress));
const changeAddress=await deriveChangeAddress(xpub,0,network);
console.log("balance in change address:",changeAddress, await getBalance(changeAddress));

/*console.log("Mnemonic",wallet.getMnemonic());
console.log("Seed",wallet.getSeed());
console.log("Network",wallet.getNetwork());
console.log("Root",wallet.getRoot());*/

//const address = wallet.generateAddress();
//console.log('Generated Address:', address);
/*
const configDirectory = path.join(__dirname, './config');
const configFilename = 'api.json'; 

const configReader = new ConfigurationReader();

// Define dependencies for the UTXOService
const dependencies: UTXOServiceDependencies = {
    httpClient: httpClient,
    configReader: configReader,
    configDirectory: configDirectory, // Pass the config directory
    configFilename: configFilename,   // Pass the config filename
};

// Initialize the UTXOService with the dependencies
const utxoService = new UTXOService(dependencies);
//const utxos1 = await utxoService.getUTXOsByAddress('your-address-here');
      //  console.log(utxos1);

interface UTXO {
    scriptPubKey: string;
    value: number;
}

async function getUTXO(txid: string, vout: number): Promise<UTXO> {
    try {
    const response = await httpClient.get(`https://blockstream.info/testnet/api/tx/${txid}`);
    const transaction = response.data;
     console.log(transaction);
        if (vout < 0 || vout >= transaction.vout.length) {
            throw new Error('Invalid vout index');
        }
        const output = transaction.vout[vout];
        return {
            scriptPubKey: output.scriptpubkey,
            value: output.value * 1e8, // Convert from BTC to satoshis if necessary
        };
    } catch (error) {
        console.error('Error fetching or parsing transaction:', error);
        throw error; // Optionally re-throw the error after logging
    }
}


async function fetchUTXO() {
    try {
        const utxo= await getUTXO('5d76ecb2660bc8423a7653fc6ac2ce27e16aeec0504f52cb220af0981d3b590a', 0);
        return utxo;
    } catch (err) {
        console.error(err);
    }
}
 fetchUTXO();
*/
/*
const utxos = [
    {
      txid: '5d76ecb2660bc8423a7653fc6ac2ce27e16aeec0504f52cb220af0981d3b590a', //  transaction ID
      vout: 0, // Output index
      scriptPubKey: "76a9147ebdb96530eb4b8f8c71831278d7145bdd95b95888ac", // ScriptPubKey
      value: 46992, // Value in satoshis 
    },
  ];
/*
  We sent 0.00046992 bitcoins to address
ms56iVZMGxitDhsZKuch8jQVqDpuxJ8Po6

tx: 5d76ecb2660bc8423a7653fc6ac2ce27e16aeec0504f52cb220af0981d3b590a
Send coins back, when you don't need them anymore to the address

tb1qerzrlxcfu24davlur5sqmgzzgsal6wusda40er
*/


/*
// Create a transaction
const recipientAddress = 'tb1qs4mzcygsqyty0qs26l7y5ctu5j9x3qm3jznncx';
const amount = 500; // Amount in satoshis
const fee = 300; // Fee in satoshis
//const totalBalance=46992; //satoshis
const utxos=await getUTXOs("mqeNZo3SG8BTNYu4v6Atsnocppjw5GF6A7");
console.log("UTXOS", utxos);
const psbt = await wallet.createTransaction(recipientAddress,changeAddress, amount, fee, utxos);
console.log("psbt", psbt);
// Sign the transaction
const signedPsbt = wallet.signTransaction(psbt);
console.log("Signed", signedPsbt);
// Finalize and extract the transaction
const txHex = signedPsbt.finalizeAllInputs().extractTransaction().toHex();

console.log('Signed Transaction Hex:', txHex);
const responseData=await wallet.broadcastTransaction(txHex);
console.log("Broadcasted data", responseData);

// Broadcast the transaction (use a Bitcoin node or API)
// Example: Use a block explorer API or your own node to broadcast the transaction.
*/