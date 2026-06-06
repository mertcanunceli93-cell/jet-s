import axios from 'axios';
import { useAuth } from '../store/useAuth';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use(async (config) => {
  const token = useAuth.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
