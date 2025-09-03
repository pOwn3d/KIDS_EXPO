/**
 * Mission Repository Interface
 * Defines the contract for mission data access
 */

import { MissionEntity, MissionStatus, MissionCategory, MissionDifficulty } from '../entities/Mission';

export interface CreateMissionData {
  title: string;
  description: string;
  points: number;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  childId?: number;
  deadline?: Date;
  isRecurring?: boolean;
}

export interface UpdateMissionData {
  title?: string;
  description?: string;
  points?: number;
  category?: MissionCategory;
  difficulty?: MissionDifficulty;
  childId?: number;
  deadline?: Date;
  status?: MissionStatus;
}

export interface MissionFilters {
  status?: MissionStatus;
  category?: MissionCategory;
  difficulty?: MissionDifficulty;
  childId?: number;
  isOverdue?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IMissionRepository {
  /**
   * Get all missions
   */
  getAll(filters?: MissionFilters): Promise<MissionEntity[]>;
  
  /**
   * Get a specific mission by ID
   */
  getById(id: number): Promise<MissionEntity | null>;
  
  /**
   * Create a new mission
   */
  create(data: CreateMissionData): Promise<MissionEntity>;
  
  /**
   * Update a mission
   */
  update(id: number, data: UpdateMissionData): Promise<MissionEntity>;
  
  /**
   * Delete a mission
   */
  delete(id: number): Promise<void>;
  
  /**
   * Assign mission to child
   */
  assignToChild(missionId: number, childId: number): Promise<MissionEntity>;
  
  /**
   * Complete a mission
   */
  complete(missionId: number): Promise<MissionEntity>;
  
  /**
   * Validate a completed mission
   */
  validate(missionId: number): Promise<MissionEntity>;
  
  /**
   * Reject a completed mission
   */
  reject(missionId: number, reason?: string): Promise<MissionEntity>;
  
  /**
   * Get missions for validation
   */
  getPendingValidations(): Promise<MissionEntity[]>;
  
  /**
   * Get missions for a specific child
   */
  getByChildId(childId: number): Promise<MissionEntity[]>;
  
  /**
   * Get recurring missions
   */
  getRecurringMissions(): Promise<MissionEntity[]>;
  
  /**
   * Clone mission for recurring
   */
  cloneForRecurring(missionId: number): Promise<MissionEntity>;
  
  /**
   * Get mission statistics
   */
  getStatistics(childId?: number): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    validated: number;
    rejected: number;
    totalPoints: number;
  }>;
}