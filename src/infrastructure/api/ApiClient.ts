/**
 * Unified API Client
 * Modern implementation with interceptors, retry logic, and caching
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Error schema
const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

// Request config with retry
interface ExtendedRequestConfig extends AxiosRequestConfig {
  retry?: boolean;
  retryCount?: number;
  cache?: boolean;
  cacheTime?: number;
}

/**
 * Modern API Client with best practices
 */
export class ApiClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes default

  constructor() {
    this.cache = new Map();
    
    // Create axios instance
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        const token = await this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Wrap successful responses
        return {
          ...response,
          data: {
            data: response.data,
            success: true,
            timestamp: new Date(),
          },
        };
      },
      async (error: AxiosError) => {
        // Handle errors with retry logic
        const config = error.config as ExtendedRequestConfig;
        
        // Token refresh logic
        if (error.response?.status === 401 && !config._retry) {
          config._retry = true;
          const newToken = await this.refreshAuthToken();
          if (newToken) {
            config.headers!.Authorization = `Bearer ${newToken}`;
            return this.client(config);
          }
        }

        // Retry logic for network errors
        if (config?.retry !== false && !config?.retryCount) {
          config.retryCount = 0;
        }

        if (
          config?.retry !== false &&
          config.retryCount! < MAX_RETRIES &&
          this.shouldRetry(error)
        ) {
          config.retryCount!++;
          await this.delay(RETRY_DELAY * config.retryCount!);
          return this.client(config);
        }

        // Format error response
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * GET request with caching
   */
  async get<T>(url: string, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    // Check cache if enabled
    if (config?.cache !== false) {
      const cached = this.getFromCache(url);
      if (cached) {
        return {
          data: cached,
          success: true,
          timestamp: new Date(),
        };
      }
    }

    const response = await this.client.get<ApiResponse<T>>(url, config);
    
    // Cache the response if caching is enabled
    if (config?.cache !== false) {
      this.addToCache(url, response.data.data, config?.cacheTime);
    }

    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * Get stored authentication token
   */
  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshAuthToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await this.post<{ accessToken: string }>('/auth/refresh', {
        refreshToken,
      });

      if (response.success && response.data.accessToken) {
        await AsyncStorage.setItem('accessToken', response.data.accessToken);
        return response.data.accessToken;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on 5xx errors (server errors)
    if (error.response.status >= 500) {
      return true;
    }

    // Retry on specific 4xx errors
    const retryableCodes = [408, 429]; // Request Timeout, Too Many Requests
    if (retryableCodes.includes(error.response.status)) {
      return true;
    }

    return false;
  }

  /**
   * Format error for consistent error handling
   */
  private formatError(error: AxiosError): ApiError {
    if (error.response?.data) {
      try {
        return ApiErrorSchema.parse(error.response.data);
      } catch {
        // If error doesn't match schema, create a default one
      }
    }

    return {
      message: error.message || 'An unexpected error occurred',
      code: error.code,
      details: error.response?.data,
    };
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get data from cache
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      // Remove expired cache
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Add data to cache
   */
  private addToCache(key: string, data: any, cacheTime?: number): void {
    const timeout = cacheTime || this.cacheTimeout;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Auto-clear cache after timeout
    setTimeout(() => {
      this.cache.delete(key);
    }, timeout);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set default headers
   */
  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  /**
   * Remove header
   */
  removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }
}

// Export singleton instance
export const apiClient = new ApiClient();