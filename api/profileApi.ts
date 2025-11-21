//api/profileApi.ts
import apiClient from './apiClient';
import { ApiResponse } from '../types';

export const profileApi = {
  getProfile: async (): Promise<ApiResponse<any>> => {
    return await apiClient.get('/teen/profile');
  },

  updateProfile: async (data: any): Promise<ApiResponse<any>> => {
    return await apiClient.put('/teen/profile', data);
  },

  getDashboard: async (): Promise<ApiResponse<any>> => {
    return await apiClient.get('/teen/dashboard');
  },
};

export default profileApi;
