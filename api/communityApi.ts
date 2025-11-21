// src/api/communityApi.ts
import apiClient from './apiClient';
import {
  ApiResponse,
  LeaderboardEntry,
  RecentActivity,
  CommunityStats,
  TopPerformer,
} from '../types';

export const communityApi = {
  getLeaderboard: async (): Promise<ApiResponse<LeaderboardEntry[]>> => {
    return await apiClient.get('/teen/challenges/leaderboard');
  },

  getCommunityStats: async (): Promise<ApiResponse<CommunityStats>> => {
    return await apiClient.get('/teen/challenges/stats');
  },

  getRecentActivity: async (
    limit?: number
  ): Promise<ApiResponse<RecentActivity[]>> => {
    const params = limit ? `?limit=${limit}` : '';
    return await apiClient.get(`/teen/community/activity${params}`);
  },

  getTopPerformers: async (
    year?: number,
    month?: number
  ): Promise<ApiResponse<TopPerformer[]>> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiClient.get(`/teen/community/top-performers${queryString}`);
  },
};

export default communityApi;
