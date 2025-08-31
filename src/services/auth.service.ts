import { User, LoginRequest, LoginResponse, RegisterRequest } from '../types/auth.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiClient from './api.interceptor';

// Backend API URL - À configurer selon l'environnement
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

class AuthService {
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user_data';

  /**
   * Connexion parent avec email/password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Login response:', {
        success: response.data.success,
        hasUser: !!response.data.data?.user,
        hasToken: !!response.data.data?.token
      });
      
      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const user = response.data.data.user;
        
        // Sauvegarder le token sous les deux clés pour compatibilité
        await this.saveToken(token);
        await AsyncStorage.setItem('access_token', token);
        
        if (user) {
          await this.saveUser(user);
        }
        
        if (response.data.data.refreshToken) {
          await this.saveRefreshToken(response.data.data.refreshToken);
        }
        
        return {
          user: user,
          token: token,
          refreshToken: response.data.data.refreshToken,
          sessionExpiry: response.data.data.expiresIn ? 
            new Date(Date.now() + response.data.data.expiresIn * 1000).toISOString() : 
            undefined
        };
      }
      
      throw new Error(response.data.error?.message || response.data.message || 'Login failed');
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      // Gérer le nouveau format d'erreur
      if (error.response?.data?.success === false) {
        const errorMsg = error.response.data.error?.message || error.response.data.message || 'Login failed';
        throw new Error(errorMsg);
      }
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  /**
   * Connexion enfant via compte parent
   */
  async loginChild(parentEmail: string, childId: string, pin: string): Promise<LoginResponse> {
    try {
      // D'abord vérifier le PIN
      const pinResponse = await axios.post(`${API_URL}/api/auth/verify-pin`, {
        email: parentEmail,
        pin: pin
      });
      
      if (!pinResponse.data.success) {
        throw new Error('Invalid PIN');
      }
      
      // Ensuite sélectionner l'enfant
      const response = await axios.post(
        `${API_URL}/api/children/${childId}/select`,
        {},
        {
          headers: {
            Authorization: `Bearer ${pinResponse.data.data.token}`
          }
        }
      );
      
      if (response.data.success) {
        const token = response.data.data.token || pinResponse.data.data.token;
        await this.saveToken(token);
        await this.saveUser(response.data.data.child);
        
        return {
          user: response.data.data.child,
          token: token,
          refreshToken: response.data.data.refreshToken,
          sessionExpiry: response.data.data.expiresIn ? 
            new Date(Date.now() + response.data.data.expiresIn * 1000).toISOString() : 
            undefined
        };
      }
      
      throw new Error('Failed to select child');
    } catch (error: any) {
      console.error('Child login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Child login failed');
    }
  }

  /**
   * Valider le PIN parent pour les actions sensibles
   */
  async validateParentPin(pin: string): Promise<boolean> {
    try {
      // Récupérer l'email de l'utilisateur actuel
      const currentUser = await this.getCurrentUser();
      if (!currentUser?.email) {
        throw new Error('No user logged in');
      }
      
      const response = await axios.post(`${API_URL}/api/auth/verify-pin`, {
        email: currentUser.email,
        pin: pin
      });
      
      return response.data.success === true;
    } catch (error) {
      console.error('PIN validation error:', error);
      return false;
    }
  }

  /**
   * Définir ou modifier le PIN parent
   */
  async setParentPin(pin: string, oldPin?: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      const response = await axios.post(
        `${API_URL}/api/auth/set-pin`,
        {
          pin: pin,
          oldPin: oldPin
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data.success === true;
    } catch (error) {
      console.error('Set PIN error:', error);
      return false;
    }
  }

  /**
   * Inscription nouveau parent
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, data);
      
      if (response.data.success && response.data.data.token) {
        await this.saveToken(response.data.data.token);
        await this.saveUser(response.data.data.user);
        
        return {
          user: response.data.data.user,
          token: response.data.data.token,
          refreshToken: response.data.data.refreshToken,
          sessionExpiry: response.data.data.expiresIn ? 
            new Date(Date.now() + response.data.data.expiresIn * 1000).toISOString() : 
            undefined
        };
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  }

  /**
   * Rafraîchir le token JWT
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`
          }
        }
      );
      
      if (response.data.success) {
        await this.saveToken(response.data.data.token);
        
        return {
          user: await this.getCurrentUser(),
          token: response.data.data.token,
          refreshToken: response.data.data.refreshToken,
          sessionExpiry: response.data.data.expiresIn ? 
            new Date(Date.now() + response.data.data.expiresIn * 1000).toISOString() : 
            undefined
        };
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        // Appeler l'API de logout si elle existe
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        ).catch(() => {
          // Ignorer les erreurs de logout côté serveur
        });
      }
    } finally {
      // Toujours nettoyer le stockage local
      await this.clearStorage();
    }
  }

  /**
   * Récupérer l'utilisateur actuel depuis le stockage
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Vérifier si un token valide existe
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Récupérer le token JWT
   */
  async getToken(): Promise<string | null> {
    try {
      // Essayer d'abord auth_token puis access_token
      let token = await AsyncStorage.getItem(this.tokenKey);
      if (!token) {
        token = await AsyncStorage.getItem('access_token');
      }
      return token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  /**
   * Sauvegarder le token JWT
   */
  private async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Save token error:', error);
    }
  }

  /**
   * Sauvegarder le refresh token
   */
  private async saveRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.refreshTokenKey, refreshToken);
    } catch (error) {
      console.error('Save refresh token error:', error);
    }
  }

  /**
   * Sauvegarder les données utilisateur
   */
  private async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Save user error:', error);
    }
  }

  /**
   * Nettoyer tout le stockage (déconnexion)
   */
  private async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.tokenKey,
        this.refreshTokenKey,
        this.userKey,
        'access_token'  // Aussi nettoyer access_token
      ]);
    } catch (error) {
      console.error('Clear storage error:', error);
    }
  }
}

export const authService = new AuthService();