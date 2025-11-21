// src/context/AuthContext.tsx - Fixed navigation logic

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { authApi, RegisterData } from '../api/authApi';
import { Teen } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

interface AuthContextType {
  user: Teen | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<Teen>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => { },
  register: async () => { },
  logout: async () => { },
  refreshUser: async () => { },
  updateUser: async () => { },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Teen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Handle navigation based on auth state
   * FIXED: Allow authenticated users to access forgot-password and reset-password
   */
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const onProfileSetup = segments[1] === 'profile-setup';

    // ✅ CRITICAL FIX: Allow authenticated users to access password reset pages
    const onPasswordPages = segments[1] === 'forgot-password' || segments[1] === 'reset-password';

    console.log('🔍 Auth Check:', {
      inAuthGroup,
      inTabsGroup,
      isAuthenticated: !!user,
      needsProfileSetup: user?.needsProfileSetup,
      segments: segments.join('/'),
      isLoading,
      onPasswordPages
    });

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      console.log('🔒 Not authenticated - redirecting to login');
      router.replace('/(auth)/login');
    } else if (user) {
      // Check if user needs profile setup (but not if on password pages)
      if (user.needsProfileSetup && !onProfileSetup && !onPasswordPages) {
        console.log('📝 Profile setup needed - redirecting');
        router.replace('/(auth)/profile-setup');
      }
      // Only redirect to home if:
      // 1. Profile is complete
      // 2. User is in auth group
      // 3. NOT on profile setup page
      // 4. NOT on password reset pages
      else if (!user.needsProfileSetup && inAuthGroup && !onProfileSetup && !onPasswordPages) {
        console.log('✅ Profile complete - navigating to home');
        router.replace('/(tabs)/home');
      }
      // If on password pages, do nothing - let them stay there
    }
  }, [user, segments, isLoading]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAuth = await authApi.isAuthenticated();

      if (isAuth) {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        setUser(response.data.teen);
        console.log('✅ User logged in successfully');

        if (response.data.teen.needsProfileSetup) {
          router.replace('/(auth)/profile-setup');
        } else {
          router.replace('/(tabs)/home');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authApi.register(userData);

      if (response.success && response.data) {
        setUser(response.data.teen);
        console.log('✅ User registered successfully');

        if (response.data.teen.needsProfileSetup) {
          router.replace('/(auth)/profile-setup');
        } else {
          router.replace('/(tabs)/home');
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setUser(null);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('✅ User data refreshed:', { needsProfileSetup: parsedUser.needsProfileSetup });
      }
    } catch (error) {
      console.error('❌ Refresh user error:', error);
    }
  };

  const updateUser = async (userData: Partial<Teen>) => {
    try {
      if (!user) {
        throw new Error('No user to update');
      }

      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

      console.log('✅ User data updated in context');
    } catch (error) {
      console.error('❌ Update user error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;