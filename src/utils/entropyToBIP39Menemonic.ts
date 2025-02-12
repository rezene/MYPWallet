import * as bip39 from 'bip39';
const crypto = require('crypto');

function generateMnemonicFromEntropy(entropy: string): string {

    const hash = crypto.createHash('sha256').update(entropy).digest('hex');

    if (![16, 20, 24, 28, 32, 64].includes(entropy.length)) {
        throw new Error("Invalid entropy length. Must be 16, 20, 24, 28, 32 or 64 bytes.");
    }

    const mnemonic = bip39.entropyToMnemonic(entropy);
    return mnemonic;
}
export default generateMnemonicFromEntropy;
