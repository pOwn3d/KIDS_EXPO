/**
 * Configuration centralisée de l'API
 */

// URL de l'API backend
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Age groups for API categorization
export const AGE_GROUPS = {
  TODDLER: '3-5',      // Petite enfance
  CHILD: '6-8',        // Enfance  
  PRETEEN: '9-12',     // Pré-adolescence
  TEEN: '13-17',       // Adolescence
} as const;

export type AgeGroup = typeof AGE_GROUPS[keyof typeof AGE_GROUPS];

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REGISTER_WITH_INVITATION: '/api/auth/register/invitation',
    VALIDATE_INVITATION: '/api/auth/invitation/validate',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    VERIFY_PIN: '/api/auth/verify-pin',
    SET_PIN: '/api/auth/set-pin',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  
  // Children endpoints (API Platform format)
  CHILDREN: {
    LIST: '/api/children',
    GET: (id: string | number) => `/api/children/${id}`,
    CREATE: '/api/children',
    UPDATE: (id: string | number) => `/api/children/${id}`,
    DELETE: (id: string | number) => `/api/children/${id}`,
    SELECT: (id: string | number) => `/api/children/${id}/select`,
    STATS: (id: string | number) => `/api/children/${id}/stats`,
    STATISTICS: (id: string | number) => `/api/children/${id}/statistics`,
    ACTIVITIES: (id: string | number) => `/api/children/${id}/activities`,
    BADGES: (id: string | number) => `/api/children/${id}/badges`,
    ADD_POINTS: (id: string | number) => `/api/children/${id}/points`,
  },
  
  // Missions endpoints (API Platform format)
  MISSIONS: {
    LIST: '/api/missions',
    GET: (id: string | number) => `/api/missions/${id}`,
    CREATE: '/api/missions',
    UPDATE: (id: string | number) => `/api/missions/${id}`,
    DELETE: (id: string | number) => `/api/missions/${id}`,
    PATCH: (id: string | number) => `/api/missions/${id}`, // For status updates
    COMPLETE: (id: string | number) => `/api/missions/${id}/complete`,
    VALIDATE: (id: string | number) => `/api/missions/${id}/validate`,
    ASSIGN: (id: string | number) => `/api/missions/${id}/assign`,
    BY_CHILD: (childId: string | number) => `/api/missions?child=${childId}`,
    BY_STATUS: (status: string) => `/api/missions?status=${status}`,
    BY_CATEGORY: (category: string) => `/api/missions?category=${category}`,
  },
  
  // Rewards endpoints (API Platform format)
  REWARDS: {
    LIST: '/api/rewards',
    GET: (id: string | number) => `/api/rewards/${id}`,
    CREATE: '/api/rewards',
    UPDATE: (id: string | number) => `/api/rewards/${id}`,
    DELETE: (id: string | number) => `/api/rewards/${id}`,
    BY_CHILD: (childId: string | number) => `/api/rewards?child=${childId}`,
    BY_AVAILABLE: '/api/rewards?available=true',
    CLAIMS: {
      LIST: '/api/reward_claims',
      CREATE: '/api/reward_claims',
      GET: (id: string | number) => `/api/reward_claims/${id}`,
      UPDATE: (id: string | number) => `/api/reward_claims/${id}`,
      DELETE: (id: string | number) => `/api/reward_claims/${id}`,
    }
  },
  
  // Punishments endpoints (API Platform format)
  PUNISHMENTS: {
    LIST: '/api/punishments',
    GET: (id: string | number) => `/api/punishments/${id}`,
    CREATE: '/api/punishments',
    UPDATE: (id: string | number) => `/api/punishments/${id}`,
    DELETE: (id: string | number) => `/api/punishments/${id}`,
    APPLY: (id: string | number) => `/api/punishments/${id}/apply`,
    ACTIVE: (childId: string | number) => `/api/children/${childId}/punishments/active`,
    HISTORY: (childId: string | number) => `/api/children/${childId}/punishments/history`,
  },
  
  // Badges endpoints (API Platform format)
  BADGES: {
    LIST: '/api/badges',
    GET: (id: string | number) => `/api/badges/${id}`,
    CREATE: '/api/badges',
    UPDATE: (id: string | number) => `/api/badges/${id}`,
    DELETE: (id: string | number) => `/api/badges/${id}`,
  },
  
  // Activities endpoints (API Platform format)
  ACTIVITIES: {
    LIST: '/api/activities',
    GET: (id: string | number) => `/api/activities/${id}`,
    RECENT: '/api/activities/recent',
    BY_CHILD: (childId: string | number) => `/api/activities?child=${childId}`,
    BY_TYPE: (type: string) => `/api/activities?type=${type}`,
  },
  
  // Tournaments endpoints (API Platform format)
  TOURNAMENTS: {
    LIST: '/api/tournaments',
    GET: (id: string | number) => `/api/tournaments/${id}`,
    CREATE: '/api/tournaments',
    UPDATE: (id: string | number) => `/api/tournaments/${id}`,
    DELETE: (id: string | number) => `/api/tournaments/${id}`,
    JOIN: (id: string | number) => `/api/tournaments/${id}/join`,
    LEAVE: (id: string | number) => `/api/tournaments/${id}/leave`,
    LEADERBOARD: (id: string | number) => `/api/tournaments/${id}/leaderboard`,
    BY_STATUS: (status: string) => `/api/tournaments?status=${status}`,
  },
  
  // Guilds endpoints (API Platform format)
  GUILDS: {
    LIST: '/api/guilds',
    GET: (id: string | number) => `/api/guilds/${id}`,
    CREATE: '/api/guilds',
    UPDATE: (id: string | number) => `/api/guilds/${id}`,
    DELETE: (id: string | number) => `/api/guilds/${id}`,
    JOIN: (id: string | number) => `/api/guilds/${id}/join`,
    LEAVE: (id: string | number) => `/api/guilds/${id}/leave`,
    MEMBERS: (id: string | number) => `/api/guilds/${id}/members`,
    INVITE: (id: string | number) => `/api/guilds/${id}/invite`,
  },
  
  // Notifications endpoints (API Platform format)
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    GET: (id: string | number) => `/api/notifications/${id}`,
    UPDATE: (id: string | number) => `/api/notifications/${id}`, // For marking as read
    DELETE: (id: string | number) => `/api/notifications/${id}`,
    BY_READ_STATUS: (isRead: boolean) => `/api/notifications?isRead=${isRead}`,
    BY_TYPE: (type: string) => `/api/notifications?type=${type}`,
  },
  
  // Settings endpoints (Admin only)
  SETTINGS: {
    LIST: '/api/settings',
    GET: (id: string | number) => `/api/settings/${id}`,
    UPDATE: (id: string | number) => `/api/settings/${id}`,
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