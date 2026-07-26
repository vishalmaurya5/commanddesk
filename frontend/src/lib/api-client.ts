import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseData = error.response?.data;
    const message =
      typeof responseData === 'string'
        ? responseData
        : responseData?.error || error.message || 'Request failed';

    if (process.env.NODE_ENV === 'development') {
      console.warn('API request failed', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        message,
      });
    }

    return Promise.reject(error);
  }
);
