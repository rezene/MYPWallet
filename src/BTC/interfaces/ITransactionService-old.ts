import { httpClient } from '../../utils/httpClient.js';
import ApiConfig from '../../config/api.js'

export interface ITransactionServiceDependencies {
    httpClient: typeof httpClient; 
    apiConfig: ApiConfig;

}