import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useNavigation } from '@react-navigation/native';
import { AnimatedCard, Button3D } from '../../components/ui';
import { useDashboard, useAuth } from '../../hooks';
import WebHeader from '../../components/layout/WebHeader';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;
const isLargeDesktop = screenWidth >= 1440;

// Calculate responsive grid columns
const getGridColumns = () => {
  if (isLargeDesktop) return 4;
  if (isDesktop) return 3;
  if (isTablet) return 2;
  return 1;
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
}

interface QuickActionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, subtitle, trend }) => {
  const theme = useTheme();
  const cardWidth = isDesktop 
    ? (screenWidth - 320) / getGridColumns() - 20 
    : isTablet 
    ? (screenWidth - 100) / 2 - 20
    : screenWidth - 40;
  
  return (
    <View style={[styles.statCard, { width: cardWidth, minWidth: 200 }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardHeader}>
          <View style={styles.statCardIcon}>
            <Ionicons name={icon} size={28} color="#FFFFFF" />
          </View>
          {trend && (
            <View style={styles.trendContainer}>
              <Ionicons 
                name={trend.isPositive ? "trending-up" : "trending-down"} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.trendText}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Text>
            </View>
          )}
        </View>
        <View style={styles.statCardContent}>
          <Text style={styles.statCardValue}>{value}</Text>
          <Text style={styles.statCardTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.statCardSubtitle}>{subtitle}</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, color, onPress }) => {
  const theme = useTheme();
  const actionWidth = isDesktop 
    ? (screenWidth - 320) / 6 - 12
    : isTablet 
    ? (screenWidth - 100) / 4 - 12
    : (screenWidth - 40) / 3 - 12;
  
  return (
    <TouchableOpacity 
      style={[
        styles.quickAction, 
        { 
          backgroundColor: theme.colors.card,
          width: actionWidth,
          minWidth: 90,
          maxWidth: 140,
        }
      ]}
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text 
        style={[styles.quickActionTitle, { color: theme.colors.text }]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const ResponsiveParentDashboard: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { 
    parentData,
    parentQuickActions,
    activityFeed,
    isSyncing,
    refreshDashboard 
  } = useDashboard();
  
  // Extraire les données du parentData
  const children = parentData?.children?.list || [];
  const stats = parentData?.stats || {};
  const missions = parentData?.missions || {};
  const rewards = parentData?.rewards || {};
  const points = parentData?.points || {};
  const pendingMissions = [];
  const pendingRewards = [];
  const recentActivities = activityFeed || [];
  const isLoading = isSyncing;
  
  const [refreshing, setRefreshing] = useState(false);
  const [childName, setChildName] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDashboard();
    setRefreshing(false);
  };

  const handleAddChild = async () => {
    if (!childName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom');
      return;
    }
    
    try {
      setAddChildModalVisible(false);
      setChildName('');
      Alert.alert('Succès', 'Enfant ajouté avec succès');
      await refreshDashboard();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'enfant');
    }
  };

  const quickActions = [
    { 
      title: 'Nouvelle Mission', 
      icon: 'add-circle' as keyof typeof Ionicons.glyphMap, 
      color: '#10B981',
      onPress: () => navigation.navigate('Missions' as never, { screen: 'CreateMission' } as never)
    },
    { 
      title: 'Nouvelle Récompense', 
      icon: 'gift' as keyof typeof Ionicons.glyphMap, 
      color: '#F59E0B',
      onPress: () => navigation.navigate('Rewards' as never, { screen: 'CreateReward' } as never)
    },
    { 
      title: 'Valider Missions', 
      icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap, 
      color: '#A855F7',
      onPress: () => navigation.navigate('Missions' as never, { screen: 'MissionValidation' } as never)
    },
    { 
      title: 'Approuver Récompenses', 
      icon: 'ribbon' as keyof typeof Ionicons.glyphMap, 
      color: '#EC4899',
      onPress: () => navigation.navigate('Rewards' as never, { screen: 'RewardClaims' } as never)
    },
    { 
      title: 'Gérer Punitions', 
      icon: 'warning' as keyof typeof Ionicons.glyphMap, 
      color: '#EF4444',
      onPress: () => navigation.navigate('Punishments' as never, { screen: 'PunishmentManagement' } as never)
    },
    { 
      title: 'Statistiques', 
      icon: 'stats-chart' as keyof typeof Ionicons.glyphMap, 
      color: '#6366F1',
      onPress: () => navigation.navigate('Dashboard' as never)
    },
  ];

  const statsCards = [
    {
      title: 'Enfants Actifs',
      value: children?.length || 0,
      icon: 'people' as keyof typeof Ionicons.glyphMap,
      gradient: ['#0EA5E9', '#0284C7'],
      subtitle: 'dans la famille',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Missions en Attente',
      value: missions.active || missions.total || 0,
      icon: 'time' as keyof typeof Ionicons.glyphMap,
      gradient: ['#10B981', '#059669'],
      subtitle: 'à valider',
      trend: { value: 5, isPositive: false }
    },
    {
      title: 'Récompenses Disponibles',
      value: rewards.total || 0,
      icon: 'gift' as keyof typeof Ionicons.glyphMap,
      gradient: ['#F59E0B', '#D97706'],
      subtitle: 'à approuver',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Points Distribués',
      value: points.total || 0,
      icon: 'star' as keyof typeof Ionicons.glyphMap,
      gradient: ['#A855F7', '#9333EA'],
      subtitle: 'au total',
      trend: { value: 25, isPositive: true }
    },
  ];

  if (isSyncing && !refreshing && !parentData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const contentPadding = isDesktop ? 40 : isTablet ? 24 : 16;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      {/* Pas de header sur desktop - on utilise seulement la sidebar */}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { padding: contentPadding }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={[styles.header, { marginBottom: isDesktop ? 32 : 24, marginTop: isDesktop ? 24 : 0 }]}>
          <View>
            <Text style={[styles.welcomeText, { fontSize: isDesktop ? 32 : 28 }]}>
              Bonjour, {user?.firstName || 'Parent'} 👋
            </Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          {!isDesktop && (
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Grid */}
        <View style={[
          styles.statsGrid,
          { 
            flexDirection: isTablet ? 'row' : 'column',
            flexWrap: isTablet ? 'wrap' : 'nowrap',
            gap: 10,
          }
        ]}>
          {statsCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { marginTop: isDesktop ? 40 : 32 }]}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={[
            styles.quickActionsGrid,
            {
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: isDesktop ? 'flex-start' : 'space-between',
            }
          ]}>
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={[styles.section, { marginTop: isDesktop ? 40 : 32 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activités Récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard' as never)}>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                Voir tout →
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.activitiesContainer,
            { 
              flexDirection: isDesktop ? 'row' : 'column',
              gap: 16,
            }
          ]}>
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.slice(0, isDesktop ? 6 : 3).map((activity, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.activityCard,
                    { 
                      backgroundColor: theme.colors.card,
                      flex: isDesktop ? 1 : undefined,
                      minWidth: isDesktop ? 280 : undefined,
                    }
                  ]}
                >
                  <View style={styles.activityIcon}>
                    <Ionicons 
                      name={activity.icon || 'information-circle'} 
                      size={20} 
                      color={activity.color || theme.colors.primary} 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={theme.colors.disabled} />
                <Text style={styles.emptyStateText}>Aucune activité récente</Text>
              </View>
            )}
          </View>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsGrid: {
    marginTop: 24,
  },
  statCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardGradient: {
    padding: 20,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  trendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statCardContent: {
    alignItems: 'flex-start',
  },
  statCardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statCardTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  statCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsGrid: {
    marginTop: 16,
    gap: 10,
  },
  quickAction: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  activitiesContainer: {
    marginTop: 16,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#1F2937',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  confirmButton: {
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Desktop Header Styles
  desktopHeader: {
    paddingHorizontal: 40,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  desktopHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
  },
  desktopHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopHeaderIcon: {
    marginRight: 16,
  },
  desktopHeaderTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginRight: 24,
  },
  desktopHeaderSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
  desktopHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  desktopNotificationButton: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
  },
  desktopNotificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  desktopNotificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  desktopProfileButton: {
    padding: 4,
  },
  desktopProfileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  desktopProfileAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
});

export default ResponsiveParentDashboard;