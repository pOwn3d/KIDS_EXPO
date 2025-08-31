import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api.interceptor';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

interface Mission {
  id: string;
  name: string;
  description: string;
  points: number;
  status: string;
  type: string;
  assignedTo: string[];
  dueDate?: string;
  completedAt?: string;
  category?: string;
}

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
  async getAllMissions(): Promise<Mission[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get(
        `${API_URL}/api/missions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Debug pour voir la structure de la réponse
      console.log('Missions API response:', response.data);
      
      // Gérer différentes structures de réponse possibles
      let missionsArray = [];
      
      if (response.data.success && response.data.data?.missions) {
        // Structure: { success: true, data: { missions: [...] } }
        missionsArray = response.data.data.missions;
      } else if (Array.isArray(response.data)) {
        // Structure: [mission1, mission2, ...]
        // Filtrer les éléments vides et les tableaux vides
        missionsArray = response.data.filter(mission => 
          mission && 
          typeof mission === 'object' && 
          !Array.isArray(mission) &&
          Object.keys(mission).length > 0
        );
      } else if (response.data['hydra:member']) {
        // Structure API Platform
        missionsArray = response.data['hydra:member'];
      } else if (response.data.data && Array.isArray(response.data.data)) {
        missionsArray = response.data.data;
      } else if (response.data.missions) {
        missionsArray = response.data.missions;
      }
      
      console.log('Missions extracted:', missionsArray);
      
      
      // Transformer les données depuis le format API
      // Le backend retourne: id, title, description, points, category, difficulty, icon, is_active, assigned_to, due_date
      return missionsArray.map((mission: any) => {
        console.log('Mission data:', mission);
        
        // L'API retourne directement l'ID
        const missionId = mission.id;
        
        // Le backend utilise 'name' pour le nom de la mission
        const missionName = mission.name || mission.title || `Mission #${missionId || 'Unknown'}`;
        
        // Déterminer le statut de la mission
        let status = 'active';
        if (mission.is_completed === true) {
          status = 'completed';
        } else if (mission.isActive === false) {
          status = 'inactive';
        }
        
        // Déterminer le type/fréquence basé sur targetDays
        let type = 'once';
        if (mission.targetDays === 1) {
          type = 'daily';
        } else if (mission.targetDays === 7) {
          type = 'weekly';
        } else if (mission.targetDays === 30) {
          type = 'monthly';
        }
        
        return {
          id: missionId ? String(missionId) : Math.random().toString(),
          name: missionName,
          description: mission.description || '',
          points: mission.pointsReward || mission.points || 0,
          status: status,
          type: type,
          assignedTo: mission.assigned_to || [],
          dueDate: mission.due_date,
          completedAt: mission.completed_at,
          category: mission.category || 'general',
        };
      });
    } catch (error: any) {
      console.error('Failed to fetch missions:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch missions');
    }
  }

  /**
   * Récupérer les missions d'un enfant
   */
  async getChildMissions(childId: string): Promise<Mission[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get(
        `${API_URL}/api/children/${childId}/missions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const missions = response.data['hydra:member'] || response.data.data || response.data || [];
      
      return missions.map((mission: any) => ({
        id: mission.id || mission['@id']?.split('/').pop(),
        name: mission.title || mission.name,
        description: mission.description || '',
        points: mission.points || mission.pointsReward || 0,
        status: mission.is_completed ? 'completed' : (mission.is_active === false ? 'inactive' : 'active'),
        type: mission.type || mission.frequency || 'once',
        assignedTo: mission.assigned_to || mission.assignedChildren || [],
        dueDate: mission.due_date || mission.dueDate,
        completedAt: mission.completed_at || mission.completedAt,
        category: mission.category,
      }));
    } catch (error: any) {
      console.error('Failed to fetch child missions:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch child missions');
    }
  }

  /**
   * Créer une nouvelle mission
   */
  async createMission(missionData: {
    name: string;
    description: string;
    points: number;
    type: string;
    assignedTo: string[];
    dueDate?: string;
    category?: string;
  }): Promise<Mission> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // L'API attend: title, description, points, category, difficulty, icon, assigned_to, due_date
      const response = await apiClient.post(
        `${API_URL}/api/missions`,
        {
          title: missionData.name,
          description: missionData.description,
          points: missionData.points,
          category: missionData.category || 'general',
          difficulty: 'medium',
          icon: '🎯',
          assigned_to: missionData.assignedTo,
          due_date: missionData.dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Failed to create mission:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create mission');
    }
  }

  /**
   * Valider une mission (parent)
   */
  async validateMission(missionId: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.post(
        `${API_URL}/api/missions/${missionId}/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.success || response.status === 200;
    } catch (error: any) {
      console.error('Failed to validate mission:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to validate mission');
    }
  }

  /**
   * Rejeter une mission (parent)
   */
  async rejectMission(missionId: string, reason?: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.post(
        `${API_URL}/api/missions/${missionId}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.success || response.status === 200;
    } catch (error: any) {
      console.error('Failed to reject mission:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to reject mission');
    }
  }

  /**
   * Marquer une mission comme complétée (enfant)
   */
  async completeMission(missionId: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.post(
        `${API_URL}/api/missions/${missionId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.success || response.status === 200;
    } catch (error: any) {
      console.error('Failed to complete mission:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to complete mission');
    }
  }

  /**
   * Supprimer une mission
   */
  async deleteMission(missionId: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.delete(
        `${API_URL}/api/missions/${missionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.status === 204 || response.status === 200;
    } catch (error: any) {
      console.error('Failed to delete mission:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete mission');
    }
  }

  /**
   * Mettre à jour une mission
   */
  async updateMission(missionId: string, updates: Partial<Mission>): Promise<Mission> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.put(
        `${API_URL}/api/missions/${missionId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Failed to update mission:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update mission');
    }
  }
}

export const missionsService = new MissionsService();