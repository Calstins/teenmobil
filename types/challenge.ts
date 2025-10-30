
// src/types/challenge.ts
export interface Challenge {
  id: string;
  year: number;
  month: number;
  theme: string;
  instructions: string;
  goLiveDate: string;
  closingDate: string;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeenProgress {
  id: string;
  teenId: string;
  challengeId: string;
  tasksTotal: number;
  tasksCompleted: number;
  percentage: number;
  completedAt?: string;
  lastUpdated: string;
  challenge?: {
    theme: string;
    year: number;
    month: number;
  };
}

export interface Badge {
  id: string;
  challengeId: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum BadgeStatus {
  AVAILABLE = 'AVAILABLE',
  PURCHASED = 'PURCHASED',
  EARNED = 'EARNED',
}

export interface BadgeWithStatus extends Badge {
  status: BadgeStatus;
}

export interface TeenBadge {
  id: string;
  teenId: string;
  badgeId: string;
  status: BadgeStatus;
  purchasedAt?: string;
  earnedAt?: string;
  badge: Badge & {
    challenge?: {
      year: number;
      month: number;
      theme: string;
    };
  };
}

/**
 * Minimal TaskWithSubmission type used in ChallengeDetail.tasks.
 * Expand fields as needed by other parts of the codebase.
 */
export interface TaskWithSubmission {
  id: string;
  title: string;
  description?: string;
  tabName?: string;
  // array of submission objects; keep flexible to avoid tight coupling
  submissions?: Array<{
    id: string;
    teenId?: string;
    submittedAt?: string;
    status?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface ChallengeDetail {
  challenge: Challenge;
  tasks: Record<string, TaskWithSubmission[]>;
  badge: BadgeWithStatus;
  progress: TeenProgress;
}

export interface LeaderboardEntry {
  rank: number;
  teen: {
    name: string;
    profilePhoto?: string;
  };
  percentage: number;
  tasksCompleted: number;
  completedAt?: string;
}

export interface CommunityStats {
  totalParticipants: number;
  completionStats: Record<string, number>;
  teenRanking: {
    percentage: number;
    ahead_of_percentage: number;
  } | null;
  popularTasks: Array<{
    id: string;
    title: string;
    tabName: string;
    submissions: number;
  }>;
}

export interface YearlyProgressData {
  year: number;
  progress: TeenProgress[];
  stats: {
    completedChallenges: number;
    totalChallenges: number;
    averagePercentage: number;
  };
}

