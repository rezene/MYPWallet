import RootKeyStrategy from '../rootKeyStrategy';
import StrategySelector from '../strategySelector';
import { MnemonicStrategy } from './mnemonicStrategy';

import * as bitcoin from 'bitcoinjs-lib';
export class MnemonicStrategySelector implements StrategySelector {
    private mnemonic: string;
    private network: bitcoin.Network;

    constructor(mnemonic: string, network: bitcoin.Network) {
        this.mnemonic = mnemonic;
        this.network = network;
    }

    selectStrategy(): RootKeyStrategy {
        return new MnemonicStrategy(this.mnemonic, this.network);
    }
}