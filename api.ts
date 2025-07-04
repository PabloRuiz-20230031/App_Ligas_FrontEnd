// src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.100:3000/api',
  timeout: 5000,
});

export default api;
