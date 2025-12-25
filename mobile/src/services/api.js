import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const HOST = (() => {
  if (process.env.API_HOST) return process.env.API_HOST;

  if (Platform.OS === 'android') return 'http://10.0.2.2:5001';

  return 'http://localhost:5000';
})();

const API_URL = `${HOST}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[API] Failed to read token from storage', e?.message || e);
    }

    try {
      console.log(`[API] Request -> ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data ?? '');
    } catch (e) {
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    try {
      console.log(`[API] Response <- ${response.status} ${response.config?.url}`, response.data);
    } catch (e) {
    }
    return response;
  },
  async (error) => {
    try {
      console.error('[API] Response error', error?.message, error?.response?.data ?? 'no response data');
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
    } catch (e) {
    }
    return Promise.reject(error);
  }
);

export default api;
