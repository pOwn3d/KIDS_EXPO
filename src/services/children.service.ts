import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api/client';
import { API_ENDPOINTS, API_URL } from '../config/api.config';
import { 
  Child,
  ChildrenCollectionResponse,
  CreateChildDto,
  UpdateChildDto,
  ChildStats,
  ChildStatistics,
  ChildActivity,
  AgeGroup,
  PointHistoryEntry
} from '../types/api/children';
import { Badge } from '../types/api/badges';
import { Activity } from '../types/api/activities';

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


  async getAllChildren(): Promise<Child[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('⚠️ No token found for children fetch');
        return [];
      }

      console.log('🔍 Fetching children with API Platform endpoint...');
      console.log('Token used:', token.substring(0, 20) + '...');
      
      const response = await apiClient.get<ChildrenCollectionResponse>(
        API_ENDPOINTS.CHILDREN.LIST,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/ld+json',
          },
        }
      );
      
      console.log('Raw response type:', typeof response);
      
      // Handle both direct array and hydra format
      let childrenArray: any[] = [];
      
      if (Array.isArray(response)) {
        // Direct array format
        childrenArray = response;
        console.log('✅ Children API response (direct array):', childrenArray.length, 'children');
      } else if (response && typeof response === 'object') {
        // Check for different object formats
        if (response['hydra:member']) {
          // Hydra format
          childrenArray = response['hydra:member'];
          console.log('✅ Children API response (hydra:member):', childrenArray.length, 'children');
        } else if (response.member) {
          // API Platform format
          childrenArray = response.member;
          console.log('✅ Children API response (member):', childrenArray.length, 'children');
        } else {
          console.log('⚠️ Unexpected response format - no member field found');
          console.log('Response:', response);
        }
      } else {
        console.log('⚠️ Unexpected response type:', typeof response);
      }

      // Filter and map valid children
      return childrenArray
        .filter((child: any) => child && typeof child === 'object' && !Array.isArray(child))
        .map((child: Child) => this.mapChildData(child));
    } catch (error: any) {
      console.error('❌ Children fetch error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        endpoint: API_ENDPOINTS.CHILDREN.LIST
      });
      return [];
    }
  }

  async getChildById(childId: string | number): Promise<Child | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('⚠️ No token found for child fetch');
        return null;
      }

      console.log(`🔍 Fetching child ${childId} with API Platform endpoint...`);
      
      const response = await apiClient.get<Child>(
        API_ENDPOINTS.CHILDREN.GET(childId),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/ld+json',
          },
        }
      );
      
      console.log(`Child ${childId} API response:`, {
        id: response.id,
        hasData: !!response
      });

      return response ? this.mapChildData(response) : null;
    } catch (error: any) {
      console.error('Error fetching child by ID:', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch child');
    }
  }

  async getChildStatistics(childId: string | number): Promise<ChildStatistics | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('⚠️ No token found for child statistics');
        return null;
      }

      console.log(`🔍 Fetching child ${childId} statistics with API Platform...`);

      const response = await apiClient.get<ChildStatistics>(
        API_ENDPOINTS.CHILDREN.STATISTICS(childId),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/ld+json',
          },
        }
      );
      
      console.log(`Child ${childId} statistics response:`, {
        totalPoints: response.totalPoints,
        hasData: !!response
      });

      return response ? {
        totalPoints: response.totalPoints || 0,
        pointsThisWeek: response.pointsThisWeek || 0,
        pointsThisMonth: response.pointsThisMonth || 0,
        missionsCompleted: response.missionsCompleted || 0,
        rewardsEarned: response.rewardsEarned || 0,
        averagePointsPerDay: response.averagePointsPerDay || 0,
        streak: response.streak || 0,
        level: response.level || 1,
        weeklyProgress: response.weeklyProgress || []
      } : null;
    } catch (error: any) {
      console.error('Error fetching child statistics:', error);
      if (error.response?.status === 404) {
        return null;
      }
      return null;
    }
  }

  async getChildActivity(childId: string | number, limit: number = 10): Promise<ChildActivity[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('⚠️ No token found for child activity');
        return [];
      }

      console.log(`🔍 Fetching child ${childId} activity with API Platform...`);

      const response = await apiClient.get<{ 'hydra:member': any[] }>(
        `${API_ENDPOINTS.CHILDREN.ACTIVITIES(childId)}?limit=${limit}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/ld+json',
          },
        }
      );
      
      console.log(`Child ${childId} activity response:`, {
        memberCount: response['hydra:member']?.length,
        hasData: !!response
      });

      const activitiesArray = response['hydra:member'] || [];

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
    } catch (error: any) {
      console.error('Error fetching child activity:', error);
      return [];
    }
  }

  async getChildBadges(childId: string | number): Promise<Badge[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('⚠️ No token found for child badges');
        return [];
      }

      console.log(`🔍 Fetching child ${childId} badges with API Platform...`);

      const response = await apiClient.get<{ 'hydra:member': any[] }>(
        API_ENDPOINTS.CHILDREN.BADGES(childId),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/ld+json',
          },
        }
      );
      
      console.log(`Child ${childId} badges response:`, {
        memberCount: response['hydra:member']?.length,
        hasData: !!response
      });

      const badgesArray = response['hydra:member'] || [];

      return badgesArray
        .filter((badge: any) => badge && typeof badge === 'object')
        .map((badge: any) => ({
          '@id': badge['@id'],
          '@type': badge['@type'] || 'Badge',
          id: badge.id || badge.uuid || Math.random().toString(),
          name: badge.name || 'Badge',
          description: badge.description || '',
          icon: badge.icon || '🏆',
          criteria: badge.criteria || 'Earned by completing tasks',
          points: badge.points || 0,
          isActive: badge.isActive !== false,
          createdAt: badge.createdAt || badge.created_at,
          updatedAt: badge.updatedAt || badge.updated_at,
          earnedAt: badge.earnedAt || badge.created_at || new Date().toISOString()
        } as Badge & { earnedAt: string }));
    } catch (error: any) {
      console.error('Error fetching child badges:', error);
      return [];
    }
  }

  async createChild(childData: CreateChildDto): Promise<Child | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('🔍 Creating child with API Platform...', {
        name: childData.name,
        firstName: childData.firstName,
        endpoint: API_ENDPOINTS.CHILDREN.CREATE
      });

      const response = await apiClient.post<Child>(
        API_ENDPOINTS.CHILDREN.CREATE,
        childData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/ld+json',
          },
        }
      );

      console.log('Child creation response:', {
        id: response.id,
        name: response.name,
        hasData: !!response
      });

      return response ? this.mapChildData(response) : null;
    } catch (error: any) {
      console.error('Error creating child:', error);
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to create child');
    }
  }

  async updateChild(childId: string | number, updates: UpdateChildDto): Promise<Child | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log(`🔍 Updating child ${childId} with API Platform...`, {
        updates,
        endpoint: API_ENDPOINTS.CHILDREN.UPDATE(childId)
      });

      const response = await apiClient.put<Child>(
        API_ENDPOINTS.CHILDREN.UPDATE(childId),
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/ld+json',
          },
        }
      );

      console.log(`Child ${childId} update response:`, {
        id: response.id,
        name: response.name,
        hasData: !!response
      });

      return response ? this.mapChildData(response) : null;
    } catch (error: any) {
      console.error('Error updating child:', error);
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to update child');
    }
  }

  async deleteChild(childId: string | number): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log(`🔍 Deleting child ${childId} with API Platform...`);

      await apiClient.delete(API_ENDPOINTS.CHILDREN.DELETE(childId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`Child ${childId} deleted successfully`);
      return true;
    } catch (error: any) {
      console.error('Error deleting child:', error);
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to delete child');
    }
  }

  async addPointsToChild(childId: string | number, points: number, reason?: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log(`🔍 Adding ${points} points to child ${childId}...`, { reason });

      await apiClient.post(
        API_ENDPOINTS.CHILDREN.ADD_POINTS(childId),
        {
          points,
          reason
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/ld+json',
          },
        }
      );

      console.log(`Successfully added ${points} points to child ${childId}`);
      return true;
    } catch (error: any) {
      console.error('Error adding points to child:', error);
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to add points to child');
    }
  }

  /**
   * Calculer l'âge à partir de la date de naissance
   */
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Déterminer le groupe d'âge selon DATABASE_CONTENT.md
   */
  private determineAgeGroup(age: number): AgeGroup {
    if (age >= 3 && age <= 5) return '3-5';
    if (age >= 6 && age <= 8) return '6-8';
    if (age >= 9 && age <= 12) return '9-12';
    if (age >= 13 && age <= 17) return '13-17';
    
    // Par défaut pour les âges non couverts
    return age < 3 ? '3-5' : '13-17';
  }

  private mapChildData(data: any): Child {
    console.log('🔍 Mapping child data:', data);
    
    // Calculer l'âge si birthDate est fourni, sinon utiliser l'âge existant
    let age = data.age || 0;
    if (data.birthDate) {
      age = this.calculateAge(data.birthDate);
    }
    
    // Déterminer le groupe d'âge
    const ageGroup = this.determineAgeGroup(age);
    
    // Calculate level from points - compatibilité avec les deux formats
    const currentPoints = data.currentPoints || data.current_points || data.points || 0;
    const calculatedLevel = Math.floor(currentPoints / 100) + 1;
    
    const mappedChild: Child = {
      '@id': data['@id'],
      '@type': data['@type'] || 'Child',
      id: data.id,
      name: data.name || data.firstName || data.first_name || 'Enfant',
      firstName: data.firstName || data.first_name || data.name,
      lastName: data.lastName || data.last_name,
      birthDate: data.birthDate,
      age: age,
      avatar: data.avatar || '👦',
      currentPoints: currentPoints,
      totalPointsEarned: data.totalPointsEarned || data.total_points_earned,
      totalPointsSpent: data.totalPointsSpent || data.total_points_spent,
      level: data.level || `level-${calculatedLevel}`, // API Platform retourne level as string
      levelProgress: data.levelProgress || 0,
      streak: data.streak || 0,
      bestStreak: data.bestStreak || data.best_streak,
      gems: data.gems || 0,
      theme: data.theme || 'default',
      parentId: data.parentId || data.parent_id,
      isActive: data.isActive !== false,
      missions: data.missions || [],
      badges: data.badges || [],
      rewards: data.rewards || [],
      pointsHistory: data.pointsHistory || [],
      ageGroup: ageGroup, // Nouvelle propriété basée sur l'âge
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    };
    
    console.log('✅ Mapped child:', { 
      id: mappedChild.id, 
      name: mappedChild.name, 
      age: mappedChild.age, 
      ageGroup: mappedChild.ageGroup 
    });
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
export type { Child, ChildStatistics, ChildActivity } from '../types/api/children';