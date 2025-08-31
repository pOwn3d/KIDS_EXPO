import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './auth.service';
import { appEvents } from './events.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Créer une instance axios avec la configuration de base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag pour éviter les boucles infinies de refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

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

// Intercepteur de requête pour ajouter le token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Récupérer le token depuis AsyncStorage
    let token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      token = await AsyncStorage.getItem('access_token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs 401
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    
    // Si l'erreur est 401 et ce n'est pas déjà une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si on est déjà en train de rafraîchir, mettre la requête en queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Essayer de rafraîchir le token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (refreshToken) {
          const response = await authService.refreshToken(refreshToken);
          
          if (response.token) {
            // Sauvegarder le nouveau token
            await AsyncStorage.setItem('auth_token', response.token);
            await AsyncStorage.setItem('access_token', response.token);
            
            if (response.refreshToken) {
              await AsyncStorage.setItem('refresh_token', response.refreshToken);
            }
            
            // Traiter la queue des requêtes en attente
            processQueue(null, response.token);
            
            // Réessayer la requête originale
            originalRequest.headers.Authorization = `Bearer ${response.token}`;
            return apiClient(originalRequest);
          }
        }
        
        // Si pas de refresh token ou échec du refresh
        throw new Error('Token refresh failed');
        
      } catch (refreshError) {
        // En cas d'échec du refresh, nettoyer et rediriger vers login
        processQueue(refreshError, null);
        
        // Nettoyer le stockage
        await AsyncStorage.multiRemove([
          'auth_token',
          'access_token', 
          'refresh_token',
          'user_data'
        ]);
        
        // Émettre un événement de déconnexion
        appEvents.emitAuthLogout();
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Fonction helper pour obtenir les headers avec token
export const getAuthHeaders = async () => {
  let token = await AsyncStorage.getItem('auth_token');
  if (!token) {
    token = await AsyncStorage.getItem('access_token');
  }
  
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

// Fonction pour forcer le refresh du token
export const forceTokenRefresh = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await authService.refreshToken(refreshToken);
    
    if (response.token) {
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('access_token', response.token);
      
      if (response.refreshToken) {
        await AsyncStorage.setItem('refresh_token', response.refreshToken);
      }
      
      return response.token;
    }
    
    throw new Error('Token refresh failed');
  } catch (error) {
    console.error('Force token refresh error:', error);
    throw error;
  }
};