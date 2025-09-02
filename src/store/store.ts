import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

// Import reducers (we'll create these next)
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import missionsReducer from './slices/missionsSlice';
import rewardsReducer from './slices/rewardsSlice';
import childrenReducer from './slices/childrenSlice';
import punishmentsReducer from './slices/punishmentsSlice';
import gamificationReducer from './slices/gamificationSlice';
import sparkyReducer from './slices/sparkySlice';
import analyticsReducer from './slices/analyticsSlice';
import uiReducer from './slices/uiSlice';
import offlineReducer from './slices/offlineSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: [
    'auth', 
    'user', 
    'missions', 
    'rewards', 
    'children',
    'punishments',
    'gamification',
    'ui', // For theme preferences, etc.
  ],
  blacklist: [
    'sparky', // Don't persist chat conversations (too large)
    'analytics', // Don't persist analytics (refreshed on load)
    'offline', // Managed separately
  ],
};

// Auth slice has special persistence needs
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['isAuthenticated', 'user', 'sessionExpiry', 'pinValidUntil', 'invitationToken', 'invitationValid', 'invitationData'],
  blacklist: ['isLoading', 'error', 'lastActivity'],
};

// UI slice persistence for theme and settings
const uiPersistConfig = {
  key: 'ui',
  storage: AsyncStorage,
  whitelist: ['theme', 'platform'],
  blacklist: ['modals', 'notifications', 'loadingStates', 'navigation'],
};

// Offline slice has its own persistence
const offlinePersistConfig = {
  key: 'offline',
  storage: AsyncStorage,
  whitelist: ['pendingActions', 'syncQueue'],
  blacklist: ['isOffline', 'lastSyncAt', 'conflictResolution'],
};

// Root reducer
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  user: userReducer,
  missions: missionsReducer,
  rewards: rewardsReducer,
  children: childrenReducer,
  punishments: punishmentsReducer,
  gamification: gamificationReducer,
  sparky: sparkyReducer,
  analytics: analyticsReducer,
  ui: persistReducer(uiPersistConfig, uiReducer),
  offline: persistReducer(offlinePersistConfig, offlineReducer),
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
      immutableCheck: {
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => ReturnType;

// Selectors for common state patterns
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectUserRole = (state: RootState) => state.auth.user?.role;
export const selectIsParent = (state: RootState) => state.auth.user?.role === 'PARENT';
export const selectIsChild = (state: RootState) => state.auth.user?.role === 'CHILD';
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectPlatform = (state: RootState) => state.ui.platform;
export const selectIsOffline = (state: RootState) => state.offline.isOffline;
export const selectPendingActions = (state: RootState) => state.offline.pendingActions;

// Loading state selectors
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectMissionsLoading = (state: RootState) => state.missions.isLoading;
export const selectRewardsLoading = (state: RootState) => state.rewards.isLoading;
export const selectChildrenLoading = (state: RootState) => state.children.isLoading;
export const selectPunishmentsLoading = (state: RootState) => state.punishments.isLoading;
export const selectGamificationLoading = (state: RootState) => state.gamification.isLoading;
export const selectAnalyticsLoading = (state: RootState) => state.analytics.isLoading;

// Combined loading selector
export const selectIsAnyLoading = (state: RootState) => 
  state.auth.isLoading ||
  state.missions.isLoading ||
  state.rewards.isLoading ||
  state.children.isLoading ||
  state.punishments.isLoading ||
  state.gamification.isLoading ||
  state.analytics.isLoading;

// Error selectors
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectMissionsError = (state: RootState) => state.missions.error;
export const selectRewardsError = (state: RootState) => state.rewards.error;
export const selectChildrenError = (state: RootState) => state.children.error;
export const selectPunishmentsError = (state: RootState) => state.punishments.error;

// Data selectors
export const selectAllMissions = (state: RootState) => state.missions.missions || [];
export const selectSelectedMission = (state: RootState) => state.missions.selectedMission;
export const selectMissionFilters = (state: RootState) => state.missions.filters;

export const selectAllRewards = (state: RootState) => state.rewards.rewards;
export const selectSelectedReward = (state: RootState) => state.rewards.selectedReward;
export const selectRewardClaims = (state: RootState) => state.rewards.claims;
export const selectRewardCart = (state: RootState) => state.rewards.cart;

export const selectAllChildren = (state: RootState) => state.children.children;
export const selectSelectedChild = (state: RootState) => state.children.selectedChild;
export const selectChildStatistics = (state: RootState) => state.children.childStatistics;
export const selectChildActivities = (state: RootState) => state.children.childActivities;

export const selectAllPunishments = (state: RootState) => state.punishments.punishments;
export const selectSelectedPunishment = (state: RootState) => state.punishments.selectedPunishment;
export const selectPunishmentRecommendations = (state: RootState) => state.punishments.recommendations;
export const selectActivePunishmentsByChild = (state: RootState) => state.punishments.activePunishmentsByChild;
export const selectPunishmentHistoryByChild = (state: RootState) => state.punishments.historyByChild;

export const selectTournaments = (state: RootState) => state.gamification.tournaments;
export const selectGuilds = (state: RootState) => state.gamification.guilds;
export const selectLeaderboards = (state: RootState) => state.gamification.leaderboards;

// Derived selectors
export const selectChildrenOptions = (state: RootState) => 
  state.children.children.map(child => ({
    label: `${child.firstName} ${child.lastName}`,
    value: child.id,
    avatar: child.avatar,
  }));

export const selectAvailableRewards = (state: RootState) => 
  state.rewards.rewards.filter(reward => 
    reward.isActive && 
    (reward.maxStock === null || (reward.currentStock || 0) > 0)
  );

export const selectPendingMissions = (state: RootState) => 
  (state.missions.missions || []).filter(mission => 
    mission.status === 'COMPLETED' || mission.status === 'IN_PROGRESS'
  );

// Statistics selectors
export const selectUserStats = (state: RootState, userId: string) => 
  state.children.stats[userId];

export const selectTotalPoints = (state: RootState) => {
  const currentUser = state.auth.user;
  if (currentUser?.role === 'CHILD') {
    return (currentUser as any).totalPoints || 0;
  }
  
  // For parents, sum all children's points
  return state.children.children.reduce((total, child) => total + (child.totalPointsEarned || 0), 0);
};

// Notification selectors
export const selectUnreadNotifications = (state: RootState) =>
  state.ui.notifications.filter(notification => !notification.isRead);

export const selectNotificationCount = (state: RootState) =>
  state.ui.notifications.filter(notification => !notification.isRead).length;

// Modal selectors
export const selectActiveModal = (state: RootState) =>
  state.ui.modals.find(modal => modal.isVisible);

export const selectIsModalOpen = (state: RootState, modalId: string) =>
  state.ui.modals.some(modal => modal.id === modalId && modal.isVisible);

// ===== ADVANCED SELECTORS FOR NEW FEATURES =====

// Auth & Invitation selectors
export const selectInvitationToken = (state: RootState) => state.auth.invitationToken;
export const selectInvitationValid = (state: RootState) => state.auth.invitationValid;
export const selectInvitationData = (state: RootState) => state.auth.invitationData;

// Mission recommendations and advanced features
export const selectMissionRecommendations = (state: RootState) => state.missions.recommendations || [];
export const selectMissionsByChild = (state: RootState) => state.missions.missionsByChild || {};
export const selectActiveMissions = (state: RootState) => state.missions.activeMissions || [];
export const selectCompletedMissions = (state: RootState) => state.missions.completedMissions || [];

// Reward advanced features
export const selectRewardRecommendations = (state: RootState) => state.rewards.recommendations;
export const selectAvailableRewardsEnhanced = (state: RootState) => state.rewards.availableRewards;
export const selectChildRewards = (state: RootState) => state.rewards.childRewards;
export const selectPendingClaims = (state: RootState) => state.rewards.pendingClaims;
export const selectApprovedClaims = (state: RootState) => state.rewards.approvedClaims;
export const selectRejectedClaims = (state: RootState) => state.rewards.rejectedClaims;

// Age group and statistics selectors
export const selectChildStatisticsByChild = (state: RootState, childId: string | number) =>
  state.children.childStatistics[childId];
export const selectChildActivitiesByChild = (state: RootState, childId: string | number) =>
  state.children.childActivities[childId] || [];

// Punishment selectors by child
export const selectActivePunishmentsForChild = (state: RootState, childId: string | number) =>
  state.punishments.activePunishmentsByChild[childId] || [];
export const selectPunishmentHistoryForChild = (state: RootState, childId: string | number) =>
  state.punishments.historyByChild[childId] || [];

// Combined child data selector
export const selectChildProfile = (state: RootState, childId: string | number) => {
  const child = state.children.children.find(c => c.id === childId);
  const statistics = state.children.childStatistics[childId];
  const activities = state.children.childActivities[childId] || [];
  const activePunishments = state.punishments.activePunishmentsByChild[childId] || [];
  const missions = state.missions.missionsByChild[childId] || [];
  const rewards = state.rewards.childRewards[childId] || [];

  return {
    child,
    statistics,
    activities,
    activePunishments,
    missions,
    rewards,
    hasActiveRestrictions: activePunishments.length > 0,
    totalMissions: missions.length,
    completedMissionsCount: missions.filter(m => m.status === 'completed' || m.status === 'validated').length,
  };
};

// Dashboard summary selectors
export const selectDashboardSummary = (state: RootState) => {
  const currentUser = state.auth.user;
  const children = state.children.children;
  const totalMissions = (state.missions.missions || []).length;
  const totalRewards = state.rewards.rewards.length;
  const totalPunishments = state.punishments.punishments.length;
  const pendingClaims = state.rewards.pendingClaims.length;

  if (currentUser?.role === 'PARENT') {
    return {
      type: 'parent',
      childrenCount: children.length,
      totalMissions,
      totalRewards,
      totalPunishments,
      pendingClaims,
      activeChildren: children.filter(child => child.isActive).length,
      totalPointsDistributed: children.reduce((sum, child) => sum + (child.currentPoints || 0), 0),
    };
  }

  // Child dashboard
  const childId = currentUser?.id;
  const childStatistics = childId ? state.children.childStatistics[childId] : null;
  const activePunishments = childId ? state.punishments.activePunishmentsByChild[childId] || [] : [];

  return {
    type: 'child',
    currentPoints: currentUser?.currentPoints || 0,
    level: childStatistics?.level || 1,
    streak: childStatistics?.streak || 0,
    activePunishments: activePunishments.length,
    pendingRewards: state.rewards.pendingClaims.filter(claim => 
      claim.child === `/api/children/${childId}`
    ).length,
  };
};

// Sync status selectors
export const selectSyncStatuses = (state: RootState) => ({
  children: state.children.syncStatus,
  missions: state.missions.syncStatus,
  rewards: state.rewards.syncStatus,
  punishments: state.punishments.syncStatus,
});

export const selectIsAnySyncing = (state: RootState) => {
  const statuses = selectSyncStatuses(state);
  return Object.values(statuses).some(status => status === 'pending');
};

export const selectSyncErrors = (state: RootState) => {
  const statuses = selectSyncStatuses(state);
  return Object.entries(statuses)
    .filter(([_, status]) => status === 'failed')
    .map(([entity, _]) => entity);
};