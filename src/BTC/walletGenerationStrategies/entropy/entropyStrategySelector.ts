import RootKeyStrategy from '../rootKeyStrategy.js';
import StrategySelector from '../strategySelector.js';
import { EntropyStrategy } from './entropyStrategy.js';

import * as bitcoin from 'bitcoinjs-lib';
export class EntropyStrategySelector implements StrategySelector {
    private entropy: string;
    private network: bitcoin.Network;

    constructor(entropy: string, network: bitcoin.Network) {
        this.entropy = entropy;
        this.network = network;
    }

    selectStrategy(): RootKeyStrategy {
        return new EntropyStrategy(this.entropy, this.network);
    }
}