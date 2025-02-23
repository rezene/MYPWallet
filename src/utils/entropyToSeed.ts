import { SHA3 } from 'sha3';
function EntropyToSeed(entropy: string) {
    const sha3 = new SHA3(512); 
    sha3.update(entropy);   
    return sha3.digest();   
}
function EntropyToValidEntropy(entropy:string){
    const sha3 = new SHA3(256)
    sha3.update(entropy);   
    return sha3.digest();   
}

export {EntropyToSeed, EntropyToValidEntropy};

