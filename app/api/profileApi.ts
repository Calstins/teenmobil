
// src/api/profileApi.ts
import apiClient from './apiClient';
import { ApiResponse } from '../../types';

export const profileApi = {
  getProfile: async (): Promise<ApiResponse<any>> => {
    return await apiClient.get('/teens/profile');
  },

  updateProfile: async (data: any): Promise<ApiResponse<any>> => {
    return await apiClient.patch('/teens/profile', data);
  },

  getDashboard: async (): Promise<ApiResponse<any>> => {
    return await apiClient.get('/teens/dashboard');
  },
};

export default profileApi;