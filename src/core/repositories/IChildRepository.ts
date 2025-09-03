/**
 * Child Repository Interface
 * Defines the contract for child data access
 */

import { ChildEntity } from '../entities/Child';

export interface CreateChildData {
  firstName: string;
  lastName: string;
  birthDate: Date;
  avatar?: string;
}

export interface UpdateChildData {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  avatar?: string;
  points?: number;
  level?: number;
  isActive?: boolean;
}

export interface IChildRepository {
  /**
   * Get all children for the current parent
   */
  getAll(): Promise<ChildEntity[]>;
  
  /**
   * Get a specific child by ID
   */
  getById(id: number): Promise<ChildEntity | null>;
  
  /**
   * Create a new child
   */
  create(data: CreateChildData): Promise<ChildEntity>;
  
  /**
   * Update a child
   */
  update(id: number, data: UpdateChildData): Promise<ChildEntity>;
  
  /**
   * Delete a child
   */
  delete(id: number): Promise<void>;
  
  /**
   * Add points to a child
   */
  addPoints(childId: number, points: number): Promise<ChildEntity>;
  
  /**
   * Deduct points from a child
   */
  deductPoints(childId: number, points: number): Promise<ChildEntity>;
  
  /**
   * Get children by parent ID
   */
  getByParentId(parentId: number): Promise<ChildEntity[]>;
  
  /**
   * Get child statistics
   */
  getStatistics(childId: number): Promise<{
    totalPoints: number;
    totalMissions: number;
    completedMissions: number;
    totalRewards: number;
    claimedRewards: number;
    currentLevel: number;
  }>;
  
  /**
   * Update child avatar
   */
  updateAvatar(childId: number, avatarUrl: string): Promise<ChildEntity>;
  
  /**
   * Activate/deactivate a child
   */
  setActive(childId: number, isActive: boolean): Promise<ChildEntity>;
}