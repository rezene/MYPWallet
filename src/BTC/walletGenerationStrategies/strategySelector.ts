import RootKeyStrategy from './rootKeyStrategy';
interface StrategySelector {
    selectStrategy(): RootKeyStrategy;
}
export default StrategySelector;