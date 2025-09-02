/**
 * Types for Tournaments API
 */

export interface Tournament {
  '@id'?: string;
  '@type'?: string;
  id: number;
  name: string;
  description: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: TournamentStatus;
  prizes: TournamentPrize[];
  participants?: TournamentParticipant[];
  rules?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type TournamentStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface TournamentPrize {
  rank: number;
  reward: string;
  points: number;
  description?: string;
}

export interface TournamentParticipant {
  child: string; // IRI reference
  childName: string;
  score: number;
  rank?: number;
  joinedAt: string;
}

export interface CreateTournamentRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  prizes: TournamentPrize[];
  rules?: string;
  maxParticipants?: number;
}

export interface UpdateTournamentRequest extends Partial<CreateTournamentRequest> {
  status?: TournamentStatus;
}

export interface JoinTournamentRequest {
  child: string; // IRI reference to child
}

// API Platform Collection Response
export interface TournamentsCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': Tournament[];
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