import BIP32Factory from 'bip32';
import {httpClient} from'../../utils/httpClient.js';
import { deriveChangeAddress, deriveMainAddress  } from './AddressServices.js';

export async function getWalletBalance(xpub: string, network:any): Promise<number> {
    let totalBalance = 0;
    let index = 0;
    // Check main addresses
    while (true) {
        const mainAddress = await deriveMainAddress(xpub, index,network);
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
        const changeAddress = deriveChangeAddress(xpub, index, network);
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
export async function getBalance(address: string): Promise<number> {
    const url = `/address/${address}/utxo`;
    const response = await httpClient.get(url);
    //const utxos = response.data;
    const utxos=Array.isArray(response.data) ? response.data : []
    let balance = 0;
    utxos.forEach((utxo: any) => {
        balance += utxo.value;
    });

    return balance;
}

export async function getUTXO(address: string): Promise<any[]> {
    const url = `/address/${address}/utxo`;
    const response = await httpClient.get(url);
    const utxos = Array.isArray(response.data) ? response.data : [];

    // Fetch scriptPubKey for each UTXO
    const utxosWithScriptPubKey = await Promise.all(
        utxos.map(async (utxo) => {
            const txUrl = `/tx/${utxo.txid}`;
            const txResponse = await httpClient.get(txUrl);
            const txDetails = txResponse.data;
            //console.log("utxos", utxo);
            //console.log("txDetails", txDetails);

            // Find the output corresponding to the UTXO's vout
            const output = txDetails.vout[utxo.vout];
            if (!output || !output.scriptpubkey) {
                throw new Error(`Could not find scriptPubKey for UTXO: ${utxo.txid}:${utxo.vout}`);
            }

            // Add scriptPubKey to the UTXO object
            return {
                ...utxo,
                scriptPubKey: output.scriptpubkey,
            };
        })
    );

    return utxosWithScriptPubKey;
}
