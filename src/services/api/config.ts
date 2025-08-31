import { Platform } from 'react-native';

// Backend API URL - Using local Symfony server
const getApiUrl = () => {
  if (__DEV__) {
    // Development URLs
    if (Platform.OS === 'web') {
      // For web, use localhost
      return 'http://localhost:8000/api';
    }
    // For mobile devices, you may need to use your machine's IP
    // Replace with your actual IP if testing on a real device
    return Platform.select({
      ios: 'http://localhost:8000/api',
      android: 'http://10.0.2.2:8000/api', // Android emulator localhost
      default: 'http://localhost:8000/api',
    });
  }
  
  // Production URL - to be configured
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/login_check',
    REGISTER: '/register',
    REFRESH: '/token/refresh',
    LOGOUT: '/logout',
    ME: '/me',
    VALIDATE_TOKEN: '/validate-token',
  },
  
  // Children
  CHILDREN: {
    LIST: '/children',
    DETAIL: (id: number) => `/children/${id}`,
    CREATE: '/children',
    UPDATE: (id: number) => `/children/${id}`,
    DELETE: (id: number) => `/children/${id}`,
    STATS: (id: number) => `/children/${id}/stats`,
  },
  
  // Missions
  MISSIONS: {
    LIST: '/missions',
    DETAIL: (id: number) => `/missions/${id}`,
    CREATE: '/missions',
    UPDATE: (id: number) => `/missions/${id}`,
    DELETE: (id: number) => `/missions/${id}`,
    COMPLETE: (id: number) => `/missions/${id}/complete`,
    VALIDATE: (id: number) => `/missions/${id}/validate`,
  },
  
  // Mission Completions (API Platform)
  MISSION_COMPLETIONS: {
    LIST: '/mission_completions',
    CREATE: '/mission_completions',
    UPDATE: (id: number) => `/mission_completions/${id}`,
  },
  
  // Mission Validations (API Platform)
  MISSION_VALIDATIONS: {
    LIST: '/mission_validations',
    CREATE: '/mission_validations',
    PENDING: '/mission_validations?status=pending',
    APPROVE: (id: number) => `/mission_validations/${id}/approve`,
    REJECT: (id: number) => `/mission_validations/${id}/reject`,
  },
  
  // Rewards
  REWARDS: {
    LIST: '/rewards',
    DETAIL: (id: number) => `/rewards/${id}`,
    CREATE: '/rewards',
    UPDATE: (id: number) => `/rewards/${id}`,
    DELETE: (id: number) => `/rewards/${id}`,
    CLAIM: (id: number) => `/rewards/${id}/claim`,
  },
  
  // Reward Claims (API Platform)
  REWARD_CLAIMS: {
    LIST: '/reward_claims',
    CREATE: '/reward_claims',
    VALIDATE: (id: number) => `/reward_claims/${id}/validate`,
    REJECT: (id: number) => `/reward_claims/${id}/reject`,
  },
  
  // Points
  POINTS: {
    HISTORY: '/points_histories',
    ADD: '/points_histories',
    CHILD_HISTORY: (childId: number) => `/points_histories?child=/api/children/${childId}`,
  },
  
  // Tournaments
  TOURNAMENTS: {
    LIST: '/tournaments',
    ACTIVE: '/tournaments?active=true',
    DETAIL: (id: number) => `/tournaments/${id}`,
    JOIN: '/tournament_participants',
    LEAVE: (id: number) => `/tournaments/${id}/leave`,
    RANKING: (id: number) => `/tournaments/${id}/ranking`,
  },
  
  // Guilds
  GUILDS: {
    LIST: '/guilds',
    DETAIL: (id: number) => `/guilds/${id}`,
    CREATE: '/guilds',
    JOIN: (id: number) => `/guilds/${id}/join`,
    LEAVE: (id: number) => `/guilds/${id}/leave`,
    MEMBERS: (id: number) => `/guilds/${id}/members`,
  },
  
  // Pets
  PETS: {
    LIST: '/pets',
    DETAIL: (id: number) => `/pets/${id}`,
    CREATE: '/pets',
    FEED: (id: number) => `/pets/${id}/feed`,
    PLAY: (id: number) => `/pets/${id}/play`,
    CLEAN: (id: number) => `/pets/${id}/clean`,
    SLEEP: (id: number) => `/pets/${id}/sleep`,
    EVOLVE: (id: number) => `/pets/${id}/evolve`,
  },
  
  // Badges
  BADGES: {
    LIST: '/badges',
    CHILD_BADGES: (childId: number) => `/badges?child=/api/children/${childId}`,
    UNLOCK: '/child_badges',
  },
  
  // Daily Wheel
  DAILY_WHEEL: {
    SPIN: '/daily_wheel_spins',
    STATUS: (childId: number) => `/daily_wheel_spins?child=/api/children/${childId}`,
    HISTORY: (childId: number) => `/daily_wheel_spins?child=/api/children/${childId}&order[spunAt]=desc`,
  },
  
  // Sparky AI
  SPARKY: {
    CHAT: '/sparky/chat',
    PERSONALITY: (childId: number) => `/sparky/personality/${childId}`,
    RECOMMENDATIONS: (childId: number) => `/sparky/recommendations/${childId}`,
  },
  
  // Statistics
  STATISTICS: {
    OVERVIEW: '/statistics',
    CHILD: (childId: number) => `/statistics/child/${childId}`,
    FAMILY: '/statistics/family',
    LEADERBOARD: '/statistics/leaderboard',
  },
  
  // Settings
  SETTINGS: {
    USER: '/user_settings',
    UPDATE: '/user_settings',
    THEMES: '/themes',
  },
};

// Headers configuration
export const getHeaders = (token?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Extract Hydra data helper
export const extractHydraData = (response: any) => {
  if (response && response['hydra:member']) {
    return response['hydra:member'];
  }
  return response;
};

// Format IRI helper (for API Platform relations)
export const formatIRI = (entity: string, id: number) => {
  return `/api/${entity}/${id}`;
};