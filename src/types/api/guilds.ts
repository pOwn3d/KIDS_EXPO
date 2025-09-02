/**
 * Types for Guilds API
 */

export interface Guild {
  '@id'?: string;
  '@type'?: string;
  id: number;
  name: string;
  description: string;
  level: number;
  experiencePoints: number;
  memberCount: number;
  maxMembers: number;
  avatar?: string;
  badge?: string;
  isActive?: boolean;
  members?: GuildMember[];
  leader?: string; // IRI reference to child
  createdAt?: string;
  updatedAt?: string;
}

export interface GuildMember {
  child: string; // IRI reference
  childName: string;
  joinedAt: string;
  role: GuildRole;
  contributedPoints: number;
  isActive: boolean;
}

export type GuildRole = 'leader' | 'officer' | 'member';

export interface CreateGuildRequest {
  name: string;
  description: string;
  maxMembers?: number;
  avatar?: string;
}

export interface UpdateGuildRequest extends Partial<CreateGuildRequest> {
  level?: number;
  experiencePoints?: number;
  isActive?: boolean;
}

export interface JoinGuildRequest {
  child: string; // IRI reference to child
}

export interface GuildInviteRequest {
  guild: string; // IRI reference to guild
  child: string; // IRI reference to child
  message?: string;
}

// API Platform Collection Response
export interface GuildsCollectionResponse {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': Guild[];
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