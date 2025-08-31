/**
 * Configuration centralisée de l'API
 */

// URL de l'API backend
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    VERIFY_PIN: '/api/auth/verify-pin',
    SET_PIN: '/api/auth/set-pin',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  
  // Children endpoints
  CHILDREN: {
    LIST: '/api/v1/children',
    GET: (id: string | number) => `/api/v1/children/${id}`,
    CREATE: '/api/v1/children',
    UPDATE: (id: string | number) => `/api/v1/children/${id}`,
    DELETE: (id: string | number) => `/api/v1/children/${id}`,
    SELECT: (id: string | number) => `/api/children/${id}/select`,
    STATS: (id: string | number) => `/api/v1/children/${id}/stats`,
  },
  
  // Missions endpoints
  MISSIONS: {
    LIST: '/api/missions',
    GET: (id: string | number) => `/api/missions/${id}`,
    CREATE: '/api/missions',
    UPDATE: (id: string | number) => `/api/missions/${id}`,
    DELETE: (id: string | number) => `/api/missions/${id}`,
    COMPLETE: (id: string | number) => `/api/missions/${id}/complete`,
    VALIDATE: (id: string | number) => `/api/missions/${id}/validate`,
    ASSIGN: (id: string | number) => `/api/missions/${id}/assign`,
  },
  
  // Rewards endpoints
  REWARDS: {
    LIST: '/api/rewards',
    AVAILABLE: '/api/rewards/available',
    GET: (id: string | number) => `/api/rewards/${id}`,
    CREATE: '/api/rewards',
    UPDATE: (id: string | number) => `/api/rewards/${id}`,
    DELETE: (id: string | number) => `/api/rewards/${id}`,
    CLAIM: (id: string | number) => `/api/rewards/${id}/claim`,
    CLAIMS: {
      LIST: '/api/rewards/claims',
      VALIDATE: (id: string | number) => `/api/rewards/claims/${id}/validate`,
      REJECT: (id: string | number) => `/api/rewards/claims/${id}/reject`,
    }
  },
  
  // Leaderboard endpoints
  LEADERBOARD: {
    LIST: '/api/leaderboard',
    STATS: '/api/leaderboard/stats',
  },
  
  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    GET: (id: string | number) => `/api/notifications/${id}`,
    MARK_READ: (id: string | number) => `/api/notifications/${id}`,
    MARK_ALL_READ: '/api/notifications/read-all',
    DELETE: (id: string | number) => `/api/notifications/${id}`,
    CLEAR_ALL: '/api/notifications',
  },
  
  // Dashboard endpoints
  DASHBOARD: {
    PARENT: '/api/v1/dashboard',
    PARENT_ACCOUNT: '/api/v1/parent/account',
    CHILD: (id: string | number) => `/api/dashboard/child/${id}`,
    RECENT_ACTIVITIES: '/api/dashboard/activities',
  },
  
  // Points endpoints
  POINTS: {
    HISTORY: (childId: string | number) => `/api/children/${childId}/points/history`,
    ADD: (childId: string | number) => `/api/children/${childId}/points/add`,
    REMOVE: (childId: string | number) => `/api/children/${childId}/points/remove`,
  },
};

// Headers par défaut
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Helper pour construire l'URL complète
export const buildApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
};

// Configuration des timeouts
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 secondes
  UPLOAD: 120000, // 2 minutes pour les uploads
  DOWNLOAD: 60000, // 1 minute pour les downloads
};

// Codes d'erreur personnalisés
export const API_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
};