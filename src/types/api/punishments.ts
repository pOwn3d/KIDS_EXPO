/**
 * Types for Punishments API - New feature based on DATABASE_CONTENT.md
 */

export interface Punishment {
  '@id'?: string;
  '@type'?: string;
  id: number;
  name: string;
  description: string;
  points: number; // Negative points value
  category: PunishmentCategory;
  difficulty: PunishmentDifficulty;
  ageGroup: AgeGroup;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Categories based on DATABASE_CONTENT.md age groups
export type PunishmentCategory = 
  | 'food'        // Pas de dessert, etc.
  | 'timeout'     // Coin calme, etc.
  | 'restriction' // Pas de jouet préféré, pas de sortie, etc.
  | 'screen_time' // Pas de console, pas de téléphone, pas de wifi, etc.
  | 'chore'       // Corvée supplémentaire, corvées doubles, etc.
  | 'sleep'       // Coucher plus tôt, etc.
  | 'money'       // Argent de poche réduit, etc.
  | 'general';    // Autres

export type PunishmentDifficulty = 'easy' | 'medium' | 'hard';

import type { AgeGroup } from './children';

export interface AppliedPunishment {
  '@id'?: string;
  '@type'?: string;
  id: number;
  punishment: string; // IRI reference to punishment
  child: string; // IRI reference to child
  punishmentName?: string; // For display purposes
  childName?: string; // For display purposes
  reason?: string;
  appliedAt: string;
  expiresAt?: string;
  isActive: boolean;
  appliedBy?: string; // IRI reference to parent
}

export interface CreatePunishmentRequest {
  name: string;
  description: string;
  points: number; // Should be negative
  category: PunishmentCategory;
  difficulty: PunishmentDifficulty;
  ageGroup: AgeGroup;
}

export interface UpdatePunishmentRequest extends Partial<CreatePunishmentRequest> {
  isActive?: boolean;
}

export interface ApplyPunishmentRequest {
  punishment: string; // IRI reference to punishment
  child: string; // IRI reference to child
  reason?: string;
  duration?: number; // Duration in hours (optional)
}

// API Platform Collection Response
export interface PunishmentsCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': Punishment[];
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

export interface AppliedPunishmentsCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': AppliedPunishment[];
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

// Age-based punishment presets from DATABASE_CONTENT.md
export interface PunishmentPreset {
  name: string;
  description: string;
  points: number;
  category: PunishmentCategory;
  difficulty: PunishmentDifficulty;
  ageGroup: AgeGroup;
}

export const PUNISHMENT_PRESETS: Record<AgeGroup, PunishmentPreset[]> = {
  '3-5': [
    {
      name: 'Pas de dessert',
      description: 'Pas de dessert au prochain repas',
      points: -5,
      category: 'food',
      difficulty: 'easy',
      ageGroup: '3-5'
    },
    {
      name: 'Coin calme',
      description: '5 minutes au coin calme',
      points: -3,
      category: 'timeout',
      difficulty: 'easy',
      ageGroup: '3-5'
    },
    {
      name: 'Pas de jouet préféré',
      description: 'Jouet préféré confisqué pour la journée',
      points: -6,
      category: 'restriction',
      difficulty: 'easy',
      ageGroup: '3-5'
    }
  ],
  '6-8': [
    {
      name: 'Pas de console',
      description: 'Privation de console pour la journée',
      points: -10,
      category: 'screen_time',
      difficulty: 'easy',
      ageGroup: '6-8'
    },
    {
      name: 'Corvée supplémentaire',
      description: 'Une tâche ménagère en plus',
      points: -8,
      category: 'chore',
      difficulty: 'easy',
      ageGroup: '6-8'
    },
    {
      name: 'Pas de sortie',
      description: 'Pas de sortie avec les amis',
      points: -15,
      category: 'restriction',
      difficulty: 'medium',
      ageGroup: '6-8'
    },
    {
      name: 'Coucher plus tôt',
      description: 'Se coucher 30 minutes plus tôt',
      points: -7,
      category: 'sleep',
      difficulty: 'easy',
      ageGroup: '6-8'
    }
  ],
  '9-12': [
    {
      name: 'Pas de téléphone',
      description: 'Téléphone confisqué pour la journée',
      points: -20,
      category: 'screen_time',
      difficulty: 'medium',
      ageGroup: '9-12'
    },
    {
      name: 'Corvées doubles',
      description: 'Double dose de tâches ménagères',
      points: -15,
      category: 'chore',
      difficulty: 'medium',
      ageGroup: '9-12'
    },
    {
      name: 'Pas de wifi',
      description: "Pas d'accès internet pour la soirée",
      points: -18,
      category: 'screen_time',
      difficulty: 'medium',
      ageGroup: '9-12'
    },
    {
      name: 'Weekend à la maison',
      description: 'Pas de sortie le weekend',
      points: -25,
      category: 'restriction',
      difficulty: 'hard',
      ageGroup: '9-12'
    }
  ],
  '13-17': [
    {
      name: 'Téléphone confisqué',
      description: 'Téléphone confisqué pour 2 jours',
      points: -30,
      category: 'screen_time',
      difficulty: 'hard',
      ageGroup: '13-17'
    },
    {
      name: 'Pas de sorties',
      description: 'Interdiction de sortir pour une semaine',
      points: -35,
      category: 'restriction',
      difficulty: 'hard',
      ageGroup: '13-17'
    },
    {
      name: 'Argent de poche réduit',
      description: 'Argent de poche divisé par deux',
      points: -25,
      category: 'money',
      difficulty: 'medium',
      ageGroup: '13-17'
    },
    {
      name: 'Couvre-feu avancé',
      description: 'Rentrer 1h plus tôt pendant 1 semaine',
      points: -20,
      category: 'restriction',
      difficulty: 'medium',
      ageGroup: '13-17'
    }
  ]
};