import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { useRoute, useNavigation } from '@react-navigation/native';
import { childrenService, type Child, type ChildStatistics, type ChildActivity } from '../../services/children.service';


interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );
};

const ChildProfileScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const childId = (route.params as any)?.childId;
  
  const [child, setChild] = useState<Child | null>(null);
  const [statistics, setStatistics] = useState<ChildStatistics | null>(null);
  const [recentActivity, setRecentActivity] = useState<ChildActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChildProfile();
  }, [childId]);

  const loadChildProfile = async () => {
    if (!childId) return;
    
    try {
      setIsLoading(true);
      
      // Load child data, statistics, and activity in parallel
      const [childData, statsData, activityData] = await Promise.all([
        childrenService.getChildById(childId),
        childrenService.getChildStatistics(childId),
        childrenService.getChildActivity(childId, 5)
      ]);
      
      setChild(childData);
      setStatistics(statsData);
      setRecentActivity(activityData || []);
    } catch (error) {
      console.error('Failed to load child profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarDisplay = (avatar: string) => {
    if (avatar && avatar !== 'default.png' && !avatar.startsWith('👤')) {
      return avatar;
    }
    return '👦';
  };

  const getLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };

  const getNextLevelPoints = (currentPoints: number) => {
    const currentLevel = getLevel(currentPoints);
    const nextLevelPoints = currentLevel * 100;
    return nextLevelPoints - currentPoints;
  };

  const getProgressPercentage = (currentPoints: number) => {
    const level = getLevel(currentPoints);
    const levelStartPoints = (level - 1) * 100;
    const levelEndPoints = level * 100;
    const progressInLevel = currentPoints - levelStartPoints;
    const levelRange = levelEndPoints - levelStartPoints;
    return (progressInLevel / levelRange) * 100;
  };

  const formatActivityTime = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `il y a ${diffInHours}h`;
    } else if (diffInHours < 48) {
      return 'hier';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `il y a ${diffInDays} jours`;
    }
  };

  // Navigation handlers for quick actions
  const handleViewMissions = () => {
    (navigation as any).navigate('Main', {
      screen: 'Missions',
      params: {
        screen: 'MissionsList',
        params: { childId, filter: 'all' }
      }
    });
  };

  const handleViewRewards = () => {
    (navigation as any).navigate('Main', {
      screen: 'Rewards',
      params: {
        screen: 'RewardsShop',
        params: { childId }
      }
    });
  };

  const handleViewAchievements = () => {
    (navigation as any).navigate('Main', {
      screen: 'Profile',
      params: {
        screen: 'Achievements',
        params: { userId: childId }
      }
    });
  };

  const handleViewStatistics = () => {
    (navigation as any).navigate('Main', {
      screen: 'Analytics',
      params: {
        screen: 'DetailedStats',
        params: { type: 'missions', childId }
      }
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!child) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Profil enfant introuvable
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.colors.background }]}>
              <Text style={styles.avatarText}>{getAvatarDisplay(child.avatar)}</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.levelText}>N{child.level}</Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.childName, { color: theme.colors.text }]}>
              {child.firstName} {child.lastName}
            </Text>
            <Text style={[styles.childAge, { color: theme.colors.textSecondary }]}>
              {child.age} ans
            </Text>
            
            <View style={styles.pointsContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={[styles.pointsText, { color: theme.colors.text }]}>
                {child.currentPoints} points
              </Text>
            </View>
            
            {/* Progress to Next Level */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: `${theme.colors.primary}20` }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: theme.colors.primary,
                      width: `${getProgressPercentage(child.currentPoints)}%`
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                {getNextLevelPoints(child.currentPoints)} pts vers le niveau {child.level + 1}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="flame"
            title="Série"
            value={`${statistics?.streak || child.streak || 0} jours`}
            color="#FF6B35"
          />
          <StatCard
            icon="checkmark-circle"
            title="Missions complétées"
            value={statistics?.missionsCompleted || child.completedMissions || 0}
            color="#10B981"
          />
          <StatCard
            icon="list-circle"
            title="Missions actives"
            value={child.activeMissions || 0}
            color="#3B82F6"
          />
          <StatCard
            icon="trophy"
            title="Niveau"
            value={child.level}
            color="#F59E0B"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Actions rapides
          </Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={handleViewMissions}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={24} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Mes missions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={handleViewRewards}
              activeOpacity={0.7}
            >
              <Ionicons name="gift" size={24} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Mes récompenses
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={handleViewAchievements}
              activeOpacity={0.7}
            >
              <Ionicons name="trophy" size={24} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Mes succès
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={handleViewStatistics}
              activeOpacity={0.7}
            >
              <Ionicons name="bar-chart" size={24} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Statistiques
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Activité récente
          </Text>
          
          <View style={[styles.activityCard, { backgroundColor: theme.colors.surface }]}>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <View key={activity.id || index} style={styles.activityItem}>
                  <Ionicons 
                    name={activity.icon as any} 
                    size={20} 
                    color={activity.color} 
                  />
                  <Text style={[styles.activityText, { color: theme.colors.text }]}>
                    {activity.title}
                  </Text>
                  <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>
                    {formatActivityTime(activity.createdAt)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.activityItem}>
                <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.activityText, { color: theme.colors.textSecondary }]}>
                  Aucune activité récente
                </Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  childAge: {
    fontSize: 16,
    marginBottom: 12,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 200 : 150,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 120 : 100,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  activityCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
  },
});

export default ChildProfileScreen;