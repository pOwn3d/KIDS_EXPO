/**
 * Auth Repository Implementation
 * Concrete implementation of IAuthRepository
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAuthRepository, LoginCredentials, RegisterData, AuthTokens } from '../../core/repositories/IAuthRepository';
import { UserEntity } from '../../core/entities/User';
import { apiClient } from '../api/ApiClient';

export class AuthRepository implements IAuthRepository {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'currentUser';
  private readonly PIN_KEY = 'parentPin';

  async login(credentials: LoginCredentials): Promise<{ user: UserEntity; tokens: AuthTokens }> {
    const response = await apiClient.post<{
      user: any;
      token: string;
      refreshToken?: string;
      expiresIn: number;
    }>('/v1/login', {
      email: credentials.email,
      password: credentials.password,
    });

    const user = UserEntity.fromJSON(response.data.user);
    const tokens: AuthTokens = {
      accessToken: response.data.token,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn || 3600,
    };

    // Store user data locally
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user.toJSON()));

    return { user, tokens };
  }

  async register(data: RegisterData): Promise<{ user: UserEntity; tokens: AuthTokens }> {
    const response = await apiClient.post<{
      user: any;
      token: string;
      refreshToken?: string;
      expiresIn: number;
    }>('/v1/register', {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    });

    const user = UserEntity.fromJSON(response.data.user);
    const tokens: AuthTokens = {
      accessToken: response.data.token,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn || 3600,
    };

    // Store user data locally
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user.toJSON()));

    return { user, tokens };
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await apiClient.post('/v1/logout');
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage
      await this.clearTokens();
      await AsyncStorage.removeItem(this.USER_KEY);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<{
      token: string;
      refreshToken?: string;
      expiresIn: number;
    }>('/v1/auth/refresh', {
      refreshToken,
    });

    return {
      accessToken: response.data.token,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn || 3600,
    };
  }

  async getCurrentUser(): Promise<UserEntity | null> {
    try {
      // First try to get from local storage
      const storedUser = await AsyncStorage.getItem(this.USER_KEY);
      if (storedUser) {
        return UserEntity.fromJSON(JSON.parse(storedUser));
      }

      // If not in storage, fetch from API
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (!token) {
        return null;
      }

      const response = await apiClient.get<any>('/v1/me');
      const user = UserEntity.fromJSON(response.data);
      
      // Store for future use
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user.toJSON()));
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async validateParentPin(pin: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ valid: boolean }>('/v1/validate-pin', {
        pin,
      });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  async updateParentPin(newPin: string): Promise<void> {
    await apiClient.put('/v1/update-pin', {
      pin: newPin,
    });
    
    // Store locally for offline validation
    await AsyncStorage.setItem(this.PIN_KEY, newPin);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  async getTokens(): Promise<AuthTokens | null> {
    try {
      const accessToken = await AsyncStorage.getItem(this.TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
      
      if (!accessToken) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresIn: 3600, // Default value
      };
    } catch (error) {
      return null;
    }
  }

  async storeTokens(tokens: AuthTokens): Promise<void> {
    await AsyncStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    
    // Set token in API client
    apiClient.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
  }

  async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
    await AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY);
    
    // Remove token from API client
    apiClient.removeHeader('Authorization');
  }
}

// Export singleton instance
export const authRepository = new AuthRepository();