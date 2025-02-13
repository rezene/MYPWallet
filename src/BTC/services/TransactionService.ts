
import { ITransactionServiceDependencies } from '../interfaces/ITransactionService';


export class TransactionService {
    private httpClient;
    private apiConfig;
    constructor({httpClient, apiConfig}: ITransactionServiceDependencies) {
        this.httpClient = httpClient; 
        this.apiConfig=apiConfig;
    }

    async getTxByTxId(txId: string) {
        const url = this.apiConfig.getTxByTxId.replace('{txId}', txId);
        try {
            const response = await this.httpClient.get(url);
            console.log('Transaction Details:', response.data);
        } catch (error) {
            console.error('Error fetching transaction:', error);
        }
    }

    async getTxsByAddress(address: string) {
        const url = this.apiConfig.getTxsByAddress.replace('${address}', address);
        try {
            const response = await this.httpClient.get(url);
            console.log('Transactions:', response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }
}