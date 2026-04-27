import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Update with your local IP or backend URL
// const BASE_URL = 'https://app-mythy-api-prod-ins.azurewebsites.net/api/v1'; 
// const BASE_URL = 'https://asp-mythy-api-prod-uaen.azurewebsites.net/api/v1';
const BASE_URL = 'http://172.20.10.12:5001/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Logger & Token Injection
api.interceptors.request.use(async (config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  
  // Get token from Zustand store
  const token = useAuthStore.getState().authToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data) {
    console.log('[API Payload]', JSON.stringify(config.data, null, 2));
  }
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Logger & Token Refresh
api.interceptors.response.use((response) => {
  console.log(`[API Success] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
  return response;
}, async (error) => {
  const originalRequest = error.config;
  const { refreshToken, clearAuth, setAuth, user } = useAuthStore.getState();

  // If 401 and we have a refresh token, try to refresh
  if (error.response?.status === 401 && !originalRequest._retry) {
    if (!refreshToken) {
      console.log('[API Interceptor] No refresh token available - clearing auth');
      clearAuth();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      console.log('[API Interceptor] Refresh already in progress - queuing request');
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;
    console.log('[API Interceptor] Attempting token refresh...');
    
    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      
      if (response.data.success) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        console.log('[API Interceptor] Token refreshed successfully!');
        
        // Update store
        setAuth({ accessToken: newAccessToken, refreshToken: newRefreshToken }, user!);
        
        // Process queue with new token
        processQueue(null, newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    } catch (refreshError) {
      console.error('[API Interceptor] Refresh failed, logging out...', refreshError);
      processQueue(refreshError, null);
      clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
  console.error('[API Error Detail]', error.response?.status, error.response?.data || error.message);
  
  return Promise.reject(error);
});

export default api;
