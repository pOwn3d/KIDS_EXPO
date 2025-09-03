/**
 * Create Child Use Case
 * Handles the business logic for creating a new child account
 */

import { IChildRepository } from '../../repositories/IChildRepository';
import { IAuthRepository } from '../../repositories/IAuthRepository';
import { ChildEntity } from '../../entities/Child';

export interface CreateChildInput {
  firstName: string;
  lastName: string;
  birthDate: Date;
  avatar?: string;
}

export interface CreateChildOutput {
  child: ChildEntity;
  success: boolean;
}

export class CreateChildUseCase {
  constructor(
    private childRepository: IChildRepository,
    private authRepository: IAuthRepository
  ) {}

  async execute(input: CreateChildInput): Promise<CreateChildOutput> {
    // Validate input
    this.validateInput(input);
    
    // Check if user is a parent
    const currentUser = await this.authRepository.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    if (!currentUser.isParent) {
      throw new Error('Only parents can create child accounts');
    }
    
    // Calculate age
    const age = this.calculateAge(input.birthDate);
    if (age < 3 || age > 18) {
      throw new Error('Child must be between 3 and 18 years old');
    }
    
    // Create the child
    const child = await this.childRepository.create({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      birthDate: input.birthDate,
      avatar: input.avatar,
    });
    
    return {
      child,
      success: true,
    };
  }
  
  private validateInput(input: CreateChildInput): void {
    if (!input.firstName || !input.lastName) {
      throw new Error('First name and last name are required');
    }
    
    if (input.firstName.length < 2 || input.lastName.length < 2) {
      throw new Error('Names must be at least 2 characters long');
    }
    
    if (!input.birthDate) {
      throw new Error('Birth date is required');
    }
    
    // Check if birth date is valid
    const birthDate = new Date(input.birthDate);
    if (birthDate > new Date()) {
      throw new Error('Birth date cannot be in the future');
    }
  }
  
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}