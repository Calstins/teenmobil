// src/api/authApi.ts
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, Teen } from '../../types';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  age: number;
  gender?: string;
  state?: string;
  country?: string;
  parentEmail?: string;
}

export interface LoginResponse {
  teen: Teen;
  token: string;
}

export const authApi = {
  register: async (userData: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/teen/register', userData);
    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.teen));
    }
    return response;
  },

  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/teen/login', { email, password });
    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.teen));
    }
    return response;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove(['authToken', 'userData']);
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch {
      return false;
    }
  },

  getCurrentUser: async (): Promise<Teen | null> => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },
};
