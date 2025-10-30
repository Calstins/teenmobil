// src/api/badgeApi.ts
import apiClient from './apiClient';
import { ApiResponse } from '../../types';

export const badgeApi = {
  purchaseBadge: async (badgeId: string): Promise<ApiResponse<any>> => {
    return await apiClient.post('/badges/purchase', { badgeId });
  },

  getMyBadges: async (year?: number): Promise<ApiResponse<any[]>> => {
    const params = year ? `?year=${year}` : '';
    return await apiClient.get(`/badges/my-badges${params}`);
  },
};

export default badgeApi;