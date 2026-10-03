import axios from 'axios';
import { API_BASE } from '../config/constants';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'Network error';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export default api;
