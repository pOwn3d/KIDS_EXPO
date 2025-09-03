import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api.interceptor';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface Notification {
  id: string | number;
  userId?: string | number;
  childId?: string | number;
  childName?: string;
  type: 'mission_completed' | 'reward_claimed' | 'points_earned' | 'level_up' | 'badge_earned' | 'system' | 'info';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  icon?: string;
  color?: string;
  action?: {
    type: string;
    params?: any;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

class NotificationsService {
  private async getAuthToken(): Promise<string | null> {
    try {
      let token = await AsyncStorage.getItem('access_token');
      if (!token) {
        token = await AsyncStorage.getItem('auth_token');
      }
      return token;
    } catch (error) {
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
   * Récupérer toutes les notifications
   */
  async getAllNotifications(limit: number = 50, offset: number = 0): Promise<Notification[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      
      const response = await apiClient.get(
        `${API_URL}/api/notifications`,
        {
          headers,
          params: {
            limit,
            offset,
            sort: 'created_at:desc'
          }
        }
      );


      // Gérer différentes structures de réponse possibles
      let notifications = [];
      if (response.data['hydra:member']) {
        // API Platform format
        notifications = response.data['hydra:member'];
      } else if (response.data.success && response.data.data) {
        notifications = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        notifications = response.data;
      } else if (response.data.notifications) {
        notifications = response.data.notifications;
      }

      return notifications.map((notif: any) => this.mapNotificationData(notif));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications');
    }
  }

  /**
   * Récupérer les notifications non lues
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await apiClient.get(
        `${API_URL}/api/notifications`,
        {
          headers,
          params: {
            is_read: false,
            sort: 'created_at:desc'
          }
        }
      );

      let notifications = [];
      if (response.data['hydra:member']) {
        notifications = response.data['hydra:member'];
      } else if (response.data.success && response.data.data) {
        notifications = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        notifications = response.data;
      }

      return notifications.map((notif: any) => this.mapNotificationData(notif));
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string | number): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      
      
      const response = await apiClient.patch(
        `${API_URL}/api/notifications/${notificationId}`,
        { is_read: true, read_at: new Date().toISOString() },
        { headers }
      );

      return response.status === 200 || response.status === 204;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      
      // Essayer d'abord l'endpoint spécifique
      try {
        const response = await apiClient.post(
          `${API_URL}/api/notifications/read-all`,
          {},
          { headers }
        );
        return response.status === 200 || response.status === 204;
      } catch {
        // Sinon récupérer toutes les non lues et les marquer une par une
        const unreadNotifications = await this.getUnreadNotifications();
        const promises = unreadNotifications.map(notif => this.markAsRead(notif.id));
        await Promise.all(promises);
        return true;
      }
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string | number): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await apiClient.delete(
        `${API_URL}/api/notifications/${notificationId}`,
        { headers }
      );

      return response.status === 200 || response.status === 204;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Supprimer toutes les notifications
   */
  async clearAllNotifications(): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      
      // Essayer l'endpoint de suppression groupée
      try {
        const response = await apiClient.delete(
          `${API_URL}/api/notifications`,
          { headers }
        );
        return response.status === 200 || response.status === 204;
      } catch {
        // Sinon supprimer une par une
        const notifications = await this.getAllNotifications();
        const promises = notifications.map(notif => this.deleteNotification(notif.id));
        await Promise.all(promises);
        return true;
      }
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Obtenir les statistiques des notifications
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const notifications = await this.getAllNotifications();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        today: notifications.filter(n => new Date(n.createdAt) >= today).length,
        thisWeek: notifications.filter(n => new Date(n.createdAt) >= weekAgo).length,
      };

      return stats;
    } catch (error) {
      return {
        total: 0,
        unread: 0,
        today: 0,
        thisWeek: 0,
      };
    }
  }

  /**
   * Mapper les données de notification
   */
  private mapNotificationData(data: any): Notification {
    // Déterminer le type d'icône et couleur selon le type
    const typeConfig = this.getNotificationTypeConfig(data.type);

    return {
      id: data.id || data['@id']?.split('/').pop() || Math.random().toString(),
      userId: data.user_id || data.userId,
      childId: data.child_id || data.childId,
      childName: data.child_name || data.childName,
      type: this.mapNotificationType(data.type),
      title: data.title || 'Notification',
      message: data.message || data.content || '',
      data: data.data || data.metadata,
      isRead: data.is_read !== undefined ? data.is_read : data.isRead !== undefined ? data.isRead : false,
      readAt: data.read_at || data.readAt,
      createdAt: data.created_at || data.createdAt || new Date().toISOString(),
      icon: data.icon || typeConfig.icon,
      color: data.color || typeConfig.color,
      action: data.action,
    };
  }

  /**
   * Mapper le type de notification
   */
  private mapNotificationType(type: string): Notification['type'] {
    const typeMap: Record<string, Notification['type']> = {
      'mission_completed': 'mission_completed',
      'mission_complete': 'mission_completed',
      'reward_claimed': 'reward_claimed',
      'reward_claim': 'reward_claimed',
      'points_earned': 'points_earned',
      'points_added': 'points_earned',
      'level_up': 'level_up',
      'badge_earned': 'badge_earned',
      'badge_unlocked': 'badge_earned',
      'system': 'system',
      'info': 'info',
    };

    return typeMap[type?.toLowerCase()] || 'info';
  }

  /**
   * Obtenir la configuration visuelle selon le type
   */
  private getNotificationTypeConfig(type: string): { icon: string; color: string } {
    const configs: Record<string, { icon: string; color: string }> = {
      'mission_completed': { icon: '✅', color: '#10B981' },
      'reward_claimed': { icon: '🎁', color: '#F59E0B' },
      'points_earned': { icon: '⭐', color: '#FFD700' },
      'level_up': { icon: '🎯', color: '#3B82F6' },
      'badge_earned': { icon: '🏆', color: '#8B5CF6' },
      'system': { icon: '⚙️', color: '#6B7280' },
      'info': { icon: 'ℹ️', color: '#06B6D4' },
    };

    const mappedType = this.mapNotificationType(type);
    return configs[mappedType] || configs.info;
  }

  /**
   * Créer une notification locale (pour test)
   */
  createLocalNotification(
    title: string,
    message: string,
    type: Notification['type'] = 'info'
  ): Notification {
    const config = this.getNotificationTypeConfig(type);
    return {
      id: Math.random().toString(),
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
      icon: config.icon,
      color: config.color,
    };
  }
}

export const notificationsService = new NotificationsService();
export type { Notification, NotificationStats };