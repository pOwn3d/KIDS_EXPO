/**
 * Login Use Case
 * Handles the business logic for user authentication
 */

import { IAuthRepository } from '../../repositories/IAuthRepository';
import { UserEntity } from '../../entities/User';

export interface LoginUseCaseInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginUseCaseOutput {
  user: UserEntity;
  accessToken: string;
  success: boolean;
}

export class LoginUseCase {
  constructor(
    private authRepository: IAuthRepository
  ) {}

  async execute(input: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    // Validate input
    this.validateInput(input);
    
    try {
      // Attempt login
      const { user, tokens } = await this.authRepository.login({
        email: input.email.toLowerCase().trim(),
        password: input.password,
      });
      
      // Store tokens if login successful
      if (input.rememberMe) {
        await this.authRepository.storeTokens(tokens);
      }
      
      // Return success response
      return {
        user,
        accessToken: tokens.accessToken,
        success: true,
      };
    } catch (error: any) {
      throw new Error(
        error.message || 'Login failed. Please check your credentials.'
      );
    }
  }
  
  private validateInput(input: LoginUseCaseInput): void {
    if (!input.email || !input.password) {
      throw new Error('Email and password are required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate password minimum length
    if (input.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }
}