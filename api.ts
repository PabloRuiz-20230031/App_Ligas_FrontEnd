import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.0.106:3000/api',
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a cada petición
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('❌ Error al obtener token de AsyncStorage:', error);
  }
  return config;
});

export default api;
