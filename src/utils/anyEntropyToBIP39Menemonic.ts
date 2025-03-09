import * as bip39 from 'bip39';
const crypto = require('crypto');

function GenerateMnemonicFromEntropy(entropy: string): string {

    const hash = crypto.createHash('sha256').update(entropy).digest('hex');

    if (![16, 20, 24, 28, 32].includes(hash.length)) {
        throw new Error("Invalid entropy length. Must be 16, 20, 24, 28, 32  bytes.");
    }

    const mnemonic = bip39.entropyToMnemonic(hash);
    return mnemonic;
}
export default GenerateMnemonicFromEntropy;

