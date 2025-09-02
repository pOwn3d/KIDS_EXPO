/**
 * Types for Badges API
 */

export interface Badge {
  '@id'?: string;
  '@type'?: string;
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BadgeProgress {
  badge: Badge;
  currentCount: number;
  requiredCount: number;
  percentage: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface CreateBadgeRequest {
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
}

export interface UpdateBadgeRequest extends Partial<CreateBadgeRequest> {
  isActive?: boolean;
}

// API Platform Collection Response
export interface BadgesCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': Badge[];
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