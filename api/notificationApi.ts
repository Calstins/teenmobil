// src/api/notificationApi.ts
import apiClient from './apiClient';
import { ApiResponse } from '../types';

export interface RegisterTokenData {
  expoPushToken: string;
  deviceType: 'ios' | 'android';
}

export interface NotificationHistoryResponse {
  notifications: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const notificationApi = {
  /**
   * Register push notification token
   */
  registerToken: async (data: RegisterTokenData): Promise<ApiResponse<any>> => {
    return await apiClient.post('/teen/notifications/register', data);
  },

  /**
   * Unregister push notification token
   */
  unregisterToken: async (data: {
    expoPushToken: string;
  }): Promise<ApiResponse<any>> => {
    return await apiClient.post('/teen/notifications/unregister', data);
  },

  /**
   * Get notification history
   */
  getHistory: async (
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<NotificationHistoryResponse>> => {
    return await apiClient.get(
      `/teen/notifications/history?page=${page}&limit=${limit}`
    );
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<ApiResponse<any>> => {
    return await apiClient.patch(`/teen/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<any>> => {
    return await apiClient.patch('/teen/notifications/read-all');
  },
};

export default notificationApi;
