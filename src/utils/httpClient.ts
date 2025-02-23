import axios, { AxiosInstance } from 'axios';

export const httpClient: AxiosInstance = axios.create({
    baseURL: 'https://blockstream.info/testnet/api',
    timeout: 100000, // Set timeout to 5000 milliseconds (5 seconds)
});