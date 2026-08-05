import axios from 'axios';

export const apiClient = axios.create({
  // The Next.js app owns the complete authenticated API surface. Keeping
  // requests same-origin also preserves the Supabase SSR session cookies.
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // FormData bodies must keep axios' auto-generated multipart content type,
    // which includes the boundary. The instance-level JSON default would
    // otherwise override it and request.formData() fails to parse on the
    // server. Deleting the header lets axios set it from the body.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers) {
        if (typeof config.headers.delete === 'function') {
          config.headers.delete('Content-Type');
          config.headers.delete('content-type');
        }
        delete (config.headers as any)['Content-Type'];
        delete (config.headers as any)['content-type'];
      }
    }

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
