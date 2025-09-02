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
      console.log('🏆 Fetching badges...');
      
      const response = await apiClient.get<BadgesCollectionResponse>(
        API_ENDPOINTS.BADGES.LIST
      );
      
      console.log('✅ Badges loaded:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching badges:', error);
      throw error;
    }
  }

  /**
   * Get badge details
   */
  async getBadge(badgeId: number): Promise<Badge> {
    try {
      console.log(`🏆 Fetching badge ${badgeId}...`);
      
      const response = await apiClient.get<Badge>(
        API_ENDPOINTS.BADGES.GET(badgeId)
      );
      
      console.log('✅ Badge loaded:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching badge ${badgeId}:`, error);
      throw error;
    }
  }

  /**
   * Get badges for a specific child
   */
  async getChildBadges(childId: number): Promise<ChildBadge[]> {
    try {
      console.log(`🏆 Fetching badges for child ${childId}...`);
      
      const response = await apiClient.get<{ badges: ChildBadge[] }>(
        API_ENDPOINTS.CHILDREN.BADGES(childId)
      );
      
      console.log('✅ Child badges loaded:', response);
      return response.badges || response;
    } catch (error) {
      console.error(`❌ Error fetching child badges:`, error);
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
      console.log('🏆 Creating badge...');
      
      const response = await apiClient.post<Badge>(
        API_ENDPOINTS.BADGES.CREATE,
        badgeData
      );
      
      console.log('✅ Badge created:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating badge:', error);
      throw error;
    }
  }

  /**
   * Update a badge (parent only)
   */
  async updateBadge(badgeId: number, badgeData: Partial<Badge>): Promise<Badge> {
    try {
      console.log(`🏆 Updating badge ${badgeId}...`);
      
      const response = await apiClient.put<Badge>(
        API_ENDPOINTS.BADGES.UPDATE(badgeId),
        badgeData
      );
      
      console.log('✅ Badge updated:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error updating badge ${badgeId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a badge (parent only)
   */
  async deleteBadge(badgeId: number): Promise<void> {
    try {
      console.log(`🏆 Deleting badge ${badgeId}...`);
      
      await apiClient.delete(API_ENDPOINTS.BADGES.DELETE(badgeId));
      
      console.log('✅ Badge deleted');
    } catch (error) {
      console.error(`❌ Error deleting badge ${badgeId}:`, error);
      throw error;
    }
  }

  /**
   * Get badge progress for a child
   */
  async getBadgeProgress(childId: number, badgeId: number): Promise<BadgeProgress> {
    try {
      console.log(`🏆 Fetching badge progress...`);
      
      const response = await apiClient.get<BadgeProgress>(
        `/api/children/${childId}/badges/${badgeId}/progress`
      );
      
      console.log('✅ Badge progress loaded:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching badge progress:`, error);
      throw error;
    }
  }
}

export const badgesService = new BadgesService();