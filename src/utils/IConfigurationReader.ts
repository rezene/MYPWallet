export interface IConfigurationReader {
    readConfig(directory: string, filename: string): Promise<any>; 
}