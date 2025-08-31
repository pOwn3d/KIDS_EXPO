export interface Child {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate: string;
  age: number;
  avatar: string;
  points: number;
  currentPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  level: number;
  levelProgress: number;
  streak: number;
  bestStreak: number;
  gems: number;
  theme?: string;
  isActive: boolean;
  settings?: ChildSettings;
  createdAt: string;
  updatedAt: string;
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
  birthDate: string;
  avatar: string;
  theme?: string;
}

export interface UpdateChildDto {
  name?: string;
  birthDate?: string;
  avatar?: string;
  theme?: string;
  settings?: Partial<ChildSettings>;
  isActive?: boolean;
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