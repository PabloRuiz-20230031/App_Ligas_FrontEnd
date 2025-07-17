import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.77.70:3000/api',
  timeout: 10000, // más tiempo
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default api;