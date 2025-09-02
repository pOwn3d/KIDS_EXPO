// Re-export all API types with explicit exports to avoid conflicts
export * from './auth';
export * from './children'; // AgeGroup is defined here as the main source
export { 
  Mission, 
  MissionCategory, 
  MissionStatus, 
  MissionDifficulty,
  MissionProgress,
  CreateMissionRequest,
  UpdateMissionRequest,
  MissionsCollectionResponse,
  RecurringConfig,
  MissionRequirement 
} from './missions';
export { 
  Reward, 
  RewardCategory, 
  RewardClaim, 
  RewardClaimStatus,
  CreateRewardRequest,
  UpdateRewardRequest,
  ClaimRewardRequest,
  RewardsCollectionResponse,
  RewardClaimsCollectionResponse
} from './rewards';

// Additional types needed for the app
export type RewardType = 'screen_time' | 'outing' | 'money' | 'privilege' | 'food' | 'social' | 'education';
export type RewardAvailability = 'available' | 'unavailable' | 'claimed';

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participants: string[];
  rewards: Reward[];
}

export interface Guild {
  id: string;
  name: string;
  members: string[];
  level: number;
  points: number;
}

export interface Leaderboard {
  id: string;
  type: 'weekly' | 'monthly' | 'allTime';
  entries: Array<{
    childId: string;
    name: string;
    points: number;
    rank: number;
  }>;
}

export interface SkillTree {
  id: string;
  childId: string;
  skills: Array<{
    id: string;
    name: string;
    level: number;
    maxLevel: number;
  }>;
}

export interface DailyWheel {
  id: string;
  childId: string;
  lastSpin: string;
  available: boolean;
  rewards: Reward[];
}

export interface SparkyConversation {
  id: string;
  childId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

export interface SparkyRecommendation {
  id: string;
  childId: string;
  type: 'mission' | 'reward' | 'goal';
  recommendation: string;
  data?: any;
}

export interface AnalyticsDashboard {
  period: AnalyticsPeriod;
  stats: {
    totalPoints: number;
    completedMissions: number;
    claimedRewards: number;
    averagePerformance: number;
  };
}

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface GoalTracking {
  id: string;
  childId: string;
  goal: string;
  target: number;
  current: number;
  deadline: string;
}

export interface AIInsight {
  id: string;
  type: 'behavior' | 'performance' | 'recommendation';
  message: string;
  data?: any;
}

export interface ParentalControls {
  childId: string;
  restrictions: {
    maxScreenTime: number;
    blockedCategories: string[];
    requireApproval: boolean;
  };
}
export { 
  Punishment,
  PunishmentCategory,
  PunishmentDifficulty,
  AppliedPunishment,
  CreatePunishmentRequest,
  UpdatePunishmentRequest,
  ApplyPunishmentRequest,
  PunishmentsCollectionResponse,
  AppliedPunishmentsCollectionResponse,
  PunishmentPreset,
  PUNISHMENT_PRESETS
} from './punishments';
export * from './badges';
export * from './activities';

// Common API response wrapper types
export interface ApiResponse<T = any> {
  '@context'?: string;
  '@id'?: string;
  '@type'?: string;
  data?: T;
  'hydra:member'?: T[];
  'hydra:totalItems'?: number;
  'hydra:view'?: {
    '@id': string;
    '@type': string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:previous'?: string;
    'hydra:next'?: string;
  };
  'hydra:search'?: any;
}

export interface PaginatedResponse<T = any> {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': T[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    '@id': string;
    '@type': string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:previous'?: string;
    'hydra:next'?: string;
  };
  'hydra:search'?: {
    '@type': string;
    'hydra:template': string;
    'hydra:variableRepresentation': string;
    'hydra:mapping': Array<{
      '@type': string;
      variable: string;
      property: string;
      required: boolean;
    }>;
  };
}

export interface ApiError {
  '@context'?: string;
  '@type': 'hydra:Error';
  'hydra:title': string;
  'hydra:description': string;
  status: number;
  detail?: string;
  violations?: Array<{
    propertyPath: string;
    message: string;
  }>;
}

// Common request options
export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
  order?: Record<string, 'asc' | 'desc'>;
}

export interface FilterParams {
  [key: string]: any;
}

// Common entity interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: string;
  isDeleted?: boolean;
}

export interface TimestampableEntity {
  createdAt: string;
  updatedAt: string;
}

export interface BlameableEntity {
  createdBy?: string;
  updatedBy?: string;
}