interface ApiConfig {
    getUTXOsByAddress:"https://blockstream.info/testnet/api/address/${address}/utxo",
    getTxByTxId:"https://blockstream.info/testnet/api/tx/{txId}",
    getTxsByAddress:"https://blockstream.info/testnet/api/address/${address}/txs"

}
export default ApiConfig;