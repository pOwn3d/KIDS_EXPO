/**
 * Child Repository Implementation
 * Concrete implementation of IChildRepository
 */

import { IChildRepository, CreateChildData, UpdateChildData } from '../../core/repositories/IChildRepository';
import { ChildEntity } from '../../core/entities/Child';
import { apiClient } from '../api/ApiClient';

export class ChildRepository implements IChildRepository {
  async getAll(): Promise<ChildEntity[]> {
    const response = await apiClient.get<any[]>('/v1/children');
    return response.data.map(child => ChildEntity.fromJSON(child));
  }

  async getById(id: number): Promise<ChildEntity | null> {
    try {
      const response = await apiClient.get<any>(`/v1/children/${id}`);
      return ChildEntity.fromJSON(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateChildData): Promise<ChildEntity> {
    const response = await apiClient.post<any>('/v1/children', {
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate.toISOString(),
      avatar: data.avatar,
    });
    return ChildEntity.fromJSON(response.data);
  }

  async update(id: number, data: UpdateChildData): Promise<ChildEntity> {
    const updateData: any = {};
    
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate.toISOString();
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    
    const response = await apiClient.patch<any>(`/v1/children/${id}`, updateData);
    return ChildEntity.fromJSON(response.data);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/v1/children/${id}`);
  }

  async addPoints(childId: number, points: number): Promise<ChildEntity> {
    const response = await apiClient.post<any>(`/v1/children/${childId}/add-points`, {
      points,
    });
    return ChildEntity.fromJSON(response.data);
  }

  async deductPoints(childId: number, points: number): Promise<ChildEntity> {
    const response = await apiClient.post<any>(`/v1/children/${childId}/deduct-points`, {
      points,
    });
    return ChildEntity.fromJSON(response.data);
  }

  async getByParentId(parentId: number): Promise<ChildEntity[]> {
    const response = await apiClient.get<any[]>(`/v1/parents/${parentId}/children`);
    return response.data.map(child => ChildEntity.fromJSON(child));
  }

  async getStatistics(childId: number): Promise<{
    totalPoints: number;
    totalMissions: number;
    completedMissions: number;
    totalRewards: number;
    claimedRewards: number;
    currentLevel: number;
  }> {
    const response = await apiClient.get<{
      totalPoints: number;
      totalMissions: number;
      completedMissions: number;
      totalRewards: number;
      claimedRewards: number;
      currentLevel: number;
    }>(`/v1/children/${childId}/statistics`);
    
    return response.data;
  }

  async updateAvatar(childId: number, avatarUrl: string): Promise<ChildEntity> {
    const response = await apiClient.patch<any>(`/v1/children/${childId}/avatar`, {
      avatar: avatarUrl,
    });
    return ChildEntity.fromJSON(response.data);
  }

  async setActive(childId: number, isActive: boolean): Promise<ChildEntity> {
    const response = await apiClient.patch<any>(`/v1/children/${childId}/status`, {
      isActive,
    });
    return ChildEntity.fromJSON(response.data);
  }
}

// Export singleton instance
export const childRepository = new ChildRepository();