import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../auth.service';
import { apiClient } from '../api/client';
import { LoginRequest, RegisterRequest, RegisterWithInvitationRequest } from '../../types/api/auth';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../api/client');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    // Mock console methods to avoid spam in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    const mockCredentials: LoginRequest = {
      email: 'parent@example.com',
      password: 'password123',
    };

    const mockLoginResponse = {
      token: 'jwt-token-123',
      refreshToken: 'refresh-token-123',
      user: {
        id: '1',
        email: 'parent@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'parent' as const,
        children: [],
      },
    };

    it('should login successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockLoginResponse);
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await authService.login(mockCredentials);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        {
          username: mockCredentials.email,
          password: mockCredentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
          },
        }
      );

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'jwt-token-123');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('access_token', 'jwt-token-123');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token-123');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockLoginResponse.user));

      expect(result).toEqual(mockLoginResponse);
    });

    it('should handle login failure', async () => {
      const errorResponse = {
        response: {
          data: {
            'hydra:description': 'Invalid credentials',
          },
        },
      };

      mockApiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.login(mockCredentials)).rejects.toThrow('Invalid credentials');
    });

    it('should handle login with no token', async () => {
      mockApiClient.post.mockResolvedValueOnce({ user: mockLoginResponse.user });

      await expect(authService.login(mockCredentials)).rejects.toThrow('Login failed - no token received');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('jwt-token-123');
      mockApiClient.post.mockResolvedValueOnce({});
      mockAsyncStorage.multiRemove.mockResolvedValue();

      await authService.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: 'Bearer jwt-token-123',
            'Content-Type': 'application/ld+json',
          },
        }
      );

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'auth_token',
        'refresh_token',
        'user_data',
        'access_token',
      ]);
    });

    it('should clear storage even if API call fails', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('jwt-token-123');
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));
      mockAsyncStorage.multiRemove.mockResolvedValue();

      await authService.logout();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when stored', async () => {
      const mockUser = {
        id: '1',
        email: 'parent@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'parent' as const,
        children: [],
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUser));

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('user_data');
    });

    it('should return null when no user stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should handle JSON parse error', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid-json');

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('jwt-token-123');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from auth_token key', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce('jwt-token-123') // auth_token
        .mockResolvedValueOnce('access-token-456'); // access_token (fallback)

      const result = await authService.getToken();

      expect(result).toBe('jwt-token-123');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('should fallback to access_token key', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // auth_token
        .mockResolvedValueOnce('access-token-456'); // access_token

      const result = await authService.getToken();

      expect(result).toBe('access-token-456');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_token');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('access_token');
    });

    it('should return null when no token exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await authService.getToken();

      expect(result).toBeNull();
    });

    it('should handle storage error', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const result = await authService.getToken();

      expect(result).toBeNull();
    });
  });

  describe('validateParentPin', () => {
    beforeEach(() => {
      // Mock getCurrentUser for PIN validation
      jest.spyOn(authService, 'getCurrentUser').mockResolvedValue({
        id: '1',
        email: 'parent@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'parent',
        children: [],
      });
    });

    it('should validate PIN successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce({ valid: true });

      const result = await authService.validateParentPin('1234');

      expect(result).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/verify-pin',
        {
          email: 'parent@example.com',
          pin: '1234',
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
          },
        }
      );
    });

    it('should return false for invalid PIN', async () => {
      mockApiClient.post.mockResolvedValueOnce({ valid: false });

      const result = await authService.validateParentPin('0000');

      expect(result).toBe(false);
    });

    it('should return false when no user logged in', async () => {
      jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(null);

      const result = await authService.validateParentPin('1234');

      expect(result).toBe(false);
    });

    it('should handle API error', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.validateParentPin('1234');

      expect(result).toBe(false);
    });
  });

  describe('register', () => {
    const mockRegisterData: RegisterRequest = {
      email: 'newparent@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
    };

    const mockRegisterResponse = {
      token: 'new-jwt-token',
      user: {
        id: '2',
        email: 'newparent@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'parent' as const,
        children: [],
      },
    };

    it('should register successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockRegisterResponse);
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await authService.register(mockRegisterData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/register',
        mockRegisterData,
        {
          headers: {
            'Content-Type': 'application/ld+json',
          },
        }
      );

      expect(result).toEqual(mockRegisterResponse);
    });

    it('should handle registration failure', async () => {
      const errorResponse = {
        response: {
          data: {
            'hydra:description': 'Email already exists',
          },
        },
      };

      mockApiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.register(mockRegisterData)).rejects.toThrow('Email already exists');
    });
  });

  describe('registerWithInvitation', () => {
    const mockInvitationData: RegisterWithInvitationRequest = {
      email: 'invited@example.com',
      password: 'password123',
      firstName: 'Invited',
      lastName: 'User',
      invitationToken: 'invitation-token-123',
    };

    it('should register with invitation successfully', async () => {
      const mockResponse = {
        token: 'invited-jwt-token',
        user: {
          id: '3',
          email: 'invited@example.com',
          firstName: 'Invited',
          lastName: 'User',
          role: 'parent' as const,
          children: [],
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await authService.registerWithInvitation(mockInvitationData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateInvitationToken', () => {
    it('should validate invitation token successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce({ valid: true });

      const result = await authService.validateInvitationToken('valid-token');

      expect(result).toEqual({ valid: true });
    });

    it('should handle invalid invitation token', async () => {
      const errorResponse = {
        response: {
          data: {
            'hydra:description': 'Invalid invitation token',
          },
        },
      };

      mockApiClient.post.mockRejectedValueOnce(errorResponse);

      const result = await authService.validateInvitationToken('invalid-token');

      expect(result).toEqual({
        valid: false,
        message: 'Invalid invitation token',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await authService.refreshToken('old-refresh-token');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/refresh',
        { refresh_token: 'old-refresh-token' },
        {
          headers: {
            'Content-Type': 'application/ld+json',
            Authorization: 'Bearer old-refresh-token',
          },
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });
});