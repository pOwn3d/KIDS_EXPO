export interface SparkyConversation {
  id: string;
  userId: string;
  title: string;
  messages: SparkyMessage[];
  context: ConversationContext;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface SparkyMessage {
  id: string;
  conversationId: string;
  sender: 'USER' | 'SPARKY';
  content: string;
  type: MessageType;
  metadata?: MessageMetadata;
  timestamp: string;
  isRead: boolean;
}

export type MessageType = 
  | 'TEXT'
  | 'SUGGESTION'
  | 'MISSION_RECOMMENDATION'
  | 'REWARD_SUGGESTION'
  | 'ACHIEVEMENT_CELEBRATION'
  | 'MOTIVATION'
  | 'EDUCATIONAL';

export interface MessageMetadata {
  relatedMissionId?: string;
  relatedRewardId?: string;
  relatedAchievementId?: string;
  suggestions?: string[];
  actionItems?: ActionItem[];
  emotionalTone?: EmotionalTone;
}

export interface ActionItem {
  id: string;
  type: 'CREATE_MISSION' | 'CLAIM_REWARD' | 'VIEW_PROGRESS' | 'CUSTOM';
  label: string;
  data?: any;
}

export type EmotionalTone = 
  | 'ENCOURAGING'
  | 'CELEBRATORY'
  | 'MOTIVATIONAL'
  | 'EDUCATIONAL'
  | 'SUPPORTIVE'
  | 'PLAYFUL';

export interface ConversationContext {
  childAge?: number;
  childLevel: number;
  currentPoints: number;
  recentMissions: string[];
  recentAchievements: string[];
  preferences: UserPreferences;
  parentalControls: ParentalControls;
}

export interface UserPreferences {
  communicationStyle: 'FORMAL' | 'CASUAL' | 'PLAYFUL';
  topics: string[];
  difficultyPreference: 'EASY' | 'MEDIUM' | 'HARD' | 'ADAPTIVE';
  motivationType: 'COMPETITIVE' | 'COLLABORATIVE' | 'PERSONAL_GROWTH';
  language: string;
  notifications?: {
    missions?: boolean;
    rewards?: boolean;
    achievements?: boolean;
    reminders?: boolean;
  };
  theme?: 'light' | 'dark' | 'auto';
  sounds?: boolean;
}

export interface ParentalControls {
  allowMissionSuggestions: boolean;
  allowRewardSuggestions: boolean;
  maxDailyInteractions: number;
  blockedTopics: string[];
  requireParentApproval: boolean;
}

export interface SparkyRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  reasoning: string;
  confidence: number; // 0-100
  data: any;
  isPersonalized: boolean;
  createdAt: string;
  expiresAt?: string;
}

export type RecommendationType = 
  | 'MISSION'
  | 'REWARD'
  | 'SKILL_DEVELOPMENT'
  | 'DIFFICULTY_ADJUSTMENT'
  | 'SCHEDULE_OPTIMIZATION'
  | 'MOTIVATION_STRATEGY';

export interface CreateConversationRequest {
  title?: string;
  initialMessage: string;
  context?: Partial<ConversationContext>;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
}