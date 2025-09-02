/**
 * Activities Service
 * Handles all activity-related API calls
 */

import { apiClient } from './api/client';
import { API_ENDPOINTS } from '../config/api.config';
import type { 
  Activity, 
  ActivitiesCollectionResponse, 
  ActivityFilters,
  RecentActivitiesResponse 
} from '../types/api/activities';

class ActivitiesService {
  /**
   * Get list of activities with optional filters
   */
  async getActivities(filters?: ActivityFilters): Promise<ActivitiesCollectionResponse> {
    try {
      console.log('📊 Fetching activities...');
      
      const params = new URLSearchParams();
      if (filters?.child) params.append('child', filters.child.toString());
      if (filters?.type) params.append('type', filters.type);
      if (filters?.from) params.append('from', filters.from);
      if (filters?.to) params.append('to', filters.to);
      
      const url = params.toString() 
        ? `${API_ENDPOINTS.ACTIVITIES.LIST}?${params.toString()}`
        : API_ENDPOINTS.ACTIVITIES.LIST;

      const response = await apiClient.get<ActivitiesCollectionResponse>(url);
      
      console.log('✅ Activities loaded:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching activities:', error);
      throw error;
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<RecentActivitiesResponse> {
    try {
      console.log('📊 Fetching recent activities...');
      
      const response = await apiClient.get<RecentActivitiesResponse>(
        `${API_ENDPOINTS.ACTIVITIES.RECENT}?limit=${limit}`
      );
      
      console.log('✅ Recent activities loaded:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching recent activities:', error);
      throw error;
    }
  }

  /**
   * Get activities for a specific child
   */
  async getChildActivities(childId: number): Promise<ActivitiesCollectionResponse> {
    return this.getActivities({ child: childId });
  }

  /**
   * Get activity details
   */
  async getActivity(activityId: number): Promise<Activity> {
    try {
      console.log(`📊 Fetching activity ${activityId}...`);
      
      const response = await apiClient.get<Activity>(
        API_ENDPOINTS.ACTIVITIES.GET(activityId)
      );
      
      console.log('✅ Activity loaded:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching activity ${activityId}:`, error);
      throw error;
    }
  }
}

export const activitiesService = new ActivitiesService();