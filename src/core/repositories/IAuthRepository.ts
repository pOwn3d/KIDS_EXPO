/**
 * Authentication Repository Interface
 * Defines the contract for authentication data access
 */

import { UserEntity } from '../entities/User';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'PARENT' | 'CHILD';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface IAuthRepository {
  /**
   * Authenticate user with credentials
   */
  login(credentials: LoginCredentials): Promise<{ user: UserEntity; tokens: AuthTokens }>;
  
  /**
   * Register a new user
   */
  register(data: RegisterData): Promise<{ user: UserEntity; tokens: AuthTokens }>;
  
  /**
   * Logout the current user
   */
  logout(): Promise<void>;
  
  /**
   * Refresh authentication tokens
   */
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  
  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<UserEntity | null>;
  
  /**
   * Validate parent PIN
   */
  validateParentPin(pin: string): Promise<boolean>;
  
  /**
   * Update parent PIN
   */
  updateParentPin(newPin: string): Promise<void>;
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;
  
  /**
   * Get stored tokens
   */
  getTokens(): Promise<AuthTokens | null>;
  
  /**
   * Store tokens locally
   */
  storeTokens(tokens: AuthTokens): Promise<void>;
  
  /**
   * Clear stored tokens
   */
  clearTokens(): Promise<void>;
}