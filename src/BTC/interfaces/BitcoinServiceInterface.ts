import { BitcoinWallet } from '../BitcoinWallet.js';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';
import bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
const bip32 = BIP32Factory(ecc);
import { httpClient } from '../../utils/httpClient.js';
import { BitcoinService } from '../services/BitcoinService.js';
import { UTXO } from '../services/UtxoService.js';
import { EntropyToValidEntropy } from '../../utils/entropyToSeed.js';


//const myp2 = 'f0bZbra0kgyjUdwQLG1xWhtjN6iIScWbjscaeZlvP8ioc8mo1SgXSELgS6ScF1cL74NEDntXp9go38fwlQSHwstP6iSy0UIEJyq6wt0G4IpssDeIop8douXzw5doC4eG'
//console.log("myp2 lenght", myp2.length)



export class BitcoinServiceInterface {
    private btcService: BitcoinService;
    private httpClient: any;
    private entropy: string | Buffer;
    private strategySelector: any;
    private wallet: any;
    private network: any;
    private xpriv: string;
    private xpub: string;
    private node: BIP32Interface;
    private fee;
    private externalAddresses:string[] = [];
    private internalAddresses:string[] = [];
    private utxosExternal: (UTXO & { type?: 'external' })[] = [];
    private utxosInternal: (UTXO & { type?: 'internal' })[] = [];
    private utxos: (UTXO & { type: 'external' | 'internal' })[] = [];
    private isInit=false;
     constructor(entropy: string | Buffer, strategySelector: any) {

        this.httpClient = httpClient;
        this.entropy = entropy;
        this.network = bitcoin.networks.testnet;;
        this.strategySelector = new strategySelector(this.entropy, this.network);
        this.wallet = new BitcoinWallet(this.strategySelector, this.network);
        this.node = this.wallet.getRoot();
        this.xpriv = this.node.toBase58();
        this.xpub = this.node.neutered().toBase58();

        console.log("xpriv", this.xpriv);
        console.log("xpub", this.xpub);

        /* const masterNode = bip32.fromBase58(this.xpriv, bitcoin.networks.testnet); // Use 'bitcoin.networks.bitcoin' for mainnet
         const derivationPath = "m/0/1"; // Derivation path for the second child
         const childNode = masterNode.derivePath(derivationPath);
       */
        this.btcService = new BitcoinService(this.node, this.network, this.httpClient);
        this.fee = 400;

    }
   
    async init() {
        this.externalAddresses = await this.getExternalAddresses(8);
        this.internalAddresses = await this.getChangeAddresses(8);
       // this.utxos=[...this.utxosExternal, ...this.utxosInternal]
       this.utxos = [
        ...this.utxosExternal.map(utxo => ({
            ...utxo,
            type: 'external' as const,
        })),
        ...this.utxosInternal.map(utxo => ({
            ...utxo,
            type: 'internal' as const,
        }))
    ];


        this.isInit=true;
    }
    
    async getTotalWalletBallance() {
        if (!this.isInit)
            await this.init();
        return await this.btcService.getWalletBalanceService().getWalletBalance(this.utxos);

    }
    getExternalAddress(index: number) {
     
        return this.btcService.getAddressService().deriveExternalAddress(index);

    }
     getMnemonics(entropy:string){
      return bip39.entropyToMnemonic(EntropyToValidEntropy(entropy));
    }
   async  getTransactions(){
        if (!this.isInit)
            await this.init();
        return this.btcService.getUtxoService().getTransactions(this.utxos);
    }
    async getRecevingAddress(){
        if (!this.isInit)
        await this.init();
        return this.getExternalAddress(this.externalAddresses.length);
    }
    getChangeAddress(index: number) {
        return this.btcService.getAddressService().deriveChangeAddress(index);
    }


    async getExternalAddresses(count: number) {
        const externalAddresses = [];
        this.utxosExternal=[];
        for (let i = 0; i < count; i++) {
           let  tempAddress=this.getExternalAddress(i);
            
            let temp = await this.btcService.getUtxoService().getUTXO(tempAddress);
   
            if (temp.length >0){
                externalAddresses.push(tempAddress);
                this.utxosExternal.push(...temp);
                continue;
            }
                
          else
            break;

        }
        return externalAddresses;
    }

    // Function to get multiple change addresses
    async getChangeAddresses(count: number) {
        const changeAddresses = [];
        this.utxosInternal=[];
        for (let i = 0; i < count; i++) {
            let tempAddress=this.getChangeAddress(i)
            let temp = await this.btcService.getUtxoService().getUTXO(tempAddress);
    
            if (temp.length >0){
                changeAddresses.push(tempAddress);
                this.utxosInternal.push(...temp);
                continue;
            }
         else
           break;

        }
        return changeAddresses;
    }


    async transferBitCoin(recipientAddress: string, amount: number) {

        if (!this.isInit)
            await this.init();
  
        const responseData = await this.wallet.createTransaction(recipientAddress, amount, this.fee, this.utxosExternal, this.utxosInternal);
        return responseData;
    }
}