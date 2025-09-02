import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api/client';
import { API_ENDPOINTS, API_URL } from '../config/api.config';
import { 
  Mission, 
  CreateMissionRequest, 
  UpdateMissionRequest, 
  MissionsCollectionResponse,
  MissionStatus,
  MissionCategory
} from '../types/api/missions';
import { AgeGroup } from '../types/api/children';

class MissionsService {
  /**
   * Récupérer le token d'authentification
   */
  private async getToken(): Promise<string | null> {
    // Essayer les deux clés possibles
    let token = await AsyncStorage.getItem('access_token');
    if (!token) {
      token = await AsyncStorage.getItem('auth_token');
    }
    return token;
  }

  /**
   * Récupérer toutes les missions
   */
  async getAllMissions(filters?: {
    child?: number;
    status?: MissionStatus;
    category?: MissionCategory;
  }): Promise<Mission[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Construire l'URL avec les filtres
      let url = API_ENDPOINTS.MISSIONS.LIST;
      const params = new URLSearchParams();
      
      if (filters?.child) {
        params.append('child', filters.child.toString());
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.category) {
        params.append('category', filters.category);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get<MissionsCollectionResponse>(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/ld+json',
        },
      });
      
      console.log('Missions raw response type:', typeof response);
      console.log('Missions raw response:', response);

      // Handle both direct array and hydra format
      let missionsArray: any[] = [];
      
      if (Array.isArray(response)) {
        // Direct array format
        missionsArray = response;
        console.log('✅ Missions API response (direct array):', missionsArray.length, 'missions');
      } else if (response && typeof response === 'object') {
        // Check for different object formats
        if (response['hydra:member']) {
          // Hydra format
          missionsArray = response['hydra:member'];
          console.log('✅ Missions API response (hydra:member):', missionsArray.length, 'missions');
        } else if (response.member) {
          // API Platform format
          missionsArray = response.member;
          console.log('✅ Missions API response (member):', missionsArray.length, 'missions');
        } else {
          console.log('⚠️ Unexpected missions response format - no member field found');
        }
      } else {
        console.log('⚠️ Unexpected missions response format - not array or object');
        console.log('Response type:', typeof response);
        console.log('Response value:', response);
        // Try to parse if it's a string
        if (typeof response === 'string') {
          try {
            const parsed = JSON.parse(response);
            console.log('Parsed missions response:', parsed);
            if (parsed.member) {
              missionsArray = parsed.member;
              console.log('✅ Missions from parsed string:', missionsArray.length, 'missions');
            } else if (parsed['hydra:member']) {
              missionsArray = parsed['hydra:member'];
              console.log('✅ Missions from parsed hydra string:', missionsArray.length, 'missions');
            }
          } catch (e) {
            console.error('Failed to parse string response:', e);
          }
        }
      }
      
      return missionsArray.map((mission: any) => ({
        ...mission,
        // Map API Platform fields to our model
        id: mission.id,
        title: mission.name || mission.title || 'Mission',
        name: mission.name || mission.title,
        description: mission.description || '',
        points: mission.pointsReward || mission.points || 0,
        pointsReward: mission.pointsReward || mission.points || 0,
        status: mission.status || 'pending',
        category: mission.category || 'general',
        difficulty: mission.difficulty || 'easy',
        isActive: mission.isActive !== false,
        icon: mission.icon || '🎯',
        targetDays: mission.targetDays || 1,
        requiredCompletions: mission.requiredCompletions || 1,
        child: mission.child,
        childName: mission.childName,
        dueDate: mission.dueDate,
        createdAt: mission.createdAt,
        completedAt: mission.completedAt,
        validatedAt: mission.validatedAt,
      }));
    } catch (error: any) {
      console.error('Failed to fetch missions:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch missions');
    }
  }

  /**
   * Récupérer les missions d'un enfant
   */
  async getChildMissions(childId: number): Promise<Mission[]> {
    // Utiliser la méthode getAllMissions avec le filtre child
    return this.getAllMissions({ child: childId });
  }

  /**
   * Récupérer une mission par ID
   */
  async getMissionById(missionId: number): Promise<Mission | null> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get<Mission>(API_ENDPOINTS.MISSIONS.GET(missionId), {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/ld+json',
        },
      });

      return response;
    } catch (error: any) {
      console.error('Failed to fetch mission by ID:', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch mission');
    }
  }

  /**
   * Créer une nouvelle mission
   */
  async createMission(missionData: any): Promise<Mission> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Adapter les données pour l'API
      const apiData = {
        title: missionData.title || missionData.name,
        description: missionData.description,
        points: missionData.points,
        category: missionData.category,
        difficulty: missionData.difficulty || 'easy',
        child: missionData.child || (missionData.assignedTo && missionData.assignedTo[0] ? `/api/children/${missionData.assignedTo[0]}` : undefined),
        dueDate: missionData.dueDate,
        type: missionData.type,
      };

      console.log('📤 Données envoyées à l\'API:', apiData);

      const response = await apiClient.post<Mission>(
        API_ENDPOINTS.MISSIONS.CREATE,
        apiData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error('Failed to create mission:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create mission');
    }
  }

  /**
   * Mettre à jour le statut d'une mission
   */
  async updateMissionStatus(missionId: number, status: MissionStatus): Promise<Mission> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.patch<Mission>(
        API_ENDPOINTS.MISSIONS.PATCH(missionId),
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json',
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error('Failed to update mission status:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update mission status');
    }
  }

  /**
   * Valider une mission (parent) - raccourci pour updateMissionStatus
   */
  async validateMission(missionId: number): Promise<boolean> {
    try {
      await this.updateMissionStatus(missionId, 'validated');
      return true;
    } catch (error) {
      console.error('Failed to validate mission:', error);
      return false;
    }
  }

  /**
   * Rejeter une mission (parent) - raccourci pour updateMissionStatus
   */
  async rejectMission(missionId: number, reason?: string): Promise<boolean> {
    try {
      await this.updateMissionStatus(missionId, 'rejected');
      return true;
    } catch (error) {
      console.error('Failed to reject mission:', error);
      return false;
    }
  }

  /**
   * Marquer une mission comme complétée (enfant) - raccourci pour updateMissionStatus
   */
  async completeMission(missionId: number): Promise<boolean> {
    try {
      await this.updateMissionStatus(missionId, 'completed');
      return true;
    } catch (error) {
      console.error('Failed to complete mission:', error);
      return false;
    }
  }

  /**
   * Supprimer une mission
   */
  async deleteMission(missionId: number): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      await apiClient.delete(API_ENDPOINTS.MISSIONS.DELETE(missionId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return true;
    } catch (error: any) {
      console.error('Failed to delete mission:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete mission');
    }
  }

  /**
   * Mettre à jour une mission
   */
  async updateMission(missionId: number, updates: UpdateMissionRequest): Promise<Mission> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.put<Mission>(
        API_ENDPOINTS.MISSIONS.UPDATE(missionId),
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error('Failed to update mission:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update mission');
    }
  }

  /**
   * Récupérer les recommandations de missions par âge - Nouvelle fonctionnalité
   */
  async getMissionRecommendationsByAge(ageGroup: AgeGroup): Promise<Mission[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Pour l'instant, utiliser les filtres existants par catégorie
      // TODO: Implémenter l'endpoint spécifique par âge quand disponible
      const categoryMap: Record<AgeGroup, MissionCategory[]> = {
        '3-5': ['hygiene', 'domestic', 'behavior', 'autonomy'],
        '6-8': ['domestic', 'education', 'responsibility', 'hygiene', 'autonomy'],
        '9-12': ['domestic', 'education', 'health', 'solidarity'],
        '13-17': ['domestic', 'education', 'responsibility', 'garden']
      };

      const categories = categoryMap[ageGroup] || ['general'];
      const allMissions: Mission[] = [];

      // Récupérer les missions pour chaque catégorie
      for (const category of categories) {
        try {
          const missions = await this.getAllMissions({ category });
          allMissions.push(...missions);
        } catch (error) {
          console.warn(`Failed to fetch missions for category ${category}:`, error);
        }
      }

      return allMissions;
    } catch (error: any) {
      console.error('Failed to fetch mission recommendations:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch mission recommendations');
    }
  }

  /**
   * Récupérer les recommandations de missions pour un enfant spécifique
   */
  async getMissionRecommendationsForChild(childId: number, ageGroup: AgeGroup): Promise<Mission[]> {
    try {
      // Combiner les recommandations par âge avec les missions déjà assignées à l'enfant
      const [recommendations, childMissions] = await Promise.all([
        this.getMissionRecommendationsByAge(ageGroup),
        this.getChildMissions(childId)
      ]);

      // Filtrer les missions déjà assignées
      const assignedMissionIds = new Set(childMissions.map(m => m.id));
      return recommendations.filter(mission => !assignedMissionIds.has(mission.id));
    } catch (error: any) {
      console.error('Failed to fetch child mission recommendations:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch child mission recommendations');
    }
  }
}

export const missionsService = new MissionsService();