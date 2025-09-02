export interface Mission {
  '@id'?: string;
  '@type'?: string;
  id: number;
  title: string;
  description: string;
  points: number;
  status: MissionStatus;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  child?: string; // IRI reference to assigned child
  childName?: string; // For display purposes
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  validatedAt?: string;
  ageGroup?: AgeGroup; // Added for age-based missions
  recurring?: RecurringConfig;
  requirements?: MissionRequirement[];
  attachments?: string[];
}

// Categories based on DATABASE_CONTENT.md age groups
export type MissionCategory = 
  | 'hygiene'      // Se brosser les dents, douche, etc.
  | 'domestic'     // Ranger, faire le lit, vaisselle, etc.
  | 'behavior'     // Dire merci, politesse, etc.
  | 'autonomy'     // Mettre son pyjama, préparer cartable, etc.  
  | 'education'    // Devoirs, lire, réviser, etc.
  | 'responsibility' // Nourrir l'animal, babysitting, etc.
  | 'health'       // Sport, exercice, etc.
  | 'solidarity'   // Aider un frère/sœur, etc.
  | 'garden'       // Tondre la pelouse, jardinage, etc.
  | 'chores'       // Tâches ménagères générales
  | 'general';     // Autres

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export type MissionStatus = 
  | 'pending'
  | 'in_progress' 
  | 'completed'
  | 'validated'
  | 'rejected'
  | 'expired';

import type { AgeGroup } from './children';

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
  points: number;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  child?: string; // IRI reference to child
  dueDate?: string;
  recurring?: RecurringConfig;
  requirements?: Omit<MissionRequirement, 'id' | 'completed'>[];
}

export interface UpdateMissionRequest extends Partial<CreateMissionRequest> {
  status?: MissionStatus;
}

// API Platform Collection Response
export interface MissionsCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': Mission[];
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

export interface MissionProgress {
  missionId: string;
  childId: string;
  progress: number; // 0-100
  completedRequirements: string[];
  timeSpent?: number;
  notes?: string;
  attachments?: string[];
}