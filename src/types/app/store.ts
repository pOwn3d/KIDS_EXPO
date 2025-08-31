import { 
  User, 
  LoginRequest, 
  LoginResponse,
  Child,
  CreateChildDto,
  UpdateChildDto,
  ChildStats as ApiChildStats,
  Mission,
  MissionStatus,
  MissionCategory,
  MissionDifficulty,
  MissionRequirement,
  Reward,
  RewardClaim,
  RewardCategory,
  RewardType,
  RewardAvailability,
  Tournament,
  Guild,
  Leaderboard,
  Achievement,
  VirtualPet,
  SkillTree,
  DailyWheel,
  SparkyConversation,
  SparkyRecommendation,
  AnalyticsDashboard,
  AnalyticsPeriod,
  GoalTracking,
  AIInsight,
  ParentalControls
} from '../api';

import { AppTheme, PlatformInfo } from './index';

// Redux Store Types
export interface RootState {
  auth: AuthState;
  user: UserState;
  missions: MissionsState;
  rewards: RewardsState;
  children: ChildrenState;
  gamification: GamificationState;
  sparky: SparkyState;
  analytics: AnalyticsState;
  ui: UIState;
  offline: OfflineState;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  sessionExpiry: number | null;
  lastActivity: number;
  pinProtected: boolean;
  pinValidUntil: number | null;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  sounds: boolean;
}

export interface UserState {
  profile: User | null;
  children: Child[];
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
  lastSyncAt: number | null;
}

export interface MissionsState {
  missions: Mission[];
  selectedMission: Mission | null;
  templates: MissionTemplate[];
  categories: MissionCategory[];
  filters: MissionFilters;
  isLoading: boolean;
  error: string | null;
  lastSyncAt: number | null;
  pendingActions: PendingAction[];
}

export interface RewardsState {
  rewards: Reward[];
  claims: RewardClaim[];
  selectedReward: Reward | null;
  cart: RewardCartItem[];
  categories: RewardCategory[];
  filters: RewardFilters;
  isLoading: boolean;
  error: string | null;
  lastSyncAt: number | null;
}

export interface ChildrenState {
  children: Child[];
  selectedChild: Child | null;
  isLoading: boolean;
  error: string | null;
  stats: Record<string, ChildStats>;
  lastSyncAt: number | null;
}

export interface GamificationState {
  tournaments: Tournament[];
  guilds: Guild[];
  leaderboards: Leaderboard[];
  achievements: Achievement[];
  virtualPets: Record<string, VirtualPet>;
  skillTrees: Record<string, SkillTree>;
  dailyWheels: Record<string, DailyWheel>;
  isLoading: boolean;
  error: string | null;
  lastSyncAt: number | null;
}

export interface SparkyState {
  conversations: SparkyConversation[];
  activeConversation: SparkyConversation | null;
  recommendations: SparkyRecommendation[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  settings: SparkySettings;
}

export interface AnalyticsState {
  dashboard: AnalyticsDashboard | null;
  reports: AnalyticsReport[];
  goals: GoalTracking[];
  insights: AIInsight[];
  isLoading: boolean;
  error: string | null;
  lastUpdateAt: number | null;
  selectedPeriod: AnalyticsPeriod;
}

export interface UIState {
  theme: 'light' | 'dark' | 'auto';
  platform: PlatformInfo;
  navigation: NavigationState;
  modals: ModalState[];
  notifications: NotificationState[];
  isOnline: boolean;
  lastNetworkCheck: number;
  loadingStates: Record<string, boolean>;
}

export interface OfflineState {
  isOffline: boolean;
  pendingActions: OfflinePendingAction[];
  syncQueue: SyncQueueItem[];
  lastSyncAt: number | null;
  conflictResolution: ConflictResolution[];
}

// Supporting Types
export interface MissionFilters {
  status?: MissionStatus[];
  category?: MissionCategory[];
  difficulty?: MissionDifficulty[];
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface RewardFilters {
  category?: RewardCategory[];
  type?: RewardType[];
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: RewardAvailability[];
  search?: string;
}

export interface RewardCartItem {
  rewardId: string;
  quantity: number;
  childId: string;
  notes?: string;
}

export interface ChildStats {
  totalPoints: number;
  level: number;
  experience: number;
  streak: number;
  missionsCompleted: number;
  rewardsEarned: number;
  achievements: string[];
  weeklyGoalProgress: number;
}

export interface PendingAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface NavigationState {
  activeRoute: string;
  history: string[];
  params: Record<string, any>;
  canGoBack: boolean;
}

export interface ModalState {
  id: string;
  type: string;
  isVisible: boolean;
  data?: any;
  options?: ModalOptions;
}

export interface ModalOptions {
  dismissible?: boolean;
  persistent?: boolean;
  fullScreen?: boolean;
  position?: 'center' | 'top' | 'bottom';
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: NotificationAction;
  timestamp: number;
  isRead: boolean;
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

export interface OfflinePendingAction {
  id: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SyncQueueItem {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'success' | 'failed';
}

export interface ConflictResolution {
  id: string;
  entityType: string;
  entityId: string;
  localData: any;
  serverData: any;
  resolution: 'local' | 'server' | 'merge' | 'manual';
  resolvedAt?: number;
}

export interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  pointsReward: number;
  requirements: MissionRequirement[];
  isPublic: boolean;
  usageCount: number;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  type: string;
  data: any;
  generatedAt: string;
  scheduledFor?: string;
  recipients: string[];
}

export interface SparkySettings {
  isEnabled: boolean;
  communicationStyle: 'formal' | 'casual' | 'playful';
  maxDailyInteractions: number;
  allowMissionSuggestions: boolean;
  allowRewardSuggestions: boolean;
  parentalControls: ParentalControls;
  language: string;
  voiceEnabled: boolean;
}

// Action Types
export interface AsyncThunkConfig {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
}

export type AppDispatch = any; // Will be properly typed when store is created
export type AppThunk<ReturnType = void> = any; // Will be properly typed when store is created