/**
 * Auth Store - Zustand implementation
 * Modern state management with TypeScript
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserEntity } from '../../core/entities/User';

interface AuthState {
  // State
  user: UserEntity | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  parentSessionActive: boolean;
  parentSessionExpiry: Date | null;
  
  // Actions
  login: (user: UserEntity, tokens: { accessToken: string; refreshToken?: string }) => void;
  logout: () => void;
  setUser: (user: UserEntity | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Parent session management
  startParentSession: (duration?: number) => void;
  endParentSession: () => void;
  checkParentSession: () => boolean;
  extendParentSession: (minutes?: number) => void;
  
  // Token management
  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => void;
  clearTokens: () => void;
  hasValidToken: () => boolean;
  
  // Utilities
  reset: () => void;
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  parentSessionActive: false,
  parentSessionExpiry: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Login action
      login: (user, tokens) => {
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },
      
      // Logout action
      logout: () => {
        set(initialState);
      },
      
      // Set user
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
      
      // Loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      // Error management
      setError: (error) => {
        set({ error, isLoading: false });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // Parent session management
      startParentSession: (duration = 15) => {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + duration);
        set({
          parentSessionActive: true,
          parentSessionExpiry: expiry,
        });
      },
      
      endParentSession: () => {
        set({
          parentSessionActive: false,
          parentSessionExpiry: null,
        });
      },
      
      checkParentSession: () => {
        const state = get();
        if (!state.parentSessionActive || !state.parentSessionExpiry) {
          return false;
        }
        
        const now = new Date();
        if (now > state.parentSessionExpiry) {
          get().endParentSession();
          return false;
        }
        
        return true;
      },
      
      extendParentSession: (minutes = 15) => {
        const state = get();
        if (state.parentSessionActive && state.parentSessionExpiry) {
          const newExpiry = new Date(state.parentSessionExpiry);
          newExpiry.setMinutes(newExpiry.getMinutes() + minutes);
          set({ parentSessionExpiry: newExpiry });
        }
      },
      
      // Token management
      setTokens: (tokens) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || null,
        });
      },
      
      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
        });
      },
      
      hasValidToken: () => {
        return !!get().accessToken;
      },
      
      // Reset store
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectIsParent = (state: AuthState) => state.user?.isParent || false;
export const selectIsChild = (state: AuthState) => state.user?.isChild || false;
export const selectParentSessionActive = (state: AuthState) => state.parentSessionActive;