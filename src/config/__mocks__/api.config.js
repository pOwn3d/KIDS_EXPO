// Mock API configuration for testing
export const API_URL = 'https://api.test.com';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout', 
    REGISTER: '/auth/register',
    REGISTER_WITH_INVITATION: '/auth/register/invitation',
    REFRESH: '/auth/refresh',
    VERIFY_PIN: '/auth/verify-pin',
    SET_PIN: '/auth/set-pin',
    VALIDATE_INVITATION: '/auth/validate-invitation',
  },
  CHILDREN: {
    SELECT: (id) => `/children/${id}/select`,
  },
};