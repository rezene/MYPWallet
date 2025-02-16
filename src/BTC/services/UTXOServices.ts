import {httpClient} from'../../utils/httpClient.js';
export async function getUTXOs(address: string): Promise<any[]> {
    const url = `/address/${address}/utxo`;
    const response = await httpClient.get(url);
    const utxos = Array.isArray(response.data) ? response.data : [];

    // Fetch scriptPubKey for each UTXO
    const utxosWithScriptPubKey = await Promise.all(
        utxos.map(async (utxo) => {
            const txUrl = `/tx/${utxo.txid}`;
            const txResponse = await httpClient.get(txUrl);
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
            };
        })
    );

    return utxosWithScriptPubKey;
}
