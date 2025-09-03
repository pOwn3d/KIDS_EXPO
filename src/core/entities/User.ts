/**
 * User Entity - Core business model
 * Pure TypeScript, no framework dependencies
 */

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Business logic
  get fullName(): string;
  get isParent(): boolean;
  get isChild(): boolean;
}

export type UserRole = 'PARENT' | 'CHILD';

export class UserEntity implements User {
  constructor(
    public id: number,
    public email: string,
    public firstName: string,
    public lastName: string,
    public role: UserRole,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isParent(): boolean {
    return this.role === 'PARENT';
  }

  get isChild(): boolean {
    return this.role === 'CHILD';
  }

  static fromJSON(json: any): UserEntity {
    return new UserEntity(
      json.id,
      json.email,
      json.firstName,
      json.lastName,
      json.role,
      json.isActive ?? true,
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }

  toJSON(): object {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}