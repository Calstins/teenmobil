// src/api/badgeApi.ts - UPDATED WITH PAYSTACK
import apiClient from './apiClient';
import { ApiResponse } from '../types';

export const badgeApi = {
  // Initialize badge purchase (get Paystack payment URL)
  initializeBadgePurchase: async (
    badgeId: string
  ): Promise<
    ApiResponse<{
      authorization_url: string;
      access_code: string;
      reference: string;
      badge: {
        id: string;
        name: string;
        description: string;
        price: number;
      };
    }>
  > => {
    return await apiClient.post('/teen/badges/purchase/initialize', {
      badgeId,
    });
  },

  // Verify badge purchase after payment
  verifyBadgePurchase: async (reference: string): Promise<ApiResponse<any>> => {
    return await apiClient.get(`/teen/badges/purchase/verify/${reference}`);
  },

  // Get user's badges
  getMyBadges: async (year?: number): Promise<ApiResponse<any[]>> => {
    const params = year ? `?year=${year}` : '';
    return await apiClient.get(`/teen/badges/my-badges${params}`);
  },
};

export default badgeApi;
