import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  loginAsync,
  logoutAsync,
  registerAsync,
  registerWithInvitationAsync,
  validateInvitationTokenAsync,
  validateSessionAsync,
  clearError,
  setInvitationToken,
  clearInvitation,
} from '../store/slices/authSlice';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectInvitationToken,
  selectInvitationValid,
  selectInvitationData,
} from '../store/store';
import { LoginRequest } from '../types/api';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const invitationToken = useAppSelector(selectInvitationToken);
  const invitationValid = useAppSelector(selectInvitationValid);
  const invitationData = useAppSelector(selectInvitationData);

  // Actions
  const login = useCallback(async (credentials: LoginRequest) => {
    return dispatch(loginAsync(credentials)).unwrap();
  }, [dispatch]);

  const logout = useCallback(async () => {
    return dispatch(logoutAsync()).unwrap();
  }, [dispatch]);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
  }) => {
    return dispatch(registerAsync(userData)).unwrap();
  }, [dispatch]);

  const registerWithInvitation = useCallback(async (userData: {
    invitationToken: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
  }) => {
    return dispatch(registerWithInvitationAsync(userData)).unwrap();
  }, [dispatch]);

  const validateInvitationToken = useCallback(async (token: string) => {
    return dispatch(validateInvitationTokenAsync(token)).unwrap();
  }, [dispatch]);

  const validateSession = useCallback(async () => {
    return dispatch(validateSessionAsync()).unwrap();
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const setInvitationTokenAction = useCallback((token: string | null) => {
    dispatch(setInvitationToken(token));
  }, [dispatch]);

  const clearInvitationAction = useCallback(() => {
    dispatch(clearInvitation());
  }, [dispatch]);

  // Computed values - check both role and roles array
  const roles = user?.roles || [];
  const isParent = user?.role === 'PARENT' || roles.includes('ROLE_PARENT');
  const isChild = user?.role === 'CHILD' || roles.includes('ROLE_CHILD');
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '';

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    invitationToken,
    invitationValid,
    invitationData,
    isParent,
    isChild,
    userInitials,
    
    // Actions
    login,
    logout,
    register,
    registerWithInvitation,
    validateInvitationToken,
    validateSession,
    clearError: clearAuthError,
    setInvitationToken: setInvitationTokenAction,
    clearInvitation: clearInvitationAction,
  };
};