// src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi, RegisterData } from '../api/authApi';
import { Teen } from '../types';

/**
 * Authentication context type definition
 */
interface AuthContextType {
  user: Teen | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Authentication context with default values
 */
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages user authentication state and provides auth methods
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Teen | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is authenticated and load user data
   */
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

  /**
   * Login user with email and password
   * @param email - User email
   * @param password - User password
   * @throws Error if login fails
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        setUser(response.data.teen);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Register new user
   * @param userData - User registration data
   * @throws Error if registration fails
   */
  const register = async (userData: RegisterData) => {
    try {
      const response = await authApi.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data.teen);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  /**
   * Logout current user
   * Clears user state and removes stored credentials
   */
  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  /**
   * Refresh user data from storage
   * Useful after profile updates
   */
  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  /**
   * Context value object
   */
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;