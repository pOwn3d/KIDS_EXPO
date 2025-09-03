/**
 * React Query Configuration
 * Optimized for React Native with smart caching
 */

import { QueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// Create query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache time: 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on network reconnect
      refetchOnReconnect: true,
      
      // Don't refetch on window focus for mobile
      refetchOnWindowFocus: false,
    },
    
    mutations: {
      // Retry mutations once
      retry: 1,
      
      // Network mode
      networkMode: 'online',
    },
  },
});

// Network state management
let isOnline = true;

NetInfo.addEventListener(state => {
  const wasOnline = isOnline;
  isOnline = state.isConnected ?? false;
  
  // Refetch all queries when coming back online
  if (!wasOnline && isOnline) {
    queryClient.refetchQueries();
  }
});

// Query keys factory for type safety
export const queryKeys = {
  all: ['app'] as const,
  
  auth: {
    all: ['auth'] as const,
    user: () => ['auth', 'user'] as const,
    session: () => ['auth', 'session'] as const,
  },
  
  children: {
    all: ['children'] as const,
    lists: () => ['children', 'list'] as const,
    list: (filters?: any) => ['children', 'list', filters] as const,
    details: () => ['children', 'details'] as const,
    detail: (id: number) => ['children', 'details', id] as const,
    stats: (id: number) => ['children', 'stats', id] as const,
  },
  
  missions: {
    all: ['missions'] as const,
    lists: () => ['missions', 'list'] as const,
    list: (filters?: any) => ['missions', 'list', filters] as const,
    details: () => ['missions', 'details'] as const,
    detail: (id: number) => ['missions', 'details', id] as const,
    validations: () => ['missions', 'validations'] as const,
    byChild: (childId: number) => ['missions', 'child', childId] as const,
  },
  
  rewards: {
    all: ['rewards'] as const,
    lists: () => ['rewards', 'list'] as const,
    list: (filters?: any) => ['rewards', 'list', filters] as const,
    details: () => ['rewards', 'details'] as const,
    detail: (id: number) => ['rewards', 'details', id] as const,
    claims: () => ['rewards', 'claims'] as const,
    claimsByChild: (childId: number) => ['rewards', 'claims', childId] as const,
  },
  
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => ['dashboard', 'stats'] as const,
    activities: () => ['dashboard', 'activities'] as const,
  },
} as const;

// Mutation keys factory
export const mutationKeys = {
  auth: {
    login: ['auth', 'login'] as const,
    logout: ['auth', 'logout'] as const,
    register: ['auth', 'register'] as const,
    refreshToken: ['auth', 'refresh'] as const,
  },
  
  children: {
    create: ['children', 'create'] as const,
    update: ['children', 'update'] as const,
    delete: ['children', 'delete'] as const,
    addPoints: ['children', 'addPoints'] as const,
    deductPoints: ['children', 'deductPoints'] as const,
  },
  
  missions: {
    create: ['missions', 'create'] as const,
    update: ['missions', 'update'] as const,
    delete: ['missions', 'delete'] as const,
    complete: ['missions', 'complete'] as const,
    validate: ['missions', 'validate'] as const,
    reject: ['missions', 'reject'] as const,
  },
  
  rewards: {
    create: ['rewards', 'create'] as const,
    update: ['rewards', 'update'] as const,
    delete: ['rewards', 'delete'] as const,
    claim: ['rewards', 'claim'] as const,
    approveClaim: ['rewards', 'approveClaim'] as const,
    rejectClaim: ['rewards', 'rejectClaim'] as const,
  },
} as const;