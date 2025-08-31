export interface Tournament {
  id: string;
  name: string;
  description: string;
  type: TournamentType;
  category: 'MISSIONS' | 'POINTS' | 'STREAKS' | 'MIXED';
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  currentParticipants: number;
  prizes: TournamentPrize[];
  rules: string[];
  leaderboard: TournamentParticipant[];
  createdBy: string;
  createdAt: string;
}

export type TournamentType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
export type TournamentStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface TournamentPrize {
  position: number;
  pointsReward: number;
  specialReward?: string;
  description: string;
}

export interface TournamentParticipant {
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  rank: number;
  progress: TournamentProgress;
}

export interface TournamentProgress {
  missionsCompleted: number;
  pointsEarned: number;
  streakDays: number;
  specialActions?: Record<string, number>;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  color: string;
  ownerId: string;
  members: GuildMember[];
  level: number;
  experience: number;
  totalPoints: number;
  achievements: GuildAchievement[];
  settings: GuildSettings;
  createdAt: string;
  updatedAt: string;
}

export interface GuildMember {
  userId: string;
  userName: string;
  avatar?: string;
  role: GuildRole;
  joinedAt: string;
  pointsContributed: number;
  isActive: boolean;
}

export type GuildRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface GuildAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: string;
}

export interface GuildSettings {
  isPublic: boolean;
  autoAcceptMembers: boolean;
  minLevelToJoin: number;
  maxMembers: number;
  allowMemberInvites: boolean;
}

export interface Leaderboard {
  id: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  category?: string;
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export type LeaderboardType = 'POINTS' | 'MISSIONS' | 'STREAKS' | 'GUILD';
export type LeaderboardPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  change: number; // Position change from last period
  badge?: string;
}

export interface DailyWheel {
  id: string;
  childId: string;
  availableAt: string;
  usedAt?: string;
  reward?: WheelReward;
  isAvailable: boolean;
}

export interface WheelReward {
  type: 'POINTS' | 'ITEM' | 'BOOST' | 'SPECIAL';
  value: number | string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface SkillTree {
  id: string;
  childId: string;
  skills: Skill[];
  totalPoints: number;
  unlockedPaths: string[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  level: number;
  maxLevel: number;
  experience: number;
  experienceToNext: number;
  isUnlocked: boolean;
  prerequisites: string[];
  bonuses: SkillBonus[];
  icon: string;
}

export type SkillCategory = 
  | 'RESPONSIBILITY'
  | 'CREATIVITY'
  | 'ACADEMIC'
  | 'PHYSICAL'
  | 'SOCIAL'
  | 'EMOTIONAL';

export interface SkillBonus {
  type: 'POINTS_MULTIPLIER' | 'MISSION_DISCOUNT' | 'SPECIAL_ABILITY';
  value: number | string;
  description: string;
}