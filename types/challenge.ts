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
  rank: number;
  percentage: number;
  ahead_of_percentage: number;
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

export interface TaskWithSubmission {
  id: string;
  title: string;
  description?: string;
  tabName?: string;
  submissions?: Array<any>;
  [key: string]: any;
}

export interface ChallengeDetail {
  challenge: Challenge;
  tasks: Record<string, TaskWithSubmission>;
  badge: BadgeWithStatus;
  progress: TeenProgress;
}

// ============================================
// COMMUNITY & LEADERBOARD TYPES
// ============================================

export interface LeaderboardEntry {
  rank: number;
  teen: {
    name: string;
    profilePhoto: string | null;
  };
  percentage: number;
  tasksCompleted: number;
  tasksTotal: number;
  completedAt: string | null;
}

export interface CommunityStats {
  totalParticipants: number;
  completionStats: {
    [key: string]: number;
  };
  teenRanking: {
    percentage: number;
    ahead_of_percentage: number;
    rank: number;
    total: number;
  } | null;
  popularTasks: Array<any>;
  challenge?: {
    id: string;
    theme: string;
    month: number;
    year: number;
  };
}

export interface RecentActivity {
  id: string;
  type:
    | 'CHALLENGE_COMPLETED'
    | 'BADGE_EARNED'
    | 'TASK_SUBMITTED'
    | 'HIGH_PERFORMER';
  teen: {
    name: string;
    profilePhoto: string | null;
  };
  challenge?: {
    theme: string;
    month: number;
    year: number;
  };
  badge?: {
    name: string;
    imageUrl: string;
  };
  task?: {
    title: string;
  };
  timestamp: string;
  message: string;
}

export interface TopPerformer {
  teen: {
    name: string;
    profilePhoto: string | null;
  };
  completedChallenges: number;
  earnedBadges: number;
  averageProgress: number;
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
