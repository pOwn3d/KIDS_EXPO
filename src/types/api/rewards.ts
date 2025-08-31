export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: RewardCategory;
  type: RewardType;
  availability: RewardAvailability;
  imageUrl?: string;
  maxStock?: number;
  currentStock?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  restrictions?: RewardRestriction[];
}

export type RewardCategory = 
  | 'TREATS'
  | 'ACTIVITIES'
  | 'TOYS'
  | 'SCREEN_TIME'
  | 'OUTINGS'
  | 'PRIVILEGES'
  | 'MONEY'
  | 'SPECIAL';

export type RewardType = 
  | 'PHYSICAL'
  | 'ACTIVITY'
  | 'PRIVILEGE'
  | 'DIGITAL'
  | 'EXPERIENCE';

export type RewardAvailability = 
  | 'ALWAYS'
  | 'WEEKDAYS'
  | 'WEEKENDS'
  | 'SPECIAL_OCCASIONS';

export interface RewardRestriction {
  type: 'AGE_MIN' | 'AGE_MAX' | 'LEVEL_MIN' | 'TIME_LIMIT' | 'CUSTOM';
  value: any;
  description: string;
}

export interface RewardClaim {
  id: string;
  rewardId: string;
  childId: string;
  pointsSpent: number;
  status: RewardClaimStatus;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  fulfilledAt?: string;
  approvedBy?: string;
  notes?: string;
  expiresAt?: string;
}

export type RewardClaimStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'FULFILLED'
  | 'EXPIRED';

export interface CreateRewardRequest {
  name: string;
  description: string;
  pointsCost: number;
  category: RewardCategory;
  type: RewardType;
  availability: RewardAvailability;
  imageUrl?: string;
  maxStock?: number;
  restrictions?: RewardRestriction[];
}

export interface UpdateRewardRequest extends Partial<CreateRewardRequest> {
  isActive?: boolean;
  currentStock?: number;
}

export interface ClaimRewardRequest {
  rewardId: string;
  childId: string;
  notes?: string;
}