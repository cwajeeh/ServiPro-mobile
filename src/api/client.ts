import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';

import { parseRefreshTokenResponse } from '@/api/parseRefreshTokenResponse';
import { nativeEnv } from '@/config/nativeEnv';
import { useAuthStore } from '@/store/authStore';

export const baseURL = nativeEnv.apiUrl;

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    if (!isAxiosError(error) || error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const path = String(originalRequest?.url ?? '');
    if (path.includes('/auth/login') || path.includes('/auth/refresh-token')) {
      await useAuthStore.getState().signOutLocal();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      await useAuthStore.getState().signOutLocal();
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(`${baseURL}/auth/refresh-token`, {
        refresh_token: refreshToken,
      });

      const parsed = parseRefreshTokenResponse(response.data);
      if (!parsed) {
        throw new Error('Invalid refresh-token response shape.');
      }
      const { access_token, refresh_token } = parsed;
      await useAuthStore.getState().updateTokens(access_token, refresh_token);
      queueMicrotask(() => {
        void import('@/store/socketReconnect').then((m) => m.reconnectSocketsAfterTokenRefresh());
      });

      processQueue(null, access_token);
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await useAuthStore.getState().signOutLocal();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
