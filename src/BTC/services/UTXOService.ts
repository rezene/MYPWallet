export class UtxoService{
    private httpClient;
    constructor(httpClient: any) {
        this.httpClient= httpClient
    }
async getUTXOs(address: string): Promise<any[]> {
    const url = `/address/${address}/utxo`;
    const response = await this.httpClient.get(url);
    const utxos = Array.isArray(response.data) ? response.data : [];

    // Fetch scriptPubKey for each UTXO
    const utxosWithScriptPubKey = await Promise.all(
        utxos.map(async (utxo:any) => {
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
            };
        })
    );

    return utxosWithScriptPubKey;
}
}