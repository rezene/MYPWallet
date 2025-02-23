import { AddressService } from './AddressService.js';
import { WalletBalanceService } from './WalletBalanceService.js';
import { UtxoService } from './UtxoService.js';
import { BIP32Interface } from 'bip32';

export class BitcoinService {
    private addressService: AddressService;
    private walletBalanceService: WalletBalanceService;
    private utxoService: UtxoService;

    constructor(node: BIP32Interface, netowrk: any, httpClient: any) {
        this.addressService = new AddressService(node, netowrk);
        this.walletBalanceService = new WalletBalanceService(this.addressService);
        this.utxoService = new UtxoService(httpClient);
    }
    getAddressService() {
        return this.addressService;
    }
    getWalletBalanceService() {
        return  this.walletBalanceService;
    }

    getUtxoService() {
        return  this.utxoService;
    }
}