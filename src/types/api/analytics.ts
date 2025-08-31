export interface AnalyticsDashboard {
  overview: OverviewStats;
  timeSeriesData: TimeSeriesData[];
  categoryBreakdown: CategoryStats[];
  childrenProgress: ChildProgress[];
  trends: TrendAnalysis;
  insights: AIInsight[];
  period: AnalyticsPeriod;
  generatedAt: string;
}

export interface OverviewStats {
  totalPoints: number;
  pointsChange: number;
  missionsCompleted: number;
  missionsChange: number;
  activeStreak: number;
  streakChange: number;
  rewardsEarned: number;
  rewardsChange: number;
  averageCompletion: number;
  completionChange: number;
}

export interface TimeSeriesData {
  date: string;
  points: number;
  missionsCompleted: number;
  timeSpent: number;
  mood?: number; // 1-10 scale
}

export interface CategoryStats {
  category: string;
  points: number;
  missions: number;
  completionRate: number;
  averageTime: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
}

export interface ChildProgress {
  childId: string;
  childName: string;
  avatar?: string;
  totalPoints: number;
  level: number;
  progression: number; // % to next level
  strongCategories: string[];
  needsImprovement: string[];
  recentAchievements: string[];
  weeklyGoalProgress: number;
}

export interface TrendAnalysis {
  pointsTrend: TrendDirection;
  missionsTrend: TrendDirection;
  engagementTrend: TrendDirection;
  difficultyTrend: TrendDirection;
  motivationFactors: string[];
  seasonalPatterns: SeasonalPattern[];
}

export type TrendDirection = 'INCREASING' | 'DECREASING' | 'STABLE' | 'VOLATILE';

export interface SeasonalPattern {
  period: string;
  pattern: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  description: string;
}

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: InsightImpact;
  confidence: number;
  recommendedActions: RecommendedAction[];
  data?: any;
  createdAt: string;
}

export type InsightType = 
  | 'PERFORMANCE'
  | 'BEHAVIOR'
  | 'MOTIVATION'
  | 'DIFFICULTY'
  | 'SCHEDULE'
  | 'REWARD_OPTIMIZATION';

export type InsightImpact = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RecommendedAction {
  type: 'MISSION_ADJUSTMENT' | 'REWARD_CHANGE' | 'SCHEDULE_CHANGE' | 'DIFFICULTY_CHANGE';
  description: string;
  estimatedImpact: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export type AnalyticsPeriod = 
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'LAST_3_MONTHS'
  | 'LAST_6_MONTHS'
  | 'LAST_YEAR'
  | 'CUSTOM';

export interface ExportRequest {
  format: 'PDF' | 'CSV' | 'EXCEL';
  period: AnalyticsPeriod;
  includeInsights: boolean;
  includeRecommendations: boolean;
  childrenIds?: string[];
}

export interface ExportResponse {
  downloadUrl: string;
  expiresAt: string;
  fileSize: number;
  format: string;
}

export interface GoalTracking {
  id: string;
  childId: string;
  title: string;
  description: string;
  type: GoalType;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  status: GoalStatus;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export type GoalType = 'POINTS' | 'MISSIONS' | 'STREAK' | 'SKILL' | 'BEHAVIOR';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export interface Milestone {
  id: string;
  title: string;
  target: number;
  reward?: string;
  completedAt?: string;
  isCompleted: boolean;
}