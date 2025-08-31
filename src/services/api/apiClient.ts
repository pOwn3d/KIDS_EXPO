import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { API_CONFIG, getHeaders } from './config';
import { store } from '@store/store';
import { logout, setTokens } from '@store/slices/authSlice';
import { addPendingAction } from '@store/slices/offlineSlice';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: getHeaders(),
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Check network connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          // Store request for later if offline
          this.handleOfflineRequest(config);
          throw new Error('No internet connection');
        }

        // Add auth token
        const token = await SecureStore.getItemAsync('jwt_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Extract Hydra data if present
        if (response.data && response.data['hydra:member']) {
          response.data = response.data['hydra:member'];
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for token refresh
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.isRefreshing = false;
            this.onRefreshed(newToken);
            this.refreshSubscribers = [];
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            store.dispatch(logout());
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/token/refresh`,
      { refresh_token: refreshToken },
      { headers: getHeaders() }
    );

    const { token, refresh_token } = response.data;
    
    // Store new tokens
    await SecureStore.setItemAsync('jwt_token', token);
    await SecureStore.setItemAsync('refresh_token', refresh_token);
    
    // Update Redux store
    store.dispatch(setTokens({ token, refreshToken: refresh_token }));
    
    return token;
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
  }

  private handleOfflineRequest(config: AxiosRequestConfig) {
    // Store request for later sync when online
    store.dispatch(addPendingAction({
      id: Date.now().toString(),
      type: 'api_request',
      payload: {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers,
      },
      timestamp: Date.now(),
    }));
  }

  private handleApiError(error: AxiosError) {
    let message = 'Une erreur est survenue';
    
    if (!error.response) {
      message = 'Erreur de connexion au serveur';
    } else {
      switch (error.response.status) {
        case 400:
          message = 'Requête invalide';
          break;
        case 403:
          message = 'Accès refusé';
          break;
        case 404:
          message = 'Ressource introuvable';
          break;
        case 422:
          // Validation errors from API Platform
          const violations = (error.response.data as any)?.violations;
          if (violations && violations.length > 0) {
            message = violations.map((v: any) => v.message).join(', ');
          } else {
            message = 'Erreur de validation';
          }
          break;
        case 500:
          message = 'Erreur serveur';
          break;
      }
    }

    // Show error toast
    Toast.show({
      type: 'error',
      text1: 'Erreur',
      text2: message,
      position: 'top',
    });
  }

  // Public methods for making requests
  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();