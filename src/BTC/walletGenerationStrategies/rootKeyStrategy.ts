import { BIP32Interface } from 'bip32';
interface RootKeyStrategy {
    generateRoot(): BIP32Interface;
}

export default RootKeyStrategy;