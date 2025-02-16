import { httpClient } from '../../utils/httpClient.js';
import { IConfigurationReader } from '../../utils/IConfigurationReader-old.js';

export interface IUTXOService {
    getUTXOsByAddress(address: string): Promise<any>; 
}

export interface UTXOServiceDependencies {
    httpClient: typeof httpClient; 
    configReader: IConfigurationReader; 
    configDirectory: string;
    configFilename: string;
}