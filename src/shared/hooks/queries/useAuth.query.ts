/**
 * Auth React Query Hooks
 * Server state management for authentication
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, mutationKeys } from '../../../infrastructure/api/queryClient';
import { apiClient } from '../../../infrastructure/api/ApiClient';
import { useAuthStore } from '../../../presentation/store/authStore';
import { UserEntity } from '../../../core/entities/User';
import Toast from 'react-native-toast-message';

// Login mutation
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { login: setAuthState } = useAuthStore();
  
  return useMutation({
    mutationKey: mutationKeys.auth.login,
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiClient.post<{
        user: any;
        accessToken: string;
        refreshToken?: string;
      }>('/auth/login', credentials);
      
      return {
        user: UserEntity.fromJSON(response.data.user),
        tokens: {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        },
      };
    },
    onSuccess: ({ user, tokens }) => {
      // Update Zustand store
      setAuthState(user, tokens);
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.setQueryData(queryKeys.auth.user(), user);
      
      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: `Bienvenue ${user.firstName} !`,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Échec de connexion',
        text2: error.message || 'Vérifiez vos identifiants',
      });
    },
  });
}

// Logout mutation
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { logout: clearAuthState } = useAuthStore();
  
  return useMutation({
    mutationKey: mutationKeys.auth.logout,
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      // Clear Zustand store
      clearAuthState();
      
      // Clear all cached queries
      queryClient.clear();
      
      Toast.show({
        type: 'success',
        text1: 'Déconnexion réussie',
      });
    },
    onSettled: () => {
      // Always clear auth state even on error
      clearAuthState();
      queryClient.clear();
    },
  });
}

// Get current user query
export function useCurrentUser() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const response = await apiClient.get<any>('/auth/me');
      return UserEntity.fromJSON(response.data);
    },
    enabled: !!user, // Only fetch if user is logged in
    initialData: user || undefined,
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes
  });
}

// Validate session query
export function useValidateSession() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: async () => {
      const response = await apiClient.get<{ valid: boolean }>('/auth/validate');
      return response.data.valid;
    },
    enabled: isAuthenticated,
    refetchInterval: 5 * 60 * 1000, // Revalidate every 5 minutes
    refetchIntervalInBackground: true,
  });
}

// Register mutation
export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const { login: setAuthState } = useAuthStore();
  
  return useMutation({
    mutationKey: mutationKeys.auth.register,
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: 'PARENT' | 'CHILD';
    }) => {
      const response = await apiClient.post<{
        user: any;
        accessToken: string;
        refreshToken?: string;
      }>('/auth/register', data);
      
      return {
        user: UserEntity.fromJSON(response.data.user),
        tokens: {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        },
      };
    },
    onSuccess: ({ user, tokens }) => {
      // Update Zustand store
      setAuthState(user, tokens);
      
      // Set user in cache
      queryClient.setQueryData(queryKeys.auth.user(), user);
      
      Toast.show({
        type: 'success',
        text1: 'Inscription réussie',
        text2: 'Votre compte a été créé avec succès',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Échec de l\'inscription',
        text2: error.message || 'Une erreur est survenue',
      });
    },
  });
}