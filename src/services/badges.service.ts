/**
 * Badges Service
 * Handles all badge-related API calls
 */

import { apiClient } from './api/client';
import { API_ENDPOINTS } from '../config/api.config';
import type { 
  Badge, 
  BadgesCollectionResponse,
  BadgeProgress,
  ChildBadge 
} from '../types/api/badges';

class BadgesService {
  /**
   * Get list of all badges
   */
  async getBadges(): Promise<BadgesCollectionResponse> {
    try {
      
      const response = await apiClient.get<BadgesCollectionResponse>(
        API_ENDPOINTS.BADGES.LIST
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get badge details
   */
  async getBadge(badgeId: number): Promise<Badge> {
    try {
      
      const response = await apiClient.get<Badge>(
        API_ENDPOINTS.BADGES.GET(badgeId)
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get badges for a specific child
   */
  async getChildBadges(childId: number): Promise<ChildBadge[]> {
    try {
      
      const response = await apiClient.get<{ badges: ChildBadge[] }>(
        API_ENDPOINTS.CHILDREN.BADGES(childId)
      );
      
      return response.badges || response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new badge (parent only)
   */
  async createBadge(badgeData: {
    name: string;
    description: string;
    icon: string;
    criteria: string;
    points: number;
  }): Promise<Badge> {
    try {
      
      const response = await apiClient.post<Badge>(
        API_ENDPOINTS.BADGES.CREATE,
        badgeData
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a badge (parent only)
   */
  async updateBadge(badgeId: number, badgeData: Partial<Badge>): Promise<Badge> {
    try {
      
      const response = await apiClient.put<Badge>(
        API_ENDPOINTS.BADGES.UPDATE(badgeId),
        badgeData
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a badge (parent only)
   */
  async deleteBadge(badgeId: number): Promise<void> {
    try {
      
      await apiClient.delete(API_ENDPOINTS.BADGES.DELETE(badgeId));
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get badge progress for a child
   */
  async getBadgeProgress(childId: number, badgeId: number): Promise<BadgeProgress> {
    try {
      
      const response = await apiClient.get<BadgeProgress>(
        `/api/children/${childId}/badges/${badgeId}/progress`
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const badgesService = new BadgesService();