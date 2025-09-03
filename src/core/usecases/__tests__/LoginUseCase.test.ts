/**
 * Login Use Case Tests
 * Unit tests for authentication business logic
 */

import { LoginUseCase } from '../auth/LoginUseCase';
import { IAuthRepository } from '../../repositories/IAuthRepository';
import { UserEntity } from '../../entities/User';

// Mock implementation of AuthRepository
class MockAuthRepository implements IAuthRepository {
  login = jest.fn();
  register = jest.fn();
  logout = jest.fn();
  refreshToken = jest.fn();
  getCurrentUser = jest.fn();
  validateParentPin = jest.fn();
  updateParentPin = jest.fn();
  isAuthenticated = jest.fn();
  getTokens = jest.fn();
  storeTokens = jest.fn();
  clearTokens = jest.fn();
}

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockRepository: MockAuthRepository;
  
  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    useCase = new LoginUseCase(mockRepository);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('execute', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockUser = new UserEntity(
        1,
        'test@example.com',
        'John',
        'Doe',
        'PARENT',
        true,
        new Date(),
        new Date()
      );
      
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      };
      
      mockRepository.login.mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });
      
      const input = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('mock-access-token');
      expect(mockRepository.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockRepository.storeTokens).toHaveBeenCalledWith(mockTokens);
    });
    
    it('should not store tokens when rememberMe is false', async () => {
      // Arrange
      const mockUser = new UserEntity(
        1,
        'test@example.com',
        'John',
        'Doe',
        'PARENT',
        true,
        new Date(),
        new Date()
      );
      
      mockRepository.login.mockResolvedValue({
        user: mockUser,
        tokens: {
          accessToken: 'mock-token',
          expiresIn: 3600,
        },
      });
      
      const input = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };
      
      // Act
      await useCase.execute(input);
      
      // Assert
      expect(mockRepository.storeTokens).not.toHaveBeenCalled();
    });
    
    it('should throw error for invalid email format', async () => {
      // Arrange
      const input = {
        email: 'invalid-email',
        password: 'password123',
      };
      
      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Invalid email format');
      expect(mockRepository.login).not.toHaveBeenCalled();
    });
    
    it('should throw error for short password', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: '12345',
      };
      
      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        'Password must be at least 6 characters'
      );
      expect(mockRepository.login).not.toHaveBeenCalled();
    });
    
    it('should throw error when credentials are missing', async () => {
      // Arrange
      const input = {
        email: '',
        password: '',
      };
      
      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        'Email and password are required'
      );
      expect(mockRepository.login).not.toHaveBeenCalled();
    });
    
    it('should handle login failure from repository', async () => {
      // Arrange
      mockRepository.login.mockRejectedValue(new Error('Invalid credentials'));
      
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      
      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Invalid credentials');
    });
    
    it('should normalize email to lowercase', async () => {
      // Arrange
      const mockUser = new UserEntity(
        1,
        'test@example.com',
        'John',
        'Doe',
        'PARENT',
        true,
        new Date(),
        new Date()
      );
      
      mockRepository.login.mockResolvedValue({
        user: mockUser,
        tokens: {
          accessToken: 'mock-token',
          expiresIn: 3600,
        },
      });
      
      const input = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };
      
      // Act
      await useCase.execute(input);
      
      // Assert
      expect(mockRepository.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    it('should trim email whitespace', async () => {
      // Arrange
      const mockUser = new UserEntity(
        1,
        'test@example.com',
        'John',
        'Doe',
        'PARENT',
        true,
        new Date(),
        new Date()
      );
      
      mockRepository.login.mockResolvedValue({
        user: mockUser,
        tokens: {
          accessToken: 'mock-token',
          expiresIn: 3600,
        },
      });
      
      const input = {
        email: '  test@example.com  ',
        password: 'password123',
      };
      
      // Act
      await useCase.execute(input);
      
      // Assert
      expect(mockRepository.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});