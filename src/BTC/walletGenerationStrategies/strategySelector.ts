import RootKeyStrategy from './rootKeyStrategy.js';
interface StrategySelector {
    selectStrategy(): RootKeyStrategy;
}
export default StrategySelector;