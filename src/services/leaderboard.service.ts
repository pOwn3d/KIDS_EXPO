import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api.interceptor';
import { LeaderboardEntry } from '../types/api/gamification';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface LeaderboardStats {
  totalChildren: number;
  averagePoints: number;
  topPerformer: string;
  mostImproved: string;
  weeklyChampion?: string;
  monthlyChampion?: string;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';
export type LeaderboardCategory = 'points' | 'missions' | 'streak' | 'level';

class LeaderboardService {
  private async getAuthToken(): Promise<string | null> {
    try {
      let token = await AsyncStorage.getItem('access_token');
      if (!token) {
        token = await AsyncStorage.getItem('auth_token');
      }
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  private async getAuthHeaders() {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Récupérer le classement global
   */
  async getLeaderboard(
    period: LeaderboardPeriod = 'all-time',
    category: LeaderboardCategory = 'points',
    limit: number = 20
  ): Promise<LeaderboardEntry[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('🏆 Récupération du classement:', { period, category, limit });
      
      const response = await apiClient.get(
        `${API_URL}/api/leaderboard`,
        {
          headers,
          params: {
            period,
            category,
            limit
          }
        }
      );

      console.log('📊 Réponse classement:', response.data);

      // Gérer différentes structures de réponse possibles
      let leaderboardData = [];
      if (response.data.success && response.data.data) {
        leaderboardData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        leaderboardData = response.data;
      } else if (response.data.leaderboard) {
        leaderboardData = response.data.leaderboard;
      }

      return leaderboardData.map((entry: any, index: number) => this.mapLeaderboardEntry(entry, index + 1));
    } catch (error: any) {
      console.error('❌ Erreur récupération classement:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du classement');
    }
  }

  /**
   * Récupérer le classement d'un enfant spécifique
   */
  async getChildRanking(childId: string | number): Promise<LeaderboardEntry | null> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await apiClient.get(
        `${API_URL}/api/leaderboard/child/${childId}`,
        { headers }
      );

      if (response.data.success && response.data.data) {
        return this.mapLeaderboardEntry(response.data.data, response.data.data.rank);
      }

      return null;
    } catch (error: any) {
      console.error('Erreur récupération rang enfant:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du rang');
    }
  }

  /**
   * Récupérer les statistiques du classement
   */
  async getLeaderboardStats(): Promise<LeaderboardStats> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await apiClient.get(
        `${API_URL}/api/leaderboard/stats`,
        { headers }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération stats classement:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * Récupérer le top 3 du classement
   */
  async getTopThree(period: LeaderboardPeriod = 'all-time'): Promise<LeaderboardEntry[]> {
    const leaderboard = await this.getLeaderboard(period, 'points', 3);
    return leaderboard.slice(0, 3);
  }

  /**
   * Mapper les données d'une entrée du classement
   */
  private mapLeaderboardEntry(data: any, rank: number): any {
    // Le backend retourne trend au lieu de change
    const trend = data.trend || 'stable';
    const changeType = trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'same';

    return {
      id: data.id || data.childId || rank,
      rank: data.rank || rank,
      userId: String(data.id || data.childId),
      userName: data.name || data.childName || 'Enfant',
      childName: data.name || data.childName || 'Enfant',
      avatar: data.avatar || '👤',
      score: data.points || data.totalPoints || 0,
      points: data.points || data.totalPoints || 0,
      totalPoints: data.points || data.totalPoints || 0,
      missionsCompleted: data.missionsCompleted || 0,
      streak: data.streak || 0,
      level: data.level || 1,
      badges: data.badges || 0,
      change: changeType,
      badge: data.currentBadge || data.badge
    };
  }
}

export const leaderboardService = new LeaderboardService();