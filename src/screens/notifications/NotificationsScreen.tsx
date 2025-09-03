import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { 
  notificationsService, 
  type Notification,
  type NotificationStats 
} from '../../services/notifications.service';

const NotificationsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'toutes' | 'non_lues'>('toutes');

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      const allNotifications = await notificationsService.getAllNotifications();
      setNotifications(allNotifications);
    } catch (error: any) {
      // Ne pas afficher d'alerte pour ne pas bloquer l'utilisateur
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const notificationStats = await notificationsService.getNotificationStats();
      setStats(notificationStats);
    } catch (error) {
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadNotifications(), loadStats()]);
    setIsRefreshing(false);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      const success = await notificationsService.markAsRead(notification.id);
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        // Mettre à jour les stats
        if (stats) {
          setStats({ ...stats, unread: Math.max(0, stats.unread - 1) });
        }
      }
    } catch (error) {
    }
  };

  const handleMarkAllAsRead = async () => {
    Alert.alert(
      'Tout marquer comme lu',
      'Marquer toutes les notifications comme lues ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const success = await notificationsService.markAllAsRead();
              if (success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                if (stats) {
                  setStats({ ...stats, unread: 0 });
                }
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de marquer les notifications comme lues');
            }
          },
        },
      ]
    );
  };

  const handleDeleteNotification = async (notification: Notification) => {
    Alert.alert(
      'Supprimer',
      'Supprimer cette notification ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await notificationsService.deleteNotification(notification.id);
              if (success) {
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
                // Mettre à jour les stats
                if (stats) {
                  setStats({
                    ...stats,
                    total: Math.max(0, stats.total - 1),
                    unread: notification.isRead ? stats.unread : Math.max(0, stats.unread - 1),
                  });
                }
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la notification');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Tout effacer',
      'Supprimer toutes les notifications ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer tout',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await notificationsService.clearAllNotifications();
              if (success) {
                setNotifications([]);
                setStats({
                  total: 0,
                  unread: 0,
                  today: 0,
                  thisWeek: 0,
                });
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer les notifications');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getFilteredNotifications = () => {
    if (selectedTab === 'non_lues') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: notification.isRead ? theme.colors.surface : `${theme.colors.primary}10`,
          borderLeftColor: notification.color || theme.colors.primary,
        },
      ]}
      onPress={() => handleMarkAsRead(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${notification.color}20` }]}>
          <Text style={styles.notificationIcon}>{notification.icon}</Text>
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
              {notification.title}
            </Text>
            {!notification.isRead && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]} />
            )}
          </View>
          <Text style={[styles.notificationMessage, { color: theme.colors.textSecondary }]}>
            {notification.message}
          </Text>
          {notification.childName && (
            <Text style={[styles.childName, { color: theme.colors.primary }]}>
              👶 {notification.childName}
            </Text>
          )}
          <Text style={[styles.notificationTime, { color: theme.colors.textLight }]}>
            {formatDate(notification.createdAt)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(notification)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const TabButton: React.FC<{
    title: string;
    isActive: boolean;
    onPress: () => void;
    count?: number;
  }> = ({ title, isActive, onPress, count }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive ? theme.colors.primary : 'transparent',
          borderBottomWidth: isActive ? 0 : 1,
          borderBottomColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.tabButtonText,
          {
            color: isActive ? '#FFFFFF' : theme.colors.text,
            fontWeight: isActive ? '600' : 'normal',
          },
        ]}
      >
        {title}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.tabBadge, { backgroundColor: isActive ? '#FFFFFF20' : theme.colors.error }]}>
          <Text style={[styles.tabBadgeText, { color: '#FFFFFF' }]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement des notifications...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Notifications
            </Text>
            {stats && (
              <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                {stats.unread > 0 ? `${stats.unread} non lue${stats.unread > 1 ? 's' : ''}` : 'Tout est lu'}
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            {notifications.some(n => !n.isRead) && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleMarkAllAsRead}
              >
                <Ionicons name="checkmark-done" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleClearAll}
              >
                <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Stats Bar */}
      {stats && (
        <View style={[styles.statsBar, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.today}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Aujourd'hui</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.thisWeek}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Cette semaine</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}>
        <TabButton
          title="Toutes"
          isActive={selectedTab === 'toutes'}
          onPress={() => setSelectedTab('toutes')}
          count={notifications.length}
        />
        <TabButton
          title="Non lues"
          isActive={selectedTab === 'non_lues'}
          onPress={() => setSelectedTab('non_lues')}
          count={stats?.unread}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {selectedTab === 'non_lues' ? 'Aucune notification non lue' : 'Aucune notification'}
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              {selectedTab === 'non_lues'
                ? 'Toutes vos notifications ont été lues'
                : 'Vous recevrez ici les notifications concernant vos enfants'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginVertical: 8,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderRadius: 20,
  },
  tabButtonText: {
    fontSize: 16,
  },
  tabBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationsList: {
    padding: Platform.OS === 'web' ? 40 : 20,
  },
  notificationItem: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  childName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default NotificationsScreen;