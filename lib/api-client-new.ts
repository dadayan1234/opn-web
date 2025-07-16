import axios, { isCancel, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { getAuthToken, setAuthTokens, removeAuthTokens } from './auth-utils';
import { API_CONFIG } from './config';

export const apiClient = axios.create({
  baseURL: `${API_CONFIG.BACKEND_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  paramsSerializer: {
    encode: (value) => value
  }
});

export const uploadsApiClient = axios.create({
  baseURL: `${API_CONFIG.BACKEND_URL}/api/v1`,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  timeout: 30000,
  paramsSerializer: {
    encode: (value) => value
  }
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAuthEndpoint = config.url && (
      config.url.includes('/auth/token') ||
      config.url.includes('/auth/refresh')
    );

    if (isAuthEndpoint) {
      return config;
    }

    const token = typeof window !== "undefined" ? getAuthToken() : null;

    if (token && config.headers) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: unknown) => {
    if (isCancel(error)) {
      return Promise.reject({
        isCanceled: true,
        message: 'Request was canceled',
        originalError: error
      });
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error;
      const originalRequest = axiosError.config as AxiosRequestConfig & { _retry?: boolean };
      
      if (axiosError.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
          
          if (!refreshToken) {
            removeAuthTokens();
            if (typeof window !== "undefined") {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }

          const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            },
          });

          if (response.ok) {
            const data = await response.json();
            setAuthTokens(data.access_token, data.refresh_token);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            }
            
            return apiClient(originalRequest);
          } else {
            removeAuthTokens();
            if (typeof window !== "undefined") {
              window.location.href = '/login';
            }
          }
        } catch (refreshError) {
          removeAuthTokens();
          if (typeof window !== "undefined") {
            window.location.href = '/login';
          }
        }
      }

      if (axiosError.response?.status === 401) {
        removeAuthTokens();
        if (typeof window !== "undefined") {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

uploadsApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? getAuthToken() : null;
    
    if (token && config.headers) {
      config.headers.Authorization = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

uploadsApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: unknown) => {
    if (isCancel(error)) {
      return Promise.reject({
        isCanceled: true,
        message: 'Upload request was canceled',
        originalError: error
      });
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      removeAuthTokens();
      if (typeof window !== "undefined") {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
