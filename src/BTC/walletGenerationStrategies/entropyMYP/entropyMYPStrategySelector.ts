import StrategySelector from "../strategySelector";
import RootKeyStrategy from "../rootKeyStrategy";
import { EntropyMYPStrategy } from "./entropyMYPStrategy";

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