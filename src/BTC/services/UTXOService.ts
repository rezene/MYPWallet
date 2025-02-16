
import { IUTXOService, UTXOServiceDependencies } from '../interfaces/IUTXOService-old.js';
import { IConfigurationReader } from '../../utils/IConfigurationReader-old.js';

class UTXOService implements IUTXOService {
    private httpClient;
    private apiConfig:any;
    constructor({ httpClient, configReader, configDirectory, configFilename }: UTXOServiceDependencies) {
        this.httpClient = httpClient;
        this.initializeConfig(configReader, configDirectory, configFilename);
    }

    private async initializeConfig(configReader: IConfigurationReader, directory: string, filename: string) {
        this.apiConfig = await configReader.readConfig(directory, filename);
    }

    async getUTXOsByAddress(address: string): Promise<any> {
        const url = this.apiConfig.getUTXOsByAddress.replace('${address}', address);
        try {
            const response = await this.httpClient.get(url);
            console.log('UTXOs:', response.data);
            return response.data; 
        } catch (error) {
            console.error('Error fetching UTXOs:', error);
            throw error; 
        }
    }
}

export default UTXOService;