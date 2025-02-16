import StrategySelector from "../strategySelector.js";
import RootKeyStrategy from "../rootKeyStrategy.js";
import { xPrivStrategy } from "./xPrivStrategy.js";


export class xPrivStrategySelector implements StrategySelector {
    private xPriv: Buffer | string;
    private network: any;

    constructor(xPriv: Buffer|string, network: any) {
        this.xPriv = xPriv;
        this.network = network;
    }

    selectStrategy(): RootKeyStrategy {
        return new xPrivStrategy(this.xPriv, this.network);
    }
}