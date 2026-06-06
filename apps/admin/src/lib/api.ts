import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuth } from '../store/useAuth';

const api = axios.create({
  baseURL: 'https://jetiss.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuth.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if response is JSON
    const contentType = response.headers['content-type'];
    if (typeof contentType === 'string' && contentType.includes('application/json')) {
      return response;
    } else {
      // If not JSON, treat as error
      throw new Error(`Server returned non-JSON response: ${response.data}`);
    }
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const contentType = error.response.headers['content-type'];
      if (typeof contentType === 'string' && contentType.includes('application/json')) {
        return Promise.reject(error);
      } else {
        // Non-JSON error response
        const message = error.response.data || error.response.statusText || 'Unknown error';
        throw new Error(`Server error: ${message}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error - please check your connection');
    } else {
      // Other error
      throw error;
    }
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success) {
    return response.data.data as T;
  } else {
    throw new Error(response.data.error || 'API request failed');
  }
};

export default api;