import { apiClient } from './client';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  User 
} from '../../types/api';
import { RequestOptions } from '../../types/api';

/**
 * Authentication service for handling login, logout, and token management
 */
export class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest, options?: RequestOptions): Promise<LoginResponse> {
    const response = await apiClient.post<any>(
      '/auth/login',
      credentials,
      options
    );

    // Handle the nested response structure from the API
    const loginResponse: LoginResponse = {
      token: response.data?.token || response.token,
      refreshToken: response.data?.refreshToken || response.data?.token || response.token,
      user: response.data?.user || response.user
    };

    // Store tokens - handle missing refreshToken
    await apiClient.setTokens(loginResponse.token, loginResponse.refreshToken);

    return loginResponse;
  }

  /**
   * Login as child with PIN
   */
  async loginChild(parentEmail: string, childId: string, pin: string, options?: RequestOptions): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login/child',
      {
        parentEmail,
        childId,
        pin,
      },
      options
    );

    await apiClient.setTokens(response.token, response.refreshToken);
    return response;
  }

  /**
   * Register new parent account
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
  }, options?: RequestOptions): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/auth/register',
      userData,
      options
    );

    await apiClient.setTokens(response.token, response.refreshToken);
    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if server call fails
      console.warn('Server logout failed, proceeding with local logout:', error);
    } finally {
      // Clear local tokens
      await apiClient.clearTokens();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string, options?: RequestOptions): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/auth/refresh',
      { refreshToken } as RefreshTokenRequest,
      options
    );

    await apiClient.setTokens(response.token, response.refreshToken);
    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(options?: RequestOptions): Promise<User> {
    return apiClient.get<User>('/auth/me', undefined, options);
  }

  /**
   * Forgot password request
   */
  async forgotPassword(email: string, options?: RequestOptions): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/forgot-password',
      { email },
      options
    );
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string, options?: RequestOptions): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/reset-password',
      {
        token,
        password: newPassword,
      },
      options
    );
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    currentPassword: string, 
    newPassword: string, 
    options?: RequestOptions
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/change-password',
      {
        currentPassword,
        newPassword,
      },
      options
    );
  }

  /**
   * Verify parent PIN for sensitive operations
   */
  async verifyParentPin(pin: string, options?: RequestOptions): Promise<{ valid: boolean; validUntil: string }> {
    return apiClient.post<{ valid: boolean; validUntil: string }>(
      '/auth/verify-pin',
      { pin },
      options
    );
  }

  /**
   * Set or update parent PIN
   */
  async setParentPin(currentPassword: string, pin: string, options?: RequestOptions): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/set-pin',
      {
        currentPassword,
        pin,
      },
      options
    );
  }

  /**
   * Enable/disable biometric authentication
   */
  async setBiometricAuth(enabled: boolean, options?: RequestOptions): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/biometric',
      { enabled },
      options
    );
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string, options?: RequestOptions): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/verify-email',
      { token },
      options
    );
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(options?: RequestOptions): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/resend-verification',
      {},
      options
    );
  }

  /**
   * Get all active sessions
   */
  async getActiveSessions(options?: RequestOptions): Promise<Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>> {
    return apiClient.get('/auth/sessions', undefined, options);
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string, options?: RequestOptions): Promise<{ message: string }> {
    return apiClient.delete(`/auth/sessions/${sessionId}`, options);
  }

  /**
   * Revoke all other sessions (keep current)
   */
  async revokeAllOtherSessions(options?: RequestOptions): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/revoke-all-sessions',
      {},
      options
    );
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate session and refresh if needed
   */
  async validateSession(): Promise<User | null> {
    try {
      return await this.getCurrentUser();
    } catch (error) {
      // If error is 401, token might be expired, try refresh
      if ((error as any).status === 401) {
        try {
          const refreshToken = await this.getStoredRefreshToken();
          if (refreshToken) {
            const response = await this.refreshToken(refreshToken);
            return response.user;
          }
        } catch (refreshError) {
          // Refresh failed, user needs to login again
          await this.logout();
          return null;
        }
      }
      throw error;
    }
  }

  /**
   * Get stored refresh token (private helper)
   */
  private async getStoredRefreshToken(): Promise<string | null> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return await AsyncStorage.default.getItem('refresh_token');
    } catch (error) {
      return null;
    }
  }
}

// Create singleton instance
export const authService = new AuthService();