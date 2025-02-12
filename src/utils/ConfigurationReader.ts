
import * as path from 'path';
import * as fs from 'fs/promises';
import { IConfigurationReader } from './IConfigurationReader';

class ConfigurationReader implements IConfigurationReader {
    public async readConfig(directory: string, filename: string): Promise<any> { 
        const configPath = path.join(directory, filename); 
        try {
            const fileContent = await fs.readFile(configPath, 'utf-8'); 
            return JSON.parse(fileContent);
        } catch (error) {
            console.error('Error reading configuration file:', error);
            throw error; 
        }
    }
}

export default ConfigurationReader;