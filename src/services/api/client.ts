import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ApiResponse, ApiError, PaginatedResponse, RequestOptions } from '../../types/api';

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableLogging: boolean;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  enableLogging: __DEV__,
};

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  OFFLINE_QUEUE: 'offline_queue',
};

// Request/Response interfaces
interface ApiRequest extends RequestInit {
  url: string;
  timeout?: number;
  skipAuth?: boolean;
  skipRetry?: boolean;
}

interface ApiClientOptions {
  onTokenExpired?: () => void;
  onNetworkError?: () => void;
  onUnauthorized?: () => void;
}

/**
 * API Client with JWT authentication, retry logic, and offline support
 */
export class ApiClient {
  private config: ApiConfig;
  private options: ApiClientOptions;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(config: Partial<ApiConfig> = {}, options: ApiClientOptions = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.options = options;
  }

  /**
   * Get stored access token
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      this.log('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  private async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      this.log('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Store tokens
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // Try to store tokens individually for better error handling
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      this.log('Tokens stored successfully');
    } catch (error) {
      this.log('Error storing tokens:', error);
      // Don't throw error, just log it - tokens will be kept in memory
      console.warn('Failed to persist tokens to storage, using in-memory only');
    }
  }

  /**
   * Clear tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      this.log('Error clearing tokens:', error);
    }
  }

  /**
   * Check network connectivity
   */
  private async isOnline(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected === true;
    } catch (error) {
      this.log('Error checking network status:', error);
      return false;
    }
  }

  /**
   * Logging utility
   */
  private log(...args: any[]): void {
    if (this.config.enableLogging) {
      console.log('[ApiClient]', ...args);
    }
  }

  /**
   * Create request headers
   */
  private async createHeaders(skipAuth = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': `KidsPointsApp/${Platform.OS}`,
    };

    if (!skipAuth) {
      const token = await this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle token refresh
   */
  private async refreshTokens(): Promise<boolean> {
    if (this.isRefreshing) {
      // If already refreshing, wait for it to complete
      return new Promise<boolean>((resolve, reject) => {
        this.failedQueue.push({ resolve: resolve as any, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.request({
        url: '/auth/refresh',
        method: 'POST',
        skipAuth: true,
        skipRetry: true,
        body: JSON.stringify({ refreshToken }),
      });

      const { token, refreshToken: newRefreshToken } = response;
      await this.setTokens(token, newRefreshToken);

      // Process failed queue
      this.failedQueue.forEach(({ resolve }) => resolve());
      this.failedQueue = [];

      return true;
    } catch (error) {
      this.log('Token refresh failed:', error);
      
      // Process failed queue with errors
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];
      
      // Clear tokens and notify
      await this.clearTokens();
      this.options.onTokenExpired?.();
      
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Handle API errors
   */
  private handleApiError(response: Response, data?: any): ApiError {
    const error: ApiError = {
      '@type': 'hydra:Error',
      'hydra:title': response.statusText || 'API Error',
      'hydra:description': data?.message || data?.detail || 'An error occurred',
      status: response.status,
      detail: data?.detail,
      violations: data?.violations,
    };

    // Handle specific error cases
    if (response.status === 401) {
      this.options.onUnauthorized?.();
    } else if (response.status >= 500) {
      this.options.onNetworkError?.();
    }

    return error;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Core request method with retry logic
   */
  private async request(config: ApiRequest): Promise<any> {
    const { url, timeout = this.config.timeout, skipAuth = false, skipRetry = false, ...init } = config;
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;

    // Check network connectivity
    if (!(await this.isOnline())) {
      throw new Error('No internet connection');
    }

    // Create headers
    const headers = await this.createHeaders(skipAuth);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error;
    const maxRetries = skipRetry ? 1 : this.config.retries + 1;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.log(`Request attempt ${attempt}/${maxRetries}:`, init.method || 'GET', fullUrl);

        const response = await fetch(fullUrl, {
          ...init,
          headers: { ...headers, ...init.headers },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle successful responses
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            return await response.json();
          }
          return await response.text();
        }

        // Handle authentication errors
        if (response.status === 401 && !skipAuth) {
          this.log('Token expired, attempting refresh...');
          const refreshed = await this.refreshTokens();
          if (refreshed) {
            // Retry the request with new token
            return this.request({ ...config, skipRetry: true });
          }
        }

        // Parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        const apiError = this.handleApiError(response, errorData);
        throw apiError;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        const errorObj = error as any;
        if (
          errorObj?.name === 'AbortError' ||
          errorObj?.status === 400 ||
          errorObj?.status === 404 ||
          skipRetry ||
          attempt === maxRetries
        ) {
          break;
        }

        // Wait before retry
        if (attempt < maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          this.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError!;
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string, 
    params?: Record<string, any>, 
    options: RequestOptions = {}
  ): Promise<T> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const fullUrl = searchParams.toString() ? `${url}?${searchParams}` : url;

    return this.request({
      url: fullUrl,
      method: 'GET',
      signal: options.signal,
      timeout: options.timeout,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string, 
    data?: any, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request({
      url,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      signal: options.signal,
      timeout: options.timeout,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string, 
    data?: any, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request({
      url,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      signal: options.signal,
      timeout: options.timeout,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string, 
    data?: any, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request({
      url,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      signal: options.signal,
      timeout: options.timeout,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request({
      url,
      method: 'DELETE',
      signal: options.signal,
      timeout: options.timeout,
    });
  }

  /**
   * Upload file
   */
  async upload<T = any>(
    url: string, 
    file: any, 
    fieldName = 'file',
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers = await this.createHeaders();
    delete headers['Content-Type']; // Let the browser set the boundary

    return this.request({
      url,
      method: 'POST',
      body: formData,
      headers,
    });
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Export utility function for API Platform collection responses
export const extractHydraCollection = <T>(response: PaginatedResponse<T>): T[] => {
  return response['hydra:member'] || [];
};

export const getHydraTotalItems = <T>(response: PaginatedResponse<T>): number => {
  return response['hydra:totalItems'] || 0;
};