import { useCallback } from 'react';
import { useAppSelector } from './redux';
import {
  selectDashboardSummary,
  selectIsAnySyncing,
  selectSyncStatuses,
  selectSyncErrors,
} from '../store/store';
import { useAuth } from './useAuth';
import { useChildren } from './useChildren';
import { useMissions } from './useMissions';
import { useRewards } from './useRewards';
import { usePunishments } from './usePunishments';

export const useDashboard = () => {
  const { user, isParent, isChild } = useAuth();
  const { children, fetchChildren, totalPoints, averageLevel } = useChildren();
  const { missions, missionStats, fetchMissions, recentMissions } = useMissions();
  const { rewards, rewardStats, fetchRewards, recentClaims } = useRewards();
  const { punishments, punishmentStats, fetchPunishments, totalActivePunishments } = usePunishments();
  
  // Dashboard summary selector
  const dashboardSummary = useAppSelector(selectDashboardSummary);
  const isSyncing = useAppSelector(selectIsAnySyncing);
  const syncStatuses = useAppSelector(selectSyncStatuses);
  const syncErrors = useAppSelector(selectSyncErrors);

  // Refresh all dashboard data
  const refreshDashboard = useCallback(async () => {
    const promises = [
      fetchChildren(),
      fetchMissions(),
      fetchRewards(),
      fetchPunishments(),
    ];
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
    }
  }, [fetchChildren, fetchMissions, fetchRewards, fetchPunishments]);

  // Parent-specific dashboard data
  const getParentDashboardData = useCallback(() => {
    if (!isParent) return null;

    const dashboardData = {
      childrenCount: children.length,
      children: children,
      missionStats: missionStats,
      rewardStats: rewardStats
    };

    const activeChildren = children.filter(child => child.isActive !== false);
    
    return {
      summary: dashboardSummary,
      children: {
        total: children.length,
        active: activeChildren.length,
        list: children,
      },
      points: {
        total: totalPoints,
        average: Math.round(totalPoints / Math.max(children.length, 1)),
        distribution: children.map(child => ({
          id: child.id,
          name: child.name || child.firstName || `${child.firstName || ''} ${child.lastName || ''}`.trim() || 'Enfant',
          points: child.currentPoints || 0,
        })),
      },
      missions: {
        ...missionStats,
        recent: recentMissions,
      },
      rewards: {
        ...rewardStats,
        recent: recentClaims,
      },
      punishments: {
        ...punishmentStats,
        activeCount: totalActivePunishments,
      },
      stats: {
        averageLevel,
        totalActivePunishments,
        pendingValidations: rewardStats.pendingClaims,
      },
    };
  }, [
    isParent, 
    dashboardSummary, 
    children, 
    totalPoints, 
    averageLevel,
    missionStats, 
    recentMissions,
    rewardStats, 
    recentClaims,
    punishmentStats,
    totalActivePunishments,
  ]);

  // Child-specific dashboard data
  const getChildDashboardData = useCallback(() => {
    if (!isChild || !user) return null;

    const childId = user.id;
    
    return {
      summary: dashboardSummary,
      profile: {
        id: childId,
        name: `${user.firstName} ${user.lastName}`,
        currentPoints: user.currentPoints || 0,
        level: user.level || 1,
      },
      missions: {
        total: missionStats.total,
        active: missionStats.active,
        completed: missionStats.completed,
        recent: recentMissions.filter(m => 
          m.assignedTo === childId || 
          m.child === `/api/children/${childId}`
        ),
      },
      rewards: {
        availableCount: rewardStats.total,
        claimedCount: recentClaims.filter(claim => 
          claim.child === `/api/children/${childId}`
        ).length,
      },
      restrictions: {
        hasActive: totalActivePunishments > 0,
        count: totalActivePunishments,
      },
    };
  }, [
    isChild, 
    user, 
    dashboardSummary,
    missionStats, 
    recentMissions,
    rewardStats, 
    recentClaims,
    totalActivePunishments,
  ]);

  // Quick actions for parents
  const getParentQuickActions = useCallback(() => [
    {
      id: 'add_child',
      title: 'Ajouter Enfant',
      icon: 'person-add' as const,
      color: '#4ECDC4',
      route: 'Children',
    },
    {
      id: 'create_mission',
      title: 'Créer Mission',
      icon: 'add-circle' as const,
      color: '#45B7D1',
      route: 'Missions',
    },
    {
      id: 'create_reward',
      title: 'Créer Récompense',
      icon: 'gift' as const,
      color: '#FFA07A',
      route: 'Rewards',
    },
    {
      id: 'manage_points',
      title: 'Gérer Points',
      icon: 'star' as const,
      color: '#FFD93D',
      route: 'Children',
    },
    {
      id: 'validate_claims',
      title: 'Valider Demandes',
      icon: 'checkmark-circle' as const,
      color: '#6BCF7F',
      route: 'Validations',
      badge: rewardStats.pendingClaims > 0 ? rewardStats.pendingClaims : undefined,
    },
    {
      id: 'view_analytics',
      title: 'Analytics',
      icon: 'analytics' as const,
      color: '#A8E6CF',
      route: 'Analytics',
    },
  ], [rewardStats.pendingClaims]);

  // Quick actions for children
  const getChildQuickActions = useCallback(() => [
    {
      id: 'view_missions',
      title: 'Mes Missions',
      icon: 'list' as const,
      color: '#45B7D1',
      route: 'Missions',
      badge: missionStats.active > 0 ? missionStats.active : undefined,
    },
    {
      id: 'view_rewards',
      title: 'Récompenses',
      icon: 'gift' as const,
      color: '#FFA07A',
      route: 'Rewards',
    },
    {
      id: 'view_profile',
      title: 'Mon Profil',
      icon: 'person' as const,
      color: '#98D8C8',
      route: 'Profile',
    },
    {
      id: 'leaderboard',
      title: 'Classement',
      icon: 'trophy' as const,
      color: '#FFD93D',
      route: 'Leaderboard',
    },
  ], [missionStats.active]);

  // Activity feed
  const getActivityFeed = useCallback(() => {
    const activities: Array<{
      id: string;
      type: 'mission' | 'reward' | 'punishment' | 'points';
      title: string;
      subtitle: string;
      timestamp: string;
      icon: string;
      color: string;
      points?: number;
    }> = [];

    // Add recent missions
    recentMissions.slice(0, 3).forEach(mission => {
      activities.push({
        id: `mission_${mission.id}`,
        type: 'mission',
        title: mission.title || 'Mission',
        subtitle: `Status: ${mission.status}`,
        timestamp: mission.updatedAt || mission.createdAt || '',
        icon: 'rocket',
        color: '#45B7D1',
        points: mission.pointsReward,
      });
    });

    // Add recent reward claims
    recentClaims.slice(0, 3).forEach(claim => {
      activities.push({
        id: `claim_${claim.id}`,
        type: 'reward',
        title: claim.rewardName || 'Récompense',
        subtitle: `Status: ${claim.status}`,
        timestamp: claim.claimedAt || '',
        icon: 'gift',
        color: '#FFA07A',
        points: -claim.pointsCost,
      });
    });

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
  }, [recentMissions, recentClaims]);

  // Health indicators
  const getSystemHealth = useCallback(() => {
    return {
      overall: syncErrors.length === 0 ? 'healthy' : 'degraded',
      syncing: isSyncing,
      errors: syncErrors,
      lastSync: Math.max(
        ...Object.values(syncStatuses)
          .map(status => status === 'succeeded' ? Date.now() : 0)
      ),
      components: {
        children: syncStatuses.children,
        missions: syncStatuses.missions,
        rewards: syncStatuses.rewards,
        punishments: syncStatuses.punishments,
      },
    };
  }, [isSyncing, syncErrors, syncStatuses]);

  const parentData = getParentDashboardData();
  const childData = getChildDashboardData();
  
  return {
    // Core data
    dashboardSummary,
    isSyncing,
    syncStatuses,
    syncErrors,
    
    // Actions
    refreshDashboard,
    
    // Role-specific data
    parentData,
    childData,
    
    // Quick actions
    parentQuickActions: getParentQuickActions(),
    childQuickActions: getChildQuickActions(),
    
    // Additional data
    activityFeed: getActivityFeed(),
    systemHealth: getSystemHealth(),
    
    // Utilities
    isParent,
    isChild,
    currentUser: user,
  };
};