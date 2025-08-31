import { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DrawerScreenProps } from '@react-navigation/drawer';

// Root Stack Navigator (Auth Flow)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList | MainDrawerParamList>;
  Modal: {
    screen: string;
    params?: any;
  };
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Welcome: undefined;
  Login: {
    userType?: 'parent' | 'child';
  };
  Register: undefined;
  ForgotPassword: undefined;
  PinSetup: {
    userId: string;
  };
  ChildSelection: {
    parentId: string;
  };
};

// Mobile Tab Navigator
export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Missions: NavigatorScreenParams<MissionsStackParamList>;
  Rewards: NavigatorScreenParams<RewardsStackParamList>;
  Notifications: NavigatorScreenParams<NotificationsStackParamList>;
  Validations?: NavigatorScreenParams<ValidationsStackParamList>;
  Leaderboard: NavigatorScreenParams<LeaderboardStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Sparky: NavigatorScreenParams<SparkyStackParamList>;
};

// Desktop Drawer Navigator (replaces tabs on larger screens)
export type MainDrawerParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Children: NavigatorScreenParams<ChildrenStackParamList>;
  Missions: NavigatorScreenParams<MissionsStackParamList>;
  Rewards: NavigatorScreenParams<RewardsStackParamList>;
  Analytics: NavigatorScreenParams<AnalyticsStackParamList>;
  Tournaments: NavigatorScreenParams<TournamentsStackParamList>;
  Guilds: NavigatorScreenParams<GuildsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Sparky: NavigatorScreenParams<SparkyStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// Individual Stack Navigators
export type DashboardStackParamList = {
  DashboardHome: undefined;
  QuickActions: undefined;
  Notifications: undefined;
  FamilyOverview: undefined;
};

export type ChildrenStackParamList = {
  ChildrenList: undefined;
  ChildProfile: {
    childId: string;
  };
  AddChild: undefined;
  EditChild: {
    childId: string;
  };
  ChildStats: {
    childId: string;
  };
};

export type MissionsStackParamList = {
  MissionsList: {
    filter?: 'all' | 'assigned' | 'completed' | 'pending';
  };
  MissionDetails: {
    missionId: string;
  };
  CreateMission: {
    templateId?: string;
  };
  EditMission: {
    missionId: string;
  };
  MissionTemplates: undefined;
  MissionProgress: {
    missionId: string;
    childId: string;
  };
};

export type RewardsStackParamList = {
  RewardsShop: {
    category?: string;
  };
  RewardDetails: {
    rewardId: string;
  };
  CreateReward: undefined;
  EditReward: {
    rewardId: string;
  };
  RewardClaims: undefined;
  ClaimDetails: {
    claimId: string;
  };
};

export type LeaderboardStackParamList = {
  LeaderboardMain: undefined;
  ChildComparison?: {
    childIds: string[];
  };
};

export type NotificationsStackParamList = {
  NotificationsList: undefined;
  NotificationDetail: {
    notificationId: string;
  };
};

export type ValidationsStackParamList = {
  ValidationCenter: undefined;
  ValidationDetail: {
    validationId: string;
    type: 'mission' | 'reward';
  };
};

export type AnalyticsStackParamList = {
  AnalyticsOverview: {
    period?: string;
  };
  DetailedStats: {
    type: 'missions' | 'rewards' | 'points' | 'behavior';
    childId?: string;
  };
  ProgressReports: undefined;
  ExportData: undefined;
  GoalTracking: undefined;
};

export type TournamentsStackParamList = {
  TournamentsList: undefined;
  TournamentDetails: {
    tournamentId: string;
  };
  CreateTournament: undefined;
  TournamentLeaderboard: {
    tournamentId: string;
  };
};

export type GuildsStackParamList = {
  GuildsList: undefined;
  GuildDetails: {
    guildId: string;
  };
  CreateGuild: undefined;
  GuildMembers: {
    guildId: string;
  };
  GuildAchievements: {
    guildId: string;
  };
};

export type SparkyStackParamList = {
  SparkyChat: {
    conversationId?: string;
  };
  SparkyRecommendations: undefined;
  SparkySettings: undefined;
  ConversationHistory: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: {
    userId?: string;
  };
  EditProfile: {
    userId?: string;
  };
  Achievements: {
    userId?: string;
  };
  VirtualPet: {
    userId?: string;
  };
  SkillTree: {
    userId?: string;
  };
  DailyWheel: {
    userId?: string;
  };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  AccountSettings: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  ParentalControls: undefined;
  AppPreferences: undefined;
  DataExport: undefined;
  About: undefined;
  ModeToggleDemo: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainDrawerScreenProps<T extends keyof MainDrawerParamList> = 
  CompositeScreenProps<
    DrawerScreenProps<MainDrawerParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Platform Detection
export interface PlatformInfo {
  isWeb: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
  shouldUseDesktopNavigation: boolean;
}

// Navigation Configuration
export interface NavigationConfig {
  platform: PlatformInfo;
  theme: 'light' | 'dark';
  userRole: 'parent' | 'child';
  showAdvancedFeatures: boolean;
}