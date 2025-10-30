// src/api/progressApi.ts

import apiClient from './apiClient';
import { ApiResponse, TeenProgress, YearlyProgressData } from '../types';

/**
 * Progress API endpoints
 */
export const progressApi = {
  /**
   * Get teen's progress for a specific challenge
   * @param challengeId - Challenge ID
   * @returns Challenge progress data
   */
  getChallengeProgress: async (challengeId: string): Promise<ApiResponse<TeenProgress>> => {
    return await apiClient.get(`/progress/challenge/${challengeId}`);
  },

  /**
   * Get teen's yearly progress
   * @param year - Year to get progress for
   * @returns Yearly progress data with stats
   */
  getYearlyProgress: async (year: number): Promise<ApiResponse<YearlyProgressData>> => {
    return await apiClient.get(`/progress/year/${year}`);
  },

  /**
   * Get progress analytics (Admin only)
   * @param year - Optional year filter
   * @param month - Optional month filter
   * @returns Progress analytics data
   */
  getProgressAnalytics: async (year?: number, month?: number): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiClient.get(`/progress/analytics/overview${queryString}`);
  },
};

export default progressApi;