/**
 * Mission Entity - Core business model
 */

export type MissionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VALIDATED' | 'REJECTED';
export type MissionCategory = 'CHORES' | 'HOMEWORK' | 'BEHAVIOR' | 'SPECIAL' | 'DAILY';
export type MissionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Mission {
  id: number;
  title: string;
  description: string;
  points: number;
  status: MissionStatus;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  childId?: number;
  parentId: number;
  deadline?: Date;
  completedAt?: Date;
  validatedAt?: Date;
  isRecurring: boolean;
  
  // Business logic
  get isOverdue(): boolean;
  get canBeCompleted(): boolean;
  get canBeValidated(): boolean;
  complete(): void;
  validate(): void;
  reject(): void;
}

export class MissionEntity implements Mission {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public points: number,
    public status: MissionStatus,
    public category: MissionCategory,
    public difficulty: MissionDifficulty,
    public parentId: number,
    public isRecurring: boolean,
    public childId?: number,
    public deadline?: Date,
    public completedAt?: Date,
    public validatedAt?: Date
  ) {}

  get isOverdue(): boolean {
    if (!this.deadline) return false;
    if (this.status === 'COMPLETED' || this.status === 'VALIDATED') return false;
    return new Date() > this.deadline;
  }

  get canBeCompleted(): boolean {
    return this.status === 'PENDING' || this.status === 'IN_PROGRESS';
  }

  get canBeValidated(): boolean {
    return this.status === 'COMPLETED';
  }

  complete(): void {
    if (!this.canBeCompleted) {
      throw new Error('Mission cannot be completed in current status');
    }
    this.status = 'COMPLETED';
    this.completedAt = new Date();
  }

  validate(): void {
    if (!this.canBeValidated) {
      throw new Error('Mission cannot be validated in current status');
    }
    this.status = 'VALIDATED';
    this.validatedAt = new Date();
  }

  reject(): void {
    if (!this.canBeValidated) {
      throw new Error('Mission cannot be rejected in current status');
    }
    this.status = 'REJECTED';
  }

  static fromJSON(json: any): MissionEntity {
    return new MissionEntity(
      json.id,
      json.title,
      json.description,
      json.points,
      json.status,
      json.category,
      json.difficulty,
      json.parentId,
      json.isRecurring ?? false,
      json.childId,
      json.deadline ? new Date(json.deadline) : undefined,
      json.completedAt ? new Date(json.completedAt) : undefined,
      json.validatedAt ? new Date(json.validatedAt) : undefined
    );
  }

  toJSON(): object {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      points: this.points,
      status: this.status,
      category: this.category,
      difficulty: this.difficulty,
      childId: this.childId,
      parentId: this.parentId,
      deadline: this.deadline?.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      validatedAt: this.validatedAt?.toISOString(),
      isRecurring: this.isRecurring,
      isOverdue: this.isOverdue,
    };
  }
}