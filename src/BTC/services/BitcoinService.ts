import { AddressService } from './AddressService.js';
//import { TransactionService } from './TransactionService.js';
import * as bitcoin from 'bitcoinjs-lib';

export class BitcoinService {
    public addressService: AddressService;
   // public transactionService: TransactionService;

    constructor() {
        const baseUrl = 'https://blockstream.info/testnet/api';
        const network = bitcoin.networks.testnet;

        this.addressService = new AddressService(baseUrl);
       // this.transactionService = new TransactionService(baseUrl, network);
    }
}