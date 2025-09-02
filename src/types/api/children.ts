export interface Child {
  '@id'?: string;
  '@type'?: string;
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  age?: number;
  avatar: string;
  currentPoints: number;
  totalPointsEarned?: number;
  totalPointsSpent?: number;
  level: string; // API returns level as string (bronze, silver, gold, etc.)
  levelProgress?: number;
  streak?: number;
  bestStreak?: number;
  gems?: number;
  theme?: string;
  parentId?: number;
  isActive: boolean;
  settings?: ChildSettings;
  missions?: string[]; // Array of IRI references
  badges?: string[]; // Array of IRI references
  rewards?: string[]; // Array of IRI references
  pointsHistory?: PointHistoryEntry[];
  ageGroup?: AgeGroup; // Added for age-based recommendations
  createdAt?: string;
  updatedAt?: string;
}

// Age group classification based on DATABASE_CONTENT.md
export type AgeGroup = '3-5' | '6-8' | '9-12' | '13-17';

export interface PointHistoryEntry {
  id: number;
  points: number;
  type: 'earned' | 'spent' | 'deducted';
  reason: string;
  createdAt: string;
}

export interface ChildSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CreateChildDto {
  name: string;
  firstName?: string;
  lastName?: string;
  avatar: string;
  birthDate?: string;
  age?: number;
  theme?: string;
}

export interface UpdateChildDto {
  name?: string;
  avatar?: string;
  birthDate?: string;
  age?: number;
  theme?: string;
  settings?: Partial<ChildSettings>;
  isActive?: boolean;
}

// API Platform Collection Response
export interface ChildrenCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': Child[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    '@id': string;
    '@type': 'hydra:PartialCollectionView';
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:next'?: string;
    'hydra:previous'?: string;
  };
}

export interface ChildStats {
  id: number;
  childId: number;
  totalPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  missionsCompleted: number;
  missionsInProgress: number;
  rewardsEarned: number;
  badgesEarned: number;
  currentStreak: number;
  bestStreak: number;
  averagePointsPerDay: number;
  averagePointsPerMission: number;
  favoriteCategory: string;
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
  achievements: Achievement[];
}

export interface WeeklyProgress {
  day: string;
  date: string;
  points: number;
  missions: number;
}

export interface MonthlyProgress {
  month: string;
  year: number;
  totalPoints: number;
  totalMissions: number;
  totalRewards: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface ChildStatistics {
  totalPoints: number;
  pointsThisWeek: number;
  pointsThisMonth: number;
  missionsCompleted: number;
  rewardsEarned: number;
  averagePointsPerDay: number;
  streak: number;
  level: number;
  weeklyProgress: WeeklyProgress[];
}

export interface ChildActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  points: number;
  createdAt: string;
  icon: string;
  color: string;
}