// src/types/index.ts
export * from './auth';
export * from './challenge';
export { Task, TaskType } from './task';
export * from './';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export enum BadgeStatus {
  AVAILABLE = 'AVAILABLE',
  PURCHASED = 'PURCHASED',
  EARNED = 'EARNED',
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
 * Teen Progress interface matching backend API response
 */
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

/**
 * Dashboard data interface
 */
export interface DashboardData {
  currentChallenge: {
    id: string;
    theme: string;
    progress: TeenProgress;
    badge: BadgeWithStatus;
  } | null;
  yearlyStats: {
    year: number;
    completedChallenges: number;
    purchasedBadges: number;
    earnedBadges: number;
    totalChallenges: number;
    isRaffleEligible: boolean;
  };
  recentProgress: TeenProgress[];
}

export interface RaffleEntry {
  id: string;
  teenId: string;
  year: number;
  isEligible: boolean;
  createdAt: string;
}

export interface RaffleEligibility {
  year: number;
  isEligible: boolean;
  purchasedBadges: number;
  requiredBadges: number;
  raffleEntry: RaffleEntry | null;
}

export interface RaffleDraw {
  id: string;
  year: number;
  prize: string;
  description?: string;
  winnerId?: string;
  drawnAt?: string;
  createdAt: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface TabItem {
  key: string;
  title: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  badge?: number;
}
