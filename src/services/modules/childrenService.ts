import { apiClient } from '../api/apiClient';
import { ENDPOINTS, formatIRI } from '../api/config';
import { Child, CreateChildDto, UpdateChildDto, ChildStats } from '../../types/api';

class ChildrenService {
  /**
   * Get all children for the current user
   */
  async getAll(): Promise<Child[]> {
    return await apiClient.get(ENDPOINTS.CHILDREN.LIST);
  }

  /**
   * Get a specific child by ID
   */
  async getById(id: number): Promise<Child> {
    return await apiClient.get(ENDPOINTS.CHILDREN.DETAIL(id));
  }

  /**
   * Create a new child
   */
  async create(data: CreateChildDto): Promise<Child> {
    return await apiClient.post(ENDPOINTS.CHILDREN.CREATE, data);
  }

  /**
   * Update a child
   */
  async update(id: number, data: UpdateChildDto): Promise<Child> {
    return await apiClient.patch(ENDPOINTS.CHILDREN.UPDATE(id), data);
  }

  /**
   * Delete a child
   */
  async delete(id: number): Promise<void> {
    return await apiClient.delete(ENDPOINTS.CHILDREN.DELETE(id));
  }

  /**
   * Get child statistics
   */
  async getStats(id: number): Promise<ChildStats> {
    return await apiClient.get(ENDPOINTS.CHILDREN.STATS(id));
  }

  /**
   * Update child avatar
   */
  async updateAvatar(id: number, avatar: string): Promise<Child> {
    return await apiClient.patch(ENDPOINTS.CHILDREN.UPDATE(id), { avatar });
  }

  /**
   * Add points to a child
   */
  async addPoints(childId: number, points: number, reason: string): Promise<void> {
    const data = {
      child: formatIRI('children', childId),
      points,
      reason,
      type: 'earned',
      createdAt: new Date().toISOString(),
    };
    
    return await apiClient.post(ENDPOINTS.POINTS.ADD, data);
  }

  /**
   * Remove points from a child
   */
  async removePoints(childId: number, points: number, reason: string): Promise<void> {
    const data = {
      child: formatIRI('children', childId),
      points: -points,
      reason,
      type: 'spent',
      createdAt: new Date().toISOString(),
    };
    
    return await apiClient.post(ENDPOINTS.POINTS.ADD, data);
  }

  /**
   * Get points history for a child
   */
  async getPointsHistory(childId: number): Promise<any[]> {
    return await apiClient.get(ENDPOINTS.POINTS.CHILD_HISTORY(childId));
  }

  /**
   * Get child's badges
   */
  async getBadges(childId: number): Promise<any[]> {
    return await apiClient.get(ENDPOINTS.BADGES.CHILD_BADGES(childId));
  }

  /**
   * Get child's active missions
   */
  async getActiveMissions(childId: number): Promise<any[]> {
    const url = `${ENDPOINTS.MISSIONS.LIST}?assignedChildren[]=${formatIRI('children', childId)}&completed=false`;
    return await apiClient.get(url);
  }

  /**
   * Get child's completed missions
   */
  async getCompletedMissions(childId: number): Promise<any[]> {
    const url = `${ENDPOINTS.MISSION_COMPLETIONS.LIST}?child=${formatIRI('children', childId)}`;
    return await apiClient.get(url);
  }

  /**
   * Get child's claimed rewards
   */
  async getClaimedRewards(childId: number): Promise<any[]> {
    const url = `${ENDPOINTS.REWARD_CLAIMS.LIST}?child=${formatIRI('children', childId)}`;
    return await apiClient.get(url);
  }

  /**
   * Get child's pets
   */
  async getPets(childId: number): Promise<any[]> {
    const url = `${ENDPOINTS.PETS.LIST}?child=${formatIRI('children', childId)}`;
    return await apiClient.get(url);
  }

  /**
   * Check daily wheel availability
   */
  async checkDailyWheel(childId: number): Promise<any> {
    return await apiClient.get(ENDPOINTS.DAILY_WHEEL.STATUS(childId));
  }

  /**
   * Spin daily wheel
   */
  async spinDailyWheel(childId: number): Promise<any> {
    const data = {
      child: formatIRI('children', childId),
      spunAt: new Date().toISOString(),
    };
    
    return await apiClient.post(ENDPOINTS.DAILY_WHEEL.SPIN, data);
  }
}

export const childrenService = new ChildrenService();