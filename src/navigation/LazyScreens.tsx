/**
 * Lazy Loaded Screens
 * Performance optimization with code splitting
 */

import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Loading component
const ScreenLoader = () => (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color="#0EA5E9" />
  </View>
);

// Wrapper for lazy loaded screens
export const withLazyLoading = (Component: React.LazyExoticComponent<any>) => {
  return (props: any) => (
    <Suspense fallback={<ScreenLoader />}>
      <Component {...props} />
    </Suspense>
  );
};

// Lazy loaded screens with code splitting
export const LazyScreens = {
  // Dashboard
  DashboardHome: lazy(() => import('../screens/dashboard/DashboardHomeScreen')),
  ParentDashboard: lazy(() => import('../screens/dashboard/ParentDashboardScreen')),
  
  // Auth
  Login: lazy(() => import('../screens/auth/LoginScreen')),
  Register: lazy(() => import('../screens/auth/RegisterScreen')),
  
  // Children
  ChildrenList: lazy(() => import('../screens/children/ChildrenListScreen')),
  ChildDetail: lazy(() => import('../screens/children/ChildDetailScreen')),
  AddChild: lazy(() => import('../screens/children/AddChildScreen')),
  
  // Missions
  MissionsList: lazy(() => import('../screens/missions/MissionsListScreen')),
  MissionDetail: lazy(() => import('../screens/missions/MissionDetailScreen')),
  CreateMission: lazy(() => import('../screens/missions/CreateMissionScreen')),
  MissionValidation: lazy(() => import('../screens/missions/MissionValidationScreen')),
  
  // Rewards
  RewardsList: lazy(() => import('../screens/rewards/RewardsListScreen')),
  RewardDetail: lazy(() => import('../screens/rewards/RewardDetailScreen')),
  CreateReward: lazy(() => import('../screens/rewards/CreateRewardScreen')),
  RewardClaims: lazy(() => import('../screens/rewards/RewardClaimsScreen')),
  
  // Punishments
  PunishmentsList: lazy(() => import('../screens/punishments/PunishmentsListScreen')),
  CreatePunishment: lazy(() => import('../screens/punishments/CreatePunishmentScreen')),
  
  // Others
  Leaderboard: lazy(() => import('../screens/leaderboard/LeaderboardScreen')),
  Profile: lazy(() => import('../screens/profile/ProfileScreen')),
  Settings: lazy(() => import('../screens/settings/SettingsScreen')),
  Activities: lazy(() => import('../screens/activities/ActivitiesScreen')),
  Badges: lazy(() => import('../screens/badges/BadgesScreen')),
  Notifications: lazy(() => import('../screens/notifications/NotificationsListScreen')),
};

// Create lazy wrapped components
export const LazyDashboardHome = withLazyLoading(LazyScreens.DashboardHome);
export const LazyParentDashboard = withLazyLoading(LazyScreens.ParentDashboard);
export const LazyLogin = withLazyLoading(LazyScreens.Login);
export const LazyRegister = withLazyLoading(LazyScreens.Register);
export const LazyChildrenList = withLazyLoading(LazyScreens.ChildrenList);
export const LazyChildDetail = withLazyLoading(LazyScreens.ChildDetail);
export const LazyAddChild = withLazyLoading(LazyScreens.AddChild);
export const LazyMissionsList = withLazyLoading(LazyScreens.MissionsList);
export const LazyMissionDetail = withLazyLoading(LazyScreens.MissionDetail);
export const LazyCreateMission = withLazyLoading(LazyScreens.CreateMission);
export const LazyMissionValidation = withLazyLoading(LazyScreens.MissionValidation);
export const LazyRewardsList = withLazyLoading(LazyScreens.RewardsList);
export const LazyRewardDetail = withLazyLoading(LazyScreens.RewardDetail);
export const LazyCreateReward = withLazyLoading(LazyScreens.CreateReward);
export const LazyRewardClaims = withLazyLoading(LazyScreens.RewardClaims);
export const LazyPunishmentsList = withLazyLoading(LazyScreens.PunishmentsList);
export const LazyCreatePunishment = withLazyLoading(LazyScreens.CreatePunishment);
export const LazyLeaderboard = withLazyLoading(LazyScreens.Leaderboard);
export const LazyProfile = withLazyLoading(LazyScreens.Profile);
export const LazySettings = withLazyLoading(LazyScreens.Settings);
export const LazyActivities = withLazyLoading(LazyScreens.Activities);
export const LazyBadges = withLazyLoading(LazyScreens.Badges);
export const LazyNotifications = withLazyLoading(LazyScreens.Notifications);

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});