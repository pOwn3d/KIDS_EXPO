/**
 * Complete Mission Use Case
 * Handles the business logic for completing a mission
 */

import { IMissionRepository } from '../../repositories/IMissionRepository';
import { IChildRepository } from '../../repositories/IChildRepository';
import { MissionEntity } from '../../entities/Mission';
import { ChildEntity } from '../../entities/Child';

export interface CompleteMissionInput {
  missionId: number;
  childId: number;
  completionNote?: string;
}

export interface CompleteMissionOutput {
  mission: MissionEntity;
  child: ChildEntity;
  pointsEarned: number;
  newLevel?: number;
  success: boolean;
}

export class CompleteMissionUseCase {
  constructor(
    private missionRepository: IMissionRepository,
    private childRepository: IChildRepository
  ) {}

  async execute(input: CompleteMissionInput): Promise<CompleteMissionOutput> {
    // Get mission and child
    const mission = await this.missionRepository.getById(input.missionId);
    const child = await this.childRepository.getById(input.childId);
    
    // Validate
    if (!mission) {
      throw new Error('Mission not found');
    }
    
    if (!child) {
      throw new Error('Child not found');
    }
    
    if (mission.childId && mission.childId !== input.childId) {
      throw new Error('This mission is not assigned to this child');
    }
    
    if (!mission.canBeCompleted) {
      throw new Error('Mission cannot be completed in current status');
    }
    
    if (!child.isActive) {
      throw new Error('Child account is not active');
    }
    
    // Store old level for comparison
    const oldLevel = child.level;
    
    // Complete the mission
    mission.complete();
    const updatedMission = await this.missionRepository.update(mission.id, {
      status: mission.status,
    });
    
    // Award points to child
    child.addPoints(mission.points);
    const updatedChild = await this.childRepository.update(child.id, {
      points: child.points,
      level: child.level,
    });
    
    // Check if level increased
    const newLevel = child.level > oldLevel ? child.level : undefined;
    
    return {
      mission: updatedMission,
      child: updatedChild,
      pointsEarned: mission.points,
      newLevel,
      success: true,
    };
  }
}