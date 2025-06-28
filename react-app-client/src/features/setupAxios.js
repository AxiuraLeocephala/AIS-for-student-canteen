import axios from 'axios';
import { getCookie } from '../utils/cookie';

const mAxios = axios.create({
    baseURL: '/',
});

mAxios.interceptors.request.use(config => {
    const token = getCookie('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default mAxios;