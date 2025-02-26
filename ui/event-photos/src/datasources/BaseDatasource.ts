import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, AXIOS_CONFIG } from '../utils/constants';

class BaseDatasource {
    protected baseUrl: string;
    private _client: AxiosInstance;
    constructor(config = AXIOS_CONFIG, baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
        this._client = axios.create(config);
    }

    constructUrl(url: string) {
        return `${this.baseUrl}${url}`;
    }

    get client() {
        return this._client;
    }
}

export default BaseDatasource;
