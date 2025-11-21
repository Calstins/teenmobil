// api/authApi.ts
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, Teen } from '../types';
import { router } from 'expo-router';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  age: number;
  gender: string;
  state?: string;
  country?: string;
  parentEmail?: string;
  profilePhotoUrl?: string;
}

export interface LoginResponse {
  teen: Teen;
  token: string;
}

export const authApi = {
  register: async (
    userData: RegisterData
  ): Promise<ApiResponse<LoginResponse>> => {
    try {
      console.log('📝 Registering teen...');
      console.log(
        'Profile Photo URL:',
        userData.profilePhotoUrl ? 'Present' : 'None'
      );

      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/auth/teen/register',
        userData
      );

      if (response.success && response.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify(response.data.teen)
        );
        console.log('✅ Registration successful');
      }

      return response;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> => {
    try {
      console.log('🔐 Logging in...');

      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/auth/teen/login',
        { email, password }
      );

      if (response.success && response.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify(response.data.teen)
        );
        console.log('✅ Login successful');
      }

      return response;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      console.log('👋 Logged out - redirecting to login');

      // Navigate to login screen
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
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

  forgotPassword: async (email: string): Promise<ApiResponse<any>> => {
    try {
      console.log('📧 Requesting password reset...');

      const response = await apiClient.post<ApiResponse<any>>(
        '/auth/forgot-password',
        { email }
      );

      console.log('✅ Password reset email sent');
      return response;
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<ApiResponse<any>> => {
    try {
      console.log('🔒 Resetting password...');

      const response = await apiClient.post<ApiResponse<any>>(
        '/auth/reset-password',
        { token, password }
      );

      console.log('✅ Password reset successful');
      return response;
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  },

  validateResetToken: async (token: string): Promise<ApiResponse<any>> => {
    try {
      console.log('🔍 Validating reset token...');

      const response = await apiClient.get<ApiResponse<any>>(
        `/auth/validate-reset-token?token=${token}`
      );

      console.log('✅ Token validated');
      return response;
    } catch (error: any) {
      console.error('❌ Token validation error:', error);
      throw error;
    }
  },
};
