import StrategySelector from "../strategySelector.js";
import RootKeyStrategy from "../rootKeyStrategy.js";
import { EntropyMYPStrategy } from "./entropyMYPStrategy.js";

import * as bitcoin from 'bitcoinjs-lib';

export class EntropyMYPStrategySelector implements StrategySelector {
    private entropy: string;
    private network: bitcoin.Network;

    constructor(entropy: string, network: bitcoin.Network) {
        this.entropy = entropy;
        this.network = network;
    }

    selectStrategy(): RootKeyStrategy {
        return new EntropyMYPStrategy(this.entropy, this.network);
    }
}