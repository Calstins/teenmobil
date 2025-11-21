// src/api/challengeApi.ts
import apiClient from './apiClient';
import { ApiResponse, ChallengeDetail } from '../types';

export const challengeApi = {
  getCurrentChallenge: async (): Promise<ApiResponse<ChallengeDetail>> => {
    return await apiClient.get('/teen/challenges/current');
  },

  // ← Add this new function
  getChallengeById: async (
    challengeId: string
  ): Promise<ApiResponse<ChallengeDetail>> => {
    return await apiClient.get(`/teen/challenges/${challengeId}`);
  },

  getCommunityStats: async (): Promise<ApiResponse<any>> => {
    return await apiClient.get('/teen/challenges/stats');
  },

  getLeaderboard: async (): Promise<ApiResponse<any[]>> => {
    return await apiClient.get('/teen/challenges/leaderboard');
  },
};

export default challengeApi;
