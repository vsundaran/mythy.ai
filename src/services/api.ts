import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Update with your local IP or backend URL
const BASE_URL = 'http://192.168.1.33:5001/api/v1'; 

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

// Response Logger & Token Refresh
api.interceptors.response.use((response) => {
  console.log(`[API Success] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
  return response;
}, async (error) => {
  const originalRequest = error.config;
  const { authToken, refreshToken, clearAuth, setAuth, user } = useAuthStore.getState();

  // If 401 and we have a resume point, try to refresh
  if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
    originalRequest._retry = true;
    console.log('[API Interceptor] Attempting token refresh...');
    
    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      
      if (response.data.success) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        console.log('[API Interceptor] Token refreshed successfully!');
        
        // Update store
        setAuth({ accessToken: newAccessToken, refreshToken: newRefreshToken }, user!);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    } catch (refreshError) {
      console.error('[API Interceptor] Refresh failed, logging out...', refreshError);
      clearAuth();
      return Promise.reject(refreshError);
    }
  }

  console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
  console.error('[API Error Detail]', error.response?.status, error.response?.data || error.message);
  
  // If refresh failed or was not possible, just reject
  return Promise.reject(error);
});

export default api;
