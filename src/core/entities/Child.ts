/**
 * Child Entity - Core business model
 */

export interface Child {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: Date;
  points: number;
  level: number;
  avatar?: string;
  parentId: number;
  isActive: boolean;
  
  // Business logic
  get age(): number;
  get fullName(): string;
  canClaimReward(pointsCost: number): boolean;
  addPoints(points: number): void;
  deductPoints(points: number): void;
}

export class ChildEntity implements Child {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public birthDate: Date,
    public points: number,
    public level: number,
    public parentId: number,
    public isActive: boolean,
    public avatar?: string
  ) {}

  get age(): number {
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  canClaimReward(pointsCost: number): boolean {
    return this.points >= pointsCost && this.isActive;
  }

  addPoints(points: number): void {
    if (points < 0) {
      throw new Error('Points to add must be positive');
    }
    this.points += points;
    this.updateLevel();
  }

  deductPoints(points: number): void {
    if (points < 0) {
      throw new Error('Points to deduct must be positive');
    }
    if (this.points < points) {
      throw new Error('Insufficient points');
    }
    this.points -= points;
  }

  private updateLevel(): void {
    // Simple level calculation: 1 level per 100 points
    this.level = Math.floor(this.points / 100) + 1;
  }

  static fromJSON(json: any): ChildEntity {
    return new ChildEntity(
      json.id,
      json.firstName,
      json.lastName,
      new Date(json.birthDate),
      json.points ?? 0,
      json.level ?? 1,
      json.parentId,
      json.isActive ?? true,
      json.avatar
    );
  }

  toJSON(): object {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      birthDate: this.birthDate.toISOString(),
      points: this.points,
      level: this.level,
      avatar: this.avatar,
      parentId: this.parentId,
      isActive: this.isActive,
      age: this.age,
    };
  }
}