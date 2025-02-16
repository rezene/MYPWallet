import axios from 'axios';

export class AddressService {
    private baseUrl: string;
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getBalance(address: string): Promise<number> {
        const url = `${this.baseUrl}/address/${address}/utxo`;
        const response = await axios.get(url);
        const utxos = response.data;

        let balance = 0;
        utxos.forEach((utxo: any) => {
            balance += utxo.value;
        });
        return balance;
    }

    async getBalances(addresses: string[]): Promise<number> {
        //If you want to retrieve the balance for a wallet (including change addresses), 
        // you need to pass all addresses (main + change) to the method
        let totalBalance = 0;
    
        for (const address of addresses) {
            const url = `${this.baseUrl}/address/${address}/utxo`;
            const response = await axios.get(url);
            const utxos = response.data;
    
            let balance = 0;
            utxos.forEach((utxo: any) => {
                balance += utxo.value;
            });
    
            totalBalance += balance;
        }
    
        return totalBalance;
    }

    async getTransactions(address: string): Promise<any[]> {
        const url = `${this.baseUrl}/address/${address}/txs`;
        const response = await axios.get(url);
        return response.data;
    }
}