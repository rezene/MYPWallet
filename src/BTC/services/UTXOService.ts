import { formatDate } from "../../utils/dateFormat.js";
export interface UTXO {
    txid: string;  // Transaction ID
    vout: number;  // Output index
    value: number; // Amount of the UTXO
    // Add any other properties that are relevant
}

export class UtxoService{
    private httpClient;
    constructor(httpClient: any) {
        this.httpClient= httpClient
    }
    async getUTXOs(addresses: string[]): Promise<any[]> {
        // Fetch UTXOs for all addresses
        const allUtxos = await Promise.all(
            addresses.map(async (address) => {
                const url = `/address/${address}/utxo`;
                const response = await this.httpClient.get(url);
                const utxos = Array.isArray(response.data) ? response.data : [];
    
                // Fetch scriptPubKey for each UTXO
                const utxosWithScriptPubKey = await Promise.all(
                    utxos.map(async (utxo: any) => {
                        const txUrl = `/tx/${utxo.txid}`;
                        const txResponse = await this.httpClient.get(txUrl);
                        const txDetails = txResponse.data;
    
                        // Find the output corresponding to the UTXO's vout
                        const output = txDetails.vout[utxo.vout];
                        if (!output || !output.scriptpubkey) {
                            throw new Error(`Could not find scriptPubKey for UTXO: ${utxo.txid}:${utxo.vout}`);
                        }
    
                        // Add scriptPubKey to the UTXO object
                        return {
                            ...utxo,
                            scriptPubKey: output.scriptpubkey,
                            address, // Optionally include the address for reference
                        };
                    })
                );
    
                return utxosWithScriptPubKey;
            })
        );
    
        // Flatten the array of arrays into a single array of UTXOs
        return allUtxos.flat();
    }

    async getUTXO(address: string): Promise<any[]> {
        // Fetch UTXOs for the single address
        const url = `/address/${address}/utxo`;
        const response = await this.httpClient.get(url);
        const utxos = Array.isArray(response.data) ? response.data : [];
    
        // Fetch scriptPubKey for each UTXO
        const utxosWithScriptPubKey = await Promise.all(
            utxos.map(async (utxo: any) => {
                const txUrl = `/tx/${utxo.txid}`;
                const txResponse = await this.httpClient.get(txUrl);
                const txDetails = txResponse.data;
    
                // Find the output corresponding to the UTXO's vout
                const output = txDetails.vout[utxo.vout];
                if (!output || !output.scriptpubkey) {
                    throw new Error(`Could not find scriptPubKey for UTXO: ${utxo.txid}:${utxo.vout}`);
                }
    
                // Add scriptPubKey to the UTXO object
                return {
                    ...utxo,
                    scriptPubKey: output.scriptpubkey,
                    address, // Optionally include the address for reference
                };
            })
        );
    
        return utxosWithScriptPubKey;
    }

    getTransactions(transactions: any[]): { type:string, confirmed: boolean; block_time: string; value: number }[] {
        return transactions
            .map(tx => ({
                type:tx.type,
                confirmed: tx.status.confirmed,
                block_time: formatDate(new Date(tx.status.block_time * 1000).toISOString()), 
                value: tx.value
            }))
            .sort((a, b) => {
                // Sort by block_time in descending order
                return new Date(b.block_time).getTime() - new Date(a.block_time).getTime();
            });
    }
}