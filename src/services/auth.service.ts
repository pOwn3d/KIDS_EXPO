import { User, LoginRequest, LoginResponse, RegisterRequest, RegisterWithInvitationRequest } from '../types/api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api/client';
import { API_ENDPOINTS, API_URL } from '../config/api.config';

class AuthService {
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user_data';

  /**
   * Connexion parent avec email/password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email, // Backend expects 'email' field
          password: credentials.password
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
          },
        }
      );
      
      
      // Handle both direct response and nested data response
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;
      
      if (token) {
        // Sauvegarder le token sous les deux clés pour compatibilité
        await this.saveToken(token);
        await AsyncStorage.setItem('access_token', token);
        
        if (user) {
          await this.saveUser(user);
        }
        
        const refreshToken = response.data?.refreshToken || response.refreshToken;
        if (refreshToken) {
          await this.saveRefreshToken(refreshToken);
        }
        
        // Return normalized response structure
        return {
          user,
          token,
          refreshToken
        };
      }
      
      throw new Error('Login failed - no token received');
    } catch (error: any) {
      
      // Handle API Platform error format
      if (error.response?.data?.['hydra:description']) {
        throw new Error(error.response.data['hydra:description']);
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Login failed');
    }
  }

  /**
   * Connexion enfant via compte parent
   */
  async loginChild(parentEmail: string, childId: string, pin: string): Promise<LoginResponse> {
    try {
      
      // D'abord vérifier le PIN
      const pinResponse = await apiClient.post<{ valid: boolean; token?: string }>(
        API_ENDPOINTS.AUTH.VERIFY_PIN,
        {
          email: parentEmail,
          pin: pin
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
          },
        }
      );
      
      if (!pinResponse.valid || !pinResponse.token) {
        throw new Error('Invalid PIN');
      }
      
      // Ensuite sélectionner l'enfant
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.CHILDREN.SELECT(childId),
        {},
        {
          headers: {
            Authorization: `Bearer ${pinResponse.token}`,
            'Content-Type': 'application/ld+json',
          }
        }
      );
      
      
      if (response.token) {
        const token = response.token;
        await this.saveToken(token);
        await AsyncStorage.setItem('access_token', token);
        
        if (response.user) {
          await this.saveUser(response.user);
        }
        
        if (response.refreshToken) {
          await this.saveRefreshToken(response.refreshToken);
        }
        
        return response;
      }
      
      throw new Error('Failed to select child - no token received');
    } catch (error: any) {
      
      if (error.response?.data?.['hydra:description']) {
        throw new Error(error.response.data['hydra:description']);
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Child login failed');
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
      
      const response = await apiClient.post<{ valid: boolean }>(
        API_ENDPOINTS.AUTH.VERIFY_PIN,
        {
          email: currentUser.email,
          pin: pin
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
          },
        }
      );
      
      return response.valid === true;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Définir ou modifier le PIN parent
   */
  async setParentPin(pin: string, oldPin?: string): Promise<boolean> {
    try {
      
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await apiClient.post<{ success: boolean }>(
        API_ENDPOINTS.AUTH.SET_PIN,
        {
          pin: pin,
          oldPin: oldPin
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/ld+json',
          }
        }
      );
      
      return response.success === true;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Valider un token d'invitation
   */
  async validateInvitationToken(token: string): Promise<{ valid: boolean; message?: string }> {
    try {
      
      const response = await apiClient.post<{ valid: boolean; message?: string }>(
        API_ENDPOINTS.AUTH.VALIDATE_INVITATION,
        { token },
        {
          headers: {
            'Content-Type': 'application/ld+json',
          },
        }
      );
      
      return response;
    } catch (error: any) {
      
      if (error.response?.data?.['hydra:description']) {
        return { valid: false, message: error.response.data['hydra:description'] };
      }
      
      return { 
        valid: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Invalid invitation token' 
      };
    }
  }

  /**
   * Inscription avec token d'invitation (système d'onboarding)
   */
  async registerWithInvitation(data: RegisterWithInvitationRequest): Promise<LoginResponse> {
    try {
      
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.REGISTER_WITH_INVITATION,
        {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          invitationToken: data.invitationToken
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
          },
        }
      );
      
      
      if (response.token) {
        await this.saveToken(response.token);
        await AsyncStorage.setItem('access_token', response.token);
        
        if (response.user) {
          await this.saveUser(response.user);
        }
        
        if (response.refreshToken) {
          await this.saveRefreshToken(response.refreshToken);
        }
        
        return response;
      }
      
      throw new Error('Registration failed - no token received');
    } catch (error: any) {
      
      if (error.response?.data?.['hydra:description']) {
        throw new Error(error.response.data['hydra:description']);
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Registration failed');
    }
  }

  /**
   * Inscription normale (sans invitation) - mode démo ou développement
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
          },
        }
      );
      
      
      if (response.token) {
        await this.saveToken(response.token);
        await AsyncStorage.setItem('access_token', response.token);
        
        if (response.user) {
          await this.saveUser(response.user);
        }
        
        if (response.refreshToken) {
          await this.saveRefreshToken(response.refreshToken);
        }
        
        return response;
      }
      
      throw new Error('Registration failed - no token received');
    } catch (error: any) {
      
      if (error.response?.data?.['hydra:description']) {
        throw new Error(error.response.data['hydra:description']);
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Registration failed');
    }
  }

  /**
   * Rafraîchir le token JWT
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refresh_token: refreshToken },
        {
          headers: {
            'Content-Type': 'application/ld+json',
            Authorization: `Bearer ${refreshToken}`
          }
        }
      );
      
      
      if (response.token) {
        await this.saveToken(response.token);
        await AsyncStorage.setItem('access_token', response.token);
        
        if (response.refreshToken) {
          await this.saveRefreshToken(response.refreshToken);
        }
        
        return response;
      }
      
      throw new Error('Token refresh failed - no token received');
    } catch (error: any) {
      
      if (error.response?.data?.['hydra:description']) {
        throw new Error(error.response.data['hydra:description']);
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Token refresh failed');
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
        await apiClient.post(
          API_ENDPOINTS.AUTH.LOGOUT,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/ld+json',
            }
          }
        ).catch((error) => {
          // Ignorer les erreurs de logout côté serveur mais les logger
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
    }
  }

  /**
   * Sauvegarder le refresh token
   */
  private async saveRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.refreshTokenKey, refreshToken);
    } catch (error) {
    }
  }

  /**
   * Sauvegarder les données utilisateur
   */
  private async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
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
    }
  }
}

export const authService = new AuthService();