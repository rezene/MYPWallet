import { httpClient } from '../../utils/httpClient';
import { IConfigurationReader } from '../../utils/IConfigurationReader-old';

export interface IUTXOService {
    getUTXOsByAddress(address: string): Promise<any>; 
}

export interface UTXOServiceDependencies {
    httpClient: typeof httpClient; 
    configReader: IConfigurationReader; 
    configDirectory: string;
    configFilename: string;
}