export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  pointsReward: number;
  status: MissionStatus;
  assignedToId?: string;
  assignedBy: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  validatedAt?: string;
  recurring?: RecurringConfig;
  requirements?: MissionRequirement[];
  attachments?: string[];
}

export type MissionCategory = 
  | 'CHORES'
  | 'HOMEWORK'
  | 'HEALTH'
  | 'SOCIAL'
  | 'CREATIVE'
  | 'SPORTS'
  | 'LEARNING'
  | 'BEHAVIOR';

export type MissionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type MissionStatus = 
  | 'DRAFT'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'EXPIRED';

export interface RecurringConfig {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  daysOfWeek?: number[]; // For weekly recurring
  dayOfMonth?: number; // For monthly recurring
  endDate?: string;
}

export interface MissionRequirement {
  id: string;
  type: 'PHOTO' | 'VIDEO' | 'TEXT' | 'LOCATION' | 'TIME_SPENT';
  description: string;
  required: boolean;
  completed: boolean;
  value?: any;
}

export interface CreateMissionRequest {
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  pointsReward: number;
  assignedToId?: string;
  dueDate?: string;
  recurring?: RecurringConfig;
  requirements?: Omit<MissionRequirement, 'id' | 'completed'>[];
}

export interface UpdateMissionRequest extends Partial<CreateMissionRequest> {
  status?: MissionStatus;
}

export interface MissionProgress {
  missionId: string;
  childId: string;
  progress: number; // 0-100
  completedRequirements: string[];
  timeSpent?: number;
  notes?: string;
  attachments?: string[];
}