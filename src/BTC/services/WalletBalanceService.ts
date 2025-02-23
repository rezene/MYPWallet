import {httpClient} from'../../utils/httpClient.js';
import { AddressService  } from './AddressService.js';
export class WalletBalanceService{
    private addressService:AddressService;
    private network:any;
    constructor(addressService:AddressService){
       this.addressService=addressService;
       
    }
    /*
 async getWalletBalance(index:number): Promise<number> {
    let totalBalance = 0;
   
    // Check main addresses
    let balanceCounter=0;
    while (true) {
        const mainAddress = await this.addressService.deriveExternalAddress(index);
        const balance = await this.getBalance(mainAddress);

        if (balance === 0) {
            if (balanceCounter++ >1)
            break; // Stop if no UTXOs are found for this address
        }

        totalBalance += balance;
        index++;
    }
    // Reset index for change addresses
    index = 1;
    // Check change addresses
    while (true) {
        const changeAddress = this.addressService.deriveChangeAddress(index);
        const balance = await this.getBalance(changeAddress);
         
        if (balance === 0) {
            break; // Stop if no UTXOs are found for this address
        }

        totalBalance += balance;
        index++;
    } 

    return totalBalance;
}

// Helper function to get balance for a single address
async getBalance(address: string): Promise<number> {
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
*/

async getWalletBalance(utxos: any []): Promise<number> {
   
    let balance = 0;
    utxos.forEach((utxo: any) => {
        balance += utxo.value;
    });

    return balance;
}

}

