import { BitcoinWallet } from './BTC/BitcoinWallet';

const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
import * as path from 'path';

import { httpClient } from './utils/httpClient';
import ConfigurationReader from './utils/ConfigurationReader';
import UTXOService from './BTC/services/UTXOService';
import {UTXOServiceDependencies} from './BTC/interfaces/IUTXOService';

import { MnemonicStrategySelector } from './BTC/walletGenerationStrategies/mnemonic/mnemonicStrategySelector';
import {EntropyMYPStrategySelector} from './BTC/walletGenerationStrategies/entropyMYP/entropyMYPStrategySelector'
const crypto = require('crypto');

const myp2='f0bZbra0kgyjUdwQLG1xWhtjN6iIScWbjscaeZlvP8ioc8mo1SgXSELgS6ScF1cL74NEDntXp9go38fwlQSHwstP6iSy0UIEJyq6wt0G4IpssDeIop8douXzw5doC4eG'
console.log("myp2 lenght", myp2.length)
//console.log(entropyToBIP39Menemonic(myp2));

const mnemonic= "moment wing lobster public flag palm cradle robot attract shoot screen prevent";
const network=  bitcoin.networks.testnet;
//const wallet = new BitcoinWallet(mnemonic, network);

const mnemonicSelector = new MnemonicStrategySelector(mnemonic, network);
const wallet = new BitcoinWallet(mnemonicSelector, network);
console.log('Address-menmonic:', wallet.generateAddress());

const entropyMYPSelector = new EntropyMYPStrategySelector(myp2, network);
const walletFromSeed = new BitcoinWallet(entropyMYPSelector, network);

console.log('Address-seed:', walletFromSeed.generateAddress());

/*console.log("Mnemonic",wallet.getMnemonic());
console.log("Seed",wallet.getSeed());
console.log("Network",wallet.getNetwork());
console.log("Root",wallet.getRoot());*/

//const address = wallet.generateAddress();
//console.log('Generated Address:', address);

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

// Create a transaction
const recipientAddress = 'tb1qerzrlxcfu24davlur5sqmgzzgsal6wusda40er';
const amount = 1000; // Amount in satoshis
const fee = 100; // Fee in satoshis
const psbt = wallet.createTransaction(recipientAddress, amount, fee, utxos);

// Sign the transaction
const signedPsbt = wallet.signTransaction(psbt);

// Finalize and extract the transaction
signedPsbt.finalizeAllInputs();
const txHex = signedPsbt.extractTransaction().toHex();
console.log('Signed Transaction Hex:', txHex);

// Broadcast the transaction (use a Bitcoin node or API)
// Example: Use a block explorer API or your own node to broadcast the transaction.
