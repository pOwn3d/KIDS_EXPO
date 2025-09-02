/**
 * Types for Activities API
 */

export interface Activity {
  '@id'?: string;
  '@type'?: string;
  id: number;
  type: ActivityType;
  description: string;
  points?: number;
  child: string; // IRI reference to child
  childName?: string; // For display purposes
  relatedItem?: string; // IRI reference to related mission/reward/badge
  metadata?: Record<string, any>;
  createdAt: string;
}

export type ActivityType = 
  | 'mission_completed'
  | 'mission_validated' 
  | 'reward_claimed'
  | 'reward_approved'
  | 'badge_earned'
  | 'points_earned'
  | 'points_deducted'
  | 'level_up'
  | 'punishment_applied'
  | 'tournament_joined'
  | 'guild_joined';

export interface ActivityFilters {
  child?: number;
  type?: ActivityType;
  from?: string; // ISO date string
  to?: string; // ISO date string
}

// API Platform Collection Response
export interface ActivitiesCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': Activity[];
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

// For activities/recent endpoint
export interface RecentActivitiesResponse {
  activities: Activity[];
  total: number;
  limit: number;
}