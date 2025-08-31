// Re-export all API types
export * from './auth';
export * from './children';
export * from './missions';
export * from './rewards';
export * from './gamification';
export * from './sparky';
export * from './analytics';

// Common API response wrapper types
export interface ApiResponse<T = any> {
  '@context'?: string;
  '@id'?: string;
  '@type'?: string;
  data?: T;
  'hydra:member'?: T[];
  'hydra:totalItems'?: number;
  'hydra:view'?: {
    '@id': string;
    '@type': string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:previous'?: string;
    'hydra:next'?: string;
  };
  'hydra:search'?: any;
}

export interface PaginatedResponse<T = any> {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': T[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    '@id': string;
    '@type': string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:previous'?: string;
    'hydra:next'?: string;
  };
  'hydra:search'?: {
    '@type': string;
    'hydra:template': string;
    'hydra:variableRepresentation': string;
    'hydra:mapping': Array<{
      '@type': string;
      variable: string;
      property: string;
      required: boolean;
    }>;
  };
}

export interface ApiError {
  '@context'?: string;
  '@type': 'hydra:Error';
  'hydra:title': string;
  'hydra:description': string;
  status: number;
  detail?: string;
  violations?: Array<{
    propertyPath: string;
    message: string;
  }>;
}

// Common request options
export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
}

export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
  order?: Record<string, 'asc' | 'desc'>;
}

export interface FilterParams {
  [key: string]: any;
}

// Common entity interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: string;
  isDeleted?: boolean;
}

export interface TimestampableEntity {
  createdAt: string;
  updatedAt: string;
}

export interface BlameableEntity {
  createdBy?: string;
  updatedBy?: string;
}