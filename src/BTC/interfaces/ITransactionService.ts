import { httpClient } from '../../utils/httpClient';
import ApiConfig from '../../config/api'

export interface ITransactionServiceDependencies {
    httpClient: typeof httpClient; 
    apiConfig: ApiConfig;

}