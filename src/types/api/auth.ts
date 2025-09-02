export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterWithInvitationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  invitationToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PARENT' | 'CHILD';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parentId?: string; // For child accounts
  pinProtected?: boolean; // For parent sections
}

// Child interface is now exported from children.ts to avoid conflicts
// Achievement interface is now exported from children.ts to avoid conflicts

export interface VirtualPet {
  id: string;
  name: string;
  type: 'CAT' | 'DOG' | 'DRAGON' | 'BIRD';
  level: number;
  happiness: number;
  health: number;
  experience: number;
  lastFed: string;
}