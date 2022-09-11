import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',
  timeout: 10 * 1000, // 10 seconds
});

export default api;
