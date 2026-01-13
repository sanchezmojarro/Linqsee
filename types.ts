
export enum CommentType {
  QUICK = 'QUICK',
  SHORT = 'SHORT',
  EXTENSIVE = 'EXTENSIVE'
}

export interface UserProfile {
  name: string;
  expertise: string;
  bio: string;
  tone: string;
  language: string;
  linkedInUrl?: string;
  lastSync?: string;
}

// Added missing CommentGenerationRequest interface to fix the import error in the AI service.
export interface CommentGenerationRequest {
  profile: UserProfile;
  postContent: string;
  type: CommentType;
}

export interface AuditResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: {
    title: string;
    description: string;
  }[];
}

export interface DashboardStats {
  commentsGenerated: number;
  profileStrength: number;
  syncStatus: 'connected' | 'disconnected';
}
