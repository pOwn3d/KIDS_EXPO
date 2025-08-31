import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import apiClient from './api.interceptor';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

interface DashboardStats {
  totalChildren: number;
  totalPoints: number;
  activeMissions: number;
  availableRewards: number;
  pendingValidations: number;
}

interface ChildSummary {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  age: number;
  currentPoints: number;
  level: number;
  avatar?: string;
  completedMissions: number;
  activeMissions: number;
  streak: number;
}

interface Activity {
  id: number;
  type: 'mission_completed' | 'reward_claimed' | 'level_up' | 'points_earned';
  childName: string;
  childId: number;
  description: string;
  points?: number;
  timestamp: string;
  icon?: string;
  color?: string;
}

interface ParentDashboardData {
  stats: DashboardStats;
  children: ChildSummary[];
  recentActivities: Activity[];
}

class DashboardService {
  /**
   * Récupérer les données du dashboard parent
   */
  async getParentDashboard(): Promise<ParentDashboardData> {
    try {
      // Essayer les deux clés possibles pour le token
      let token = await AsyncStorage.getItem('access_token');
      if (!token) {
        token = await AsyncStorage.getItem('auth_token');
      }
      
      console.log('📱 Platform:', Platform.OS);
      console.log('🔑 Token found:', !!token);
      console.log('🔍 Token preview:', token ? token.substring(0, 20) + '...' : 'none');
      
      if (!token) {
        console.warn('⚠️ No token found on', Platform.OS);
        // Retourner des données vides si pas de token au lieu de lancer une erreur
        return {
          stats: {
            totalChildren: 0,
            totalPoints: 0,
            activeMissions: 0,
            availableRewards: 0,
            pendingValidations: 0,
          },
          children: [],
          recentActivities: [],
        };
      }

      // Récupérer les données en parallèle pour optimiser
      console.log('🔄 Fetching dashboard data...');
      const [parentAccount, children, missions, rewards] = await Promise.all([
        this.getParentAccount(token).catch(err => {
          console.error('❌ Parent account error:', err.response?.status, err.response?.statusText);
          throw err;
        }),
        this.getChildren(token).catch(err => {
          console.error('❌ Children fetch error:', err.response?.status, err.response?.statusText);
          return [];
        }),
        this.getMissions(token).catch(() => []),
        this.getRewards(token).catch(() => []),
      ]);

      // Calculer les statistiques
      console.log('📊 Dashboard data received:');
      console.log('  - Parent account:', !!parentAccount);
      console.log('  - Children count from parent:', parentAccount?.childrenCount);
      console.log('  - Children array length:', children?.length);
      console.log('  - Children data:', children?.map(c => ({ id: c.id, name: c.firstName })));
      
      const stats: DashboardStats = {
        totalChildren: children?.length || parentAccount?.childrenCount || 0,
        totalPoints: children.reduce((sum, child) => sum + (child.currentPoints || 0), 0),
        activeMissions: missions.filter((m: any) => m.status === 'active').length,
        availableRewards: rewards.filter((r: any) => r.available).length,
        pendingValidations: missions.filter((m: any) => m.status === 'pending_validation').length,
      };

      // Préparer les données des enfants
      const childrenSummary: ChildSummary[] = await Promise.all(
        children.map(async (child: any) => {
          // Utiliser publicId si l'id numérique n'est pas disponible
          const childId = child.id || child.publicId;
          
          if (!childId) {
            console.warn('Child without ID or publicId:', child);
            return null;
          }
          
          // Temporairement désactivé pour éviter les 404
          // const childDashboard = await this.getChildDashboard(token, childId).catch(() => null);
          const childDashboard = null;
          
          return {
            id: childId, // Utiliser l'ID disponible (numérique ou publicId)
            name: child.fullName || `${child.firstName} ${child.lastName}`.trim() || child.name,
            firstName: child.firstName,
            lastName: child.lastName,
            age: child.age || 0,
            currentPoints: child.currentPoints || 0,
            level: child.level || Math.floor((child.currentPoints || 0) / 100) + 1,
            avatar: child.avatar,
            completedMissions: childDashboard?.stats?.missionsCompleted || 0,
            activeMissions: childDashboard?.missions?.active?.length || 0,
            streak: child.dailyMissionStreak || childDashboard?.stats?.currentStreak || 0,
          };
        })
      );

      // Filtrer les enfants null
      const validChildren = childrenSummary.filter(child => child !== null);

      // Récupérer les activités récentes uniquement pour les enfants avec un ID numérique 
      // (l'endpoint history ne supporte que les IDs numériques, pas les publicId)
      const validChildIds = children
        .filter((c: any) => c.id !== undefined && c.id !== null && typeof c.id === 'number')
        .map((c: any) => c.id);
      
      const recentActivities = await this.getRecentActivities(token, validChildIds);

      return {
        stats,
        children: validChildren,
        recentActivities,
      };
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch dashboard');
    }
  }

  /**
   * Récupérer les infos du compte parent
   */
  private async getParentAccount(token: string) {
    try {
      const response = await apiClient.get(
        `${API_URL}/api/parent/account`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Parent account fetch error:', error);
      return { childrenCount: 0, children: [] };
    }
  }

  /**
   * Récupérer la liste des enfants
   */
  private async getChildren(token: string) {
    try {
      const response = await apiClient.get(
        `${API_URL}/api/children`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error) {
      console.error('Children fetch error:', error);
      return [];
    }
  }

  /**
   * Récupérer le dashboard d'un enfant
   */
  private async getChildDashboard(token: string, childId: number) {
    try {
      const response = await apiClient.get(
        `${API_URL}/api/child/dashboard/${childId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Child dashboard fetch error for child ${childId}:`, error);
      return null;
    }
  }

  /**
   * Récupérer les missions
   */
  private async getMissions(token: string) {
    try {
      const response = await apiClient.get(
        `${API_URL}/api/missions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error) {
      console.error('Missions fetch error:', error);
      return [];
    }
  }

  /**
   * Récupérer les récompenses
   */
  private async getRewards(token: string) {
    try {
      const response = await apiClient.get(
        `${API_URL}/api/rewards`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error) {
      console.error('Rewards fetch error:', error);
      return [];
    }
  }

  /**
   * Récupérer les activités récentes
   */
  private async getRecentActivities(token: string, childIds: number[]): Promise<Activity[]> {
    try {
      // Vérifier qu'on a des IDs valides
      if (!childIds || childIds.length === 0) {
        return [];
      }
      
      // Pour chaque enfant, récupérer l'historique des points
      const activities: Activity[] = [];
      
      for (const childId of childIds) {
        // Vérifier que l'ID est valide
        if (!childId || childId === undefined) {
          continue;
        }
        try {
          const response = await apiClient.get(
            `${API_URL}/api/children/${childId}/history`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                limit: 5,
              },
            }
          );
          
          const history = response.data.data || response.data || [];
          
          // Transformer l'historique en activités - vérifier que history est bien un tableau
          if (Array.isArray(history)) {
            history.forEach((item: any) => {
            activities.push({
              id: item.id,
              type: this.getActivityType(item.type || item.reason),
              childName: item.childName || 'Enfant',
              childId: childId,
              description: item.reason || item.description || 'Activité',
              points: item.points,
              timestamp: item.createdAt,
              icon: this.getActivityIcon(item.type),
              color: this.getActivityColor(item.type),
            });
            });
          }
        } catch (error: any) {
          // Gestion silencieuse des erreurs 500 de l'API history (problème backend connu)
          if (error.response?.status === 500) {
            console.warn(`⚠️  History API endpoint error for child ${childId} - backend issue`);
          } else {
            console.error(`Activity history error for child ${childId}:`, error);
          }
        }
      }
      
      // Trier par date décroissante et limiter
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Recent activities fetch error:', error);
      return [];
    }
  }

  /**
   * Déterminer le type d'activité
   */
  private getActivityType(reason: string): Activity['type'] {
    const lowerReason = (reason || '').toLowerCase();
    if (lowerReason.includes('mission') || lowerReason.includes('tâche')) {
      return 'mission_completed';
    }
    if (lowerReason.includes('récompense') || lowerReason.includes('reward')) {
      return 'reward_claimed';
    }
    if (lowerReason.includes('niveau') || lowerReason.includes('level')) {
      return 'level_up';
    }
    return 'points_earned';
  }

  /**
   * Obtenir l'icône de l'activité
   */
  private getActivityIcon(type: string): string {
    switch (type) {
      case 'mission_completed':
        return 'checkmark-circle';
      case 'reward_claimed':
        return 'gift';
      case 'level_up':
        return 'trophy';
      default:
        return 'star';
    }
  }

  /**
   * Obtenir la couleur de l'activité
   */
  private getActivityColor(type: string): string {
    switch (type) {
      case 'mission_completed':
        return '#26DE81';
      case 'reward_claimed':
        return '#FD79A8';
      case 'level_up':
        return '#54A0FF';
      default:
        return '#FFD93D';
    }
  }

  /**
   * Ajouter un enfant
   */
  async addChild(name: string, age: number | string): Promise<boolean> {
    try {
      // Essayer les deux clés possibles pour le token
      let token = await AsyncStorage.getItem('access_token');
      if (!token) {
        token = await AsyncStorage.getItem('auth_token');
      }
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.post(
        `${API_URL}/api/children`,
        {
          name,
          age: parseInt(age.toString()),
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.success === true;
    } catch (error: any) {
      console.error('Add child error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add child');
    }
  }
}

export const dashboardService = new DashboardService();