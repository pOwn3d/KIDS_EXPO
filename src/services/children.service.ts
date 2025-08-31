import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api.interceptor';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface Child {
  id: string | number;
  publicId?: string;
  name: string;
  firstName: string;
  lastName?: string;
  age: number;
  avatar: string;
  currentPoints: number;
  level: number;
  streak?: number;
  completedMissions?: number;
  activeMissions?: number;
  badges?: Badge[];
  statistics?: ChildStatistics;
  theme?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Badge {
  id: string | number;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface ChildStatistics {
  totalPoints: number;
  pointsThisWeek: number;
  pointsThisMonth: number;
  missionsCompleted: number;
  rewardsEarned: number;
  averagePointsPerDay: number;
  streak: number;
  level: number;
  weeklyProgress: WeeklyProgress[];
}

export interface WeeklyProgress {
  date: string;
  points: number;
  missions: number;
}

export interface ChildActivity {
  id: string | number;
  type: 'mission_completed' | 'reward_claimed' | 'points_earned' | 'badge_earned' | 'level_up';
  title: string;
  description: string;
  points?: number;
  createdAt: string;
  icon: string;
  color: string;
}

class ChildrenService {
  private async getAuthToken(): Promise<string | null> {
    try {
      // Essayer les deux clés possibles pour le token (comme dans dashboard.service)
      let token = await AsyncStorage.getItem('access_token');
      if (!token) {
        token = await AsyncStorage.getItem('auth_token');
      }
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getAllChildren(): Promise<Child[]> {
    try {
      // Essayer les deux clés possibles pour le token
      let token = await AsyncStorage.getItem('access_token');
      if (!token) {
        token = await AsyncStorage.getItem('auth_token');
      }
      
      if (!token) {
        console.warn('⚠️ No token found for children fetch');
        return [];
      }

      console.log('🔍 Fetching children with token preview:', token.substring(0, 20) + '...');
      
      // Essayer d'abord l'endpoint parent account qui semble fonctionner
      let response;
      try {
        console.log('🔄 Trying parent account endpoint for children...');
        response = await apiClient.get(`${API_URL}/api/parent/account`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('Parent account response:', {
          status: response.status,
          hasChildren: !!response.data?.data?.children,
          childrenCount: response.data?.data?.childrenCount || 0
        });
        
        // Si le parent account a des enfants, les utiliser
        if (response.data?.data?.children) {
          const childrenArray = response.data.data.children;
          return childrenArray
            .filter((child: any) => child && typeof child === 'object' && !Array.isArray(child))
            .map((child: any) => this.mapChildData(child));
        }
      } catch (parentError: any) {
        console.log('⚠️ Parent account failed, trying children endpoint...', {
          status: parentError.response?.status,
          statusText: parentError.response?.statusText
        });
      }
      
      // Fallback vers l'endpoint children v1 explicite
      response = await apiClient.get(`${API_URL}/api/v1/children`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Children API response:', {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        hasData: !!response.data.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array'
      });
      
      // Utiliser exactement la même logique que dashboard.service
      const childrenArray = Array.isArray(response.data) ? response.data : response.data.data || [];

      // Filter and map valid children
      return childrenArray
        .filter((child: any) => child && typeof child === 'object' && !Array.isArray(child))
        .map((child: any) => this.mapChildData(child));
    } catch (error: any) {
      console.error('❌ Children fetch error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      return [];
    }
  }

  async getChildById(childId: string | number): Promise<Child | null> {
    try {
      // Récupérer le token comme pour getAllChildren
      let token = await AsyncStorage.getItem('access_token');
      if (!token) {
        token = await AsyncStorage.getItem('auth_token');
      }
      
      if (!token) {
        console.warn('⚠️ No token found for child fetch');
        return null;
      }

      console.log(`🔍 Fetching child ${childId} with token preview:`, token.substring(0, 20) + '...');
      
      // Utiliser l'endpoint standard comme dashboard.service
      const response = await apiClient.get(`${API_URL}/api/children/${childId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log(`Child ${childId} API response:`, {
        status: response.status,
        hasId: !!response.data.id,
        hasData: !!response.data.data
      });
      
      let childData = null;
      if (response.data.data) {
        childData = response.data.data;
      } else if (response.data.id) {
        childData = response.data;
      }

      return childData ? this.mapChildData(childData) : null;
    } catch (error) {
      console.error('Error fetching child by ID:', error);
      return null;
    }
  }

  async getChildStatistics(childId: string | number): Promise<ChildStatistics | null> {
    try {
      let token = await AsyncStorage.getItem('access_token');
      if (!token) {
        token = await AsyncStorage.getItem('auth_token');
      }
      
      if (!token) {
        console.warn('⚠️ No token found for child statistics');
        return null;
      }

      const response = await apiClient.get(`${API_URL}/api/children/${childId}/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      let statsData = null;
      if (response.data.success && response.data.data) {
        statsData = response.data.data;
      } else if (response.data.totalPoints !== undefined) {
        statsData = response.data;
      }

      return statsData ? {
        totalPoints: statsData.totalPoints || 0,
        pointsThisWeek: statsData.pointsThisWeek || 0,
        pointsThisMonth: statsData.pointsThisMonth || 0,
        missionsCompleted: statsData.missionsCompleted || 0,
        rewardsEarned: statsData.rewardsEarned || 0,
        averagePointsPerDay: statsData.averagePointsPerDay || 0,
        streak: statsData.streak || 0,
        level: statsData.level || 1,
        weeklyProgress: statsData.weeklyProgress || []
      } : null;
    } catch (error) {
      console.error('Error fetching child statistics:', error);
      return null;
    }
  }

  async getChildActivity(childId: string | number, limit: number = 10): Promise<ChildActivity[]> {
    try {
      let token = await AsyncStorage.getItem('access_token');
      if (!token) {
        token = await AsyncStorage.getItem('auth_token');
      }
      
      if (!token) {
        console.warn('⚠️ No token found for child activity');
        return [];
      }

      const response = await apiClient.get(`${API_URL}/api/children/${childId}/activity?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      let activitiesArray = [];
      if (response.data.success && response.data.data) {
        activitiesArray = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        activitiesArray = response.data;
      }

      return activitiesArray
        .filter((activity: any) => activity && typeof activity === 'object')
        .map((activity: any) => ({
          id: activity.id || activity.uuid || Math.random().toString(),
          type: activity.type || 'points_earned',
          title: activity.title || activity.name || 'Activité',
          description: activity.description || '',
          points: activity.points || 0,
          createdAt: activity.createdAt || activity.created_at || new Date().toISOString(),
          icon: this.getActivityIcon(activity.type),
          color: this.getActivityColor(activity.type)
        }));
    } catch (error) {
      console.error('Error fetching child activity:', error);
      return [];
    }
  }

  async getChildBadges(childId: string | number): Promise<Badge[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await apiClient.get(`${API_URL}/api/v1/children/${childId}/badges`, { headers });
      
      let badgesArray = [];
      if (response.data.success && response.data.data) {
        badgesArray = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        badgesArray = response.data;
      }

      return badgesArray
        .filter((badge: any) => badge && typeof badge === 'object')
        .map((badge: any) => ({
          id: badge.id || badge.uuid || Math.random().toString(),
          name: badge.name || 'Badge',
          description: badge.description || '',
          icon: badge.icon || '🏆',
          earnedAt: badge.earnedAt || badge.created_at || new Date().toISOString()
        }));
    } catch (error) {
      console.error('Error fetching child badges:', error);
      return [];
    }
  }

  async createChild(childData: {
    name: string;
    firstName: string;
    lastName?: string;
    age: number;
    avatar?: string;
  }): Promise<Child | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await apiClient.post(`${API_URL}/api/children`, childData, { headers });
      
      let newChildData = null;
      if (response.data.success && response.data.data) {
        newChildData = response.data.data;
      } else if (response.data.id || response.data.publicId) {
        newChildData = response.data;
      }

      return newChildData ? this.mapChildData(newChildData) : null;
    } catch (error) {
      console.error('Error creating child:', error);
      throw error;
    }
  }

  async updateChild(childId: string | number, updates: Partial<Child>): Promise<Child | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await apiClient.put(`${API_URL}/api/children/${childId}`, updates, { headers });
      
      let updatedChildData = null;
      if (response.data.success && response.data.data) {
        updatedChildData = response.data.data;
      } else if (response.data.id || response.data.publicId) {
        updatedChildData = response.data;
      }

      return updatedChildData ? this.mapChildData(updatedChildData) : null;
    } catch (error) {
      console.error('Error updating child:', error);
      throw error;
    }
  }

  async deleteChild(childId: string | number): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      await apiClient.delete(`${API_URL}/api/children/${childId}`, { headers });
      return true;
    } catch (error) {
      console.error('Error deleting child:', error);
      return false;
    }
  }

  async addPointsToChild(childId: string | number, points: number, reason?: string): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      await apiClient.post(`${API_URL}/api/children/${childId}/points`, {
        points,
        reason
      }, { headers });
      return true;
    } catch (error) {
      console.error('Error adding points to child:', error);
      return false;
    }
  }

  private mapChildData(data: any): Child {
    console.log('🔍 Mapping child data:', data);
    
    // Calculate level from points
    const level = Math.floor((data.currentPoints || data.current_points || data.points || 0) / 100) + 1;
    
    const mappedChild = {
      // Utiliser l'ID interne, pas le publicId
      id: data.id || data.uuid,
      publicId: data.publicId || data.public_id,
      name: data.name || data.firstName || data.first_name || 'Enfant',
      firstName: data.firstName || data.first_name || data.name || 'Enfant',
      lastName: data.lastName || data.last_name || '',
      age: data.age || 0,
      avatar: data.avatar || '👦',
      currentPoints: data.currentPoints || data.current_points || data.points || 0,
      level: data.level || level,
      streak: data.streak || 0,
      completedMissions: data.completedMissions || data.missions_completed || 0,
      activeMissions: data.activeMissions || data.active_missions || 0,
      theme: data.theme || 'default',
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    };
    
    console.log('✅ Mapped child:', { id: mappedChild.id, name: mappedChild.name });
    return mappedChild;
  }

  private getActivityIcon(type: string): string {
    switch (type) {
      case 'mission_completed': return 'checkmark-circle';
      case 'reward_claimed': return 'gift';
      case 'points_earned': return 'star';
      case 'badge_earned': return 'trophy';
      case 'level_up': return 'trending-up';
      default: return 'flash';
    }
  }

  private getActivityColor(type: string): string {
    switch (type) {
      case 'mission_completed': return '#10B981';
      case 'reward_claimed': return '#F59E0B';
      case 'points_earned': return '#FFD700';
      case 'badge_earned': return '#8B5CF6';
      case 'level_up': return '#3B82F6';
      default: return '#6B7280';
    }
  }
}

export const childrenService = new ChildrenService();