import { BitcoinService } from './BTC/services/BitcoinService';
import * as bitcoin from 'bitcoinjs-lib';

(async () => {
    const bitcoinService = new BitcoinService();

    // Example: Get balance
    const address = 'mjXZwmEi1z1J7cL3bK5qJ7K6Z8J9XZ1Z1Z';
    const balance = await bitcoinService.addressService.getBalance(address);
    console.log('Balance:', balance);

    // Example: Get transactions
    const transactions = await bitcoinService.addressService.getTransactions(address);
    console.log('Transactions:', transactions);

    // Example: Send transaction
    //const keyPair = bitcoin.ECPair.makeRandom({ network: bitcoin.networks.testnet }); // Replace with your key pair
    const utxos = [
        {
            txid: 'previous-txid',
            vout: 0,
            value: 100000, // satoshis
            address: address,
        },
    ];
    const toAddress = 'recipient-address';
    const amount = 50000; // satoshis
    const changeAddress = address;

    //const txId = await bitcoinService.transactionService.sendTransaction(utxos, toAddress, amount, changeAddress, keyPair);
    //console.log('Transaction ID:', txId);
})();