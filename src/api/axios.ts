import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/utils/constants';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // ── 401: intentar renovar token ──────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (originalRequest.url?.includes('/auth/logout/')) {
        //console.log('🚫 [interceptor] 401 de /auth/logout/ ignorado correctamente');
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token found');

        const response = await axios.post(
          `${API_URL}/auth/token/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // ── 403: plan expirado o sin plan ────────────────────
    if (error.response?.status === 403) {
      const data = error.response.data as { codigo?: string };
      
      if (data?.codigo === 'PLAN_EXPIRADO' || data?.codigo === 'SIN_PLAN') {
        if (window.location.pathname !== '/plan-expirado') {
          window.location.href = '/plan-expirado';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;