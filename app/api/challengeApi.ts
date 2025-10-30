// src/api/challengeApi.ts
import apiClient from './apiClient';
import { ApiResponse, ChallengeDetail } from '../../types';

export const challengeApi = {
  getCurrentChallenge: async (): Promise<ApiResponse<ChallengeDetail>> => {
    return await apiClient.get('/challenges/current');
  },

  getCommunityStats: async (): Promise<ApiResponse<any>> => {
    return await apiClient.get('/challenges/stats');
  },

  getLeaderboard: async (): Promise<ApiResponse<any[]>> => {
    return await apiClient.get('/challenges/leaderboard');
  },
};

export default challengeApi;
