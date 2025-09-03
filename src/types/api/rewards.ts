export interface Reward {
  '@id'?: string;
  '@type'?: string;
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  category: RewardCategory;
  available: boolean;
  child?: string; // IRI reference for child-specific rewards
  childName?: string; // For display purposes
  imageUrl?: string;
  ageGroup?: AgeGroup; // Added for age-based rewards
  createdAt?: string;
  updatedAt?: string;
}

// Categories based on DATABASE_CONTENT.md age groups  
export type RewardCategory = 
  | 'entertainment'  // Histoire supplémentaire, dessin animé, etc.
  | 'screen_time'    // Jeu vidéo, télé, etc.
  | 'toy'           // Petit jouet, nouveau jeu, etc.
  | 'outing'        // Parc, cinéma, piscine, sortie avec amis, etc.
  | 'food'          // Glace, fast-food, restaurant, etc.
  | 'money'         // Argent de poche, etc.
  | 'social'        // Soirée pyjama, weekend chez un ami, etc.
  | 'subscription'  // Abonnement streaming, forfait mobile, etc.
  | 'gaming'        // Nouveau jeu vidéo, console, etc.
  | 'privilege'     // Journée libre, sortie tardive, etc.
  | 'shopping'      // Vêtement de marque, livre, BD, etc.
  | 'education'     // Livre, BD, etc.
  | 'general';      // Autres

import type { AgeGroup } from './children';

export interface RewardClaim {
  '@id'?: string;
  '@type'?: string;
  id: number;
  reward: string; // IRI reference to reward
  child: string; // IRI reference to child
  rewardName?: string; // For display purposes
  childName?: string; // For display purposes
  pointsCost?: number;
  status?: RewardClaimStatus;
  claimedAt?: string;
  validatedAt?: string;
  rejectedAt?: string;
  notes?: string;
}

export type RewardClaimStatus = 
  | 'pending'
  | 'approved' 
  | 'rejected'
  | 'fulfilled';

export type RewardType = RewardCategory; // Alias for compatibility

export interface CreateRewardRequest {
  name: string;
  description: string;
  pointsCost: number;
  type: 'individual' | 'collective'; // Backend type field
  icon?: string;
  maxClaimsPerWeek?: number;
  isActive?: boolean;
  ageMin?: number;
  ageMax?: number;
}

export interface UpdateRewardRequest extends Partial<CreateRewardRequest> {
  available?: boolean;
}

export interface ClaimRewardRequest {
  reward: string; // IRI reference to reward
  child: string; // IRI reference to child
}

// API Platform Collection Responses
export interface RewardsCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': Reward[];
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

export interface RewardClaimsCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': RewardClaim[];
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