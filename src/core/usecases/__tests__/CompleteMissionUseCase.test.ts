/**
 * Complete Mission Use Case Tests
 * Unit tests for mission completion business logic
 */

import { CompleteMissionUseCase } from '../missions/CompleteMissionUseCase';
import { IMissionRepository } from '../../repositories/IMissionRepository';
import { IChildRepository } from '../../repositories/IChildRepository';
import { MissionEntity } from '../../entities/Mission';
import { ChildEntity } from '../../entities/Child';

// Mock repositories
class MockMissionRepository implements IMissionRepository {
  getAll = jest.fn();
  getById = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  assignToChild = jest.fn();
  complete = jest.fn();
  validate = jest.fn();
  reject = jest.fn();
  getPendingValidations = jest.fn();
  getByChildId = jest.fn();
  getRecurringMissions = jest.fn();
  cloneForRecurring = jest.fn();
  getStatistics = jest.fn();
}

class MockChildRepository implements IChildRepository {
  getAll = jest.fn();
  getById = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  addPoints = jest.fn();
  deductPoints = jest.fn();
  getByParentId = jest.fn();
  getStatistics = jest.fn();
  updateAvatar = jest.fn();
  setActive = jest.fn();
}

describe('CompleteMissionUseCase', () => {
  let useCase: CompleteMissionUseCase;
  let mockMissionRepo: MockMissionRepository;
  let mockChildRepo: MockChildRepository;
  
  beforeEach(() => {
    mockMissionRepo = new MockMissionRepository();
    mockChildRepo = new MockChildRepository();
    useCase = new CompleteMissionUseCase(mockMissionRepo, mockChildRepo);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('execute', () => {
    it('should successfully complete a mission and award points', async () => {
      // Arrange
      const mission = new MissionEntity(
        1,
        'Clean room',
        'Clean your room',
        10,
        'PENDING',
        'CHORES',
        'EASY',
        1,
        false,
        1
      );
      
      const child = new ChildEntity(
        1,
        'Alice',
        'Doe',
        new Date('2015-01-01'),
        50,
        1,
        1,
        true
      );
      
      const updatedMission = { ...mission, status: 'COMPLETED' as const };
      const updatedChild = { ...child, points: 60, level: 1 };
      
      mockMissionRepo.getById.mockResolvedValue(mission);
      mockChildRepo.getById.mockResolvedValue(child);
      mockMissionRepo.update.mockResolvedValue(updatedMission);
      mockChildRepo.update.mockResolvedValue(updatedChild);
      
      // Act
      const result = await useCase.execute({
        missionId: 1,
        childId: 1,
      });
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.pointsEarned).toBe(10);
      expect(result.child.points).toBe(60);
      expect(mockMissionRepo.update).toHaveBeenCalledWith(1, {
        status: 'COMPLETED',
      });
      expect(mockChildRepo.update).toHaveBeenCalledWith(1, {
        points: 60,
        level: 1,
      });
    });
    
    it('should detect level up when crossing 100 points threshold', async () => {
      // Arrange
      const mission = new MissionEntity(
        1,
        'Big task',
        'Complete big task',
        60,
        'PENDING',
        'SPECIAL',
        'HARD',
        1,
        false,
        1
      );
      
      const child = new ChildEntity(
        1,
        'Bob',
        'Doe',
        new Date('2015-01-01'),
        90,
        1,
        1,
        true
      );
      
      const updatedMission = { ...mission, status: 'COMPLETED' as const };
      const updatedChild = { ...child, points: 150, level: 2 };
      
      mockMissionRepo.getById.mockResolvedValue(mission);
      mockChildRepo.getById.mockResolvedValue(child);
      mockMissionRepo.update.mockResolvedValue(updatedMission);
      mockChildRepo.update.mockResolvedValue(updatedChild);
      
      // Act
      const result = await useCase.execute({
        missionId: 1,
        childId: 1,
      });
      
      // Assert
      expect(result.newLevel).toBe(2);
      expect(result.child.level).toBe(2);
    });
    
    it('should throw error if mission not found', async () => {
      // Arrange
      mockMissionRepo.getById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(useCase.execute({
        missionId: 999,
        childId: 1,
      })).rejects.toThrow('Mission not found');
    });
    
    it('should throw error if child not found', async () => {
      // Arrange
      const mission = new MissionEntity(
        1,
        'Task',
        'Do task',
        10,
        'PENDING',
        'CHORES',
        'EASY',
        1,
        false
      );
      
      mockMissionRepo.getById.mockResolvedValue(mission);
      mockChildRepo.getById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(useCase.execute({
        missionId: 1,
        childId: 999,
      })).rejects.toThrow('Child not found');
    });
    
    it('should throw error if mission assigned to different child', async () => {
      // Arrange
      const mission = new MissionEntity(
        1,
        'Task',
        'Do task',
        10,
        'PENDING',
        'CHORES',
        'EASY',
        1,
        false,
        2 // Different child ID
      );
      
      const child = new ChildEntity(
        1,
        'Alice',
        'Doe',
        new Date('2015-01-01'),
        50,
        1,
        1,
        true
      );
      
      mockMissionRepo.getById.mockResolvedValue(mission);
      mockChildRepo.getById.mockResolvedValue(child);
      
      // Act & Assert
      await expect(useCase.execute({
        missionId: 1,
        childId: 1,
      })).rejects.toThrow('This mission is not assigned to this child');
    });
    
    it('should throw error if mission already completed', async () => {
      // Arrange
      const mission = new MissionEntity(
        1,
        'Task',
        'Do task',
        10,
        'COMPLETED',
        'CHORES',
        'EASY',
        1,
        false,
        1
      );
      
      const child = new ChildEntity(
        1,
        'Alice',
        'Doe',
        new Date('2015-01-01'),
        50,
        1,
        1,
        true
      );
      
      mockMissionRepo.getById.mockResolvedValue(mission);
      mockChildRepo.getById.mockResolvedValue(child);
      
      // Act & Assert
      await expect(useCase.execute({
        missionId: 1,
        childId: 1,
      })).rejects.toThrow('Mission cannot be completed in current status');
    });
    
    it('should throw error if child is inactive', async () => {
      // Arrange
      const mission = new MissionEntity(
        1,
        'Task',
        'Do task',
        10,
        'PENDING',
        'CHORES',
        'EASY',
        1,
        false,
        1
      );
      
      const child = new ChildEntity(
        1,
        'Alice',
        'Doe',
        new Date('2015-01-01'),
        50,
        1,
        1,
        false // Inactive
      );
      
      mockMissionRepo.getById.mockResolvedValue(mission);
      mockChildRepo.getById.mockResolvedValue(child);
      
      // Act & Assert
      await expect(useCase.execute({
        missionId: 1,
        childId: 1,
      })).rejects.toThrow('Child account is not active');
    });
  });
});