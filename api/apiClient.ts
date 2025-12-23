// src/api/apiClient.ts - Enhanced route tracking
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

const API_BASE_URL = 'https://teensha.vercel.app/api';

class ApiClient {
  private client: AxiosInstance;
  private isNavigatingToLogin = false;
  private currentRoute: string = '';
  private lastNavigationTime = 0;
  private navigationCooldown = 2000; // 2 seconds

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    this.setupInterceptors();
  }

  /**
   * Set the current route from outside
   */
  public setCurrentRoute(route: string): void {
    this.currentRoute = route;
  }

  /**
   * Check if current route is a password reset page
   */
  private isOnPasswordResetPage(): boolean {
    return (
      this.currentRoute.includes('forgot-password') ||
      this.currentRoute.includes('reset-password')
    );
  }

  /**
   * Check if we should skip auth redirect
   */
  private shouldSkipAuthRedirect(): boolean {
    const specialPages = [
      'forgot-password',
      'reset-password',
      'onboarding',
      'register',
      'login',
      'index',
    ];
    return specialPages.some(page => this.currentRoute.includes(page));
  }

  /**
   * Navigate to login with cooldown to prevent rapid redirects
   */
  private navigateToLogin(): void {
    const now = Date.now();
    if (now - this.lastNavigationTime < this.navigationCooldown) {
      console.log('⏸️ Navigation cooldown active - skipping redirect');
      return;
    }

    if (!this.isNavigatingToLogin) {
      this.isNavigatingToLogin = true;
      this.lastNavigationTime = now;
      
      console.log('🔒 Navigating to login');
      setTimeout(() => {
        router.replace('/(auth)/login');
        setTimeout(() => {
          this.isNavigatingToLogin = false;
        }, 500);
      }, 100);
    }
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('authToken');

          // Public endpoints that don't require authentication
          const publicEndpoints = [
            '/teen/login',
            '/teen/register',
            '/auth/teen/login',
            '/auth/teen/register',
            '/auth/forgot-password',
            '/auth/reset-password',
            '/auth/validate-reset-token',
          ];

          const isPublicEndpoint = publicEndpoints.some((endpoint) =>
            config.url?.includes(endpoint)
          );

          // Check if we should skip redirect
          const shouldSkip = this.shouldSkipAuthRedirect();

          if (!isPublicEndpoint && !token && !shouldSkip) {
            console.log('🔒 No token found for protected endpoint');
            await AsyncStorage.multiRemove(['authToken', 'userData']);
            
            this.navigateToLogin();

            return Promise.reject({
              message: 'Authentication required',
              status: 401,
            });
          }

          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('❌ Error in request interceptor:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response.data,
      async (error: AxiosError<any>) => {
        if (error.response) {
          const { status, data } = error.response;

          // Handle 401 Unauthorized
          if (status === 401) {
            const onPasswordResetPage = this.isOnPasswordResetPage();
            const shouldSkip = this.shouldSkipAuthRedirect();

            if (onPasswordResetPage || shouldSkip) {
              console.log('⚠️ 401 on special page - not redirecting');
              return Promise.reject({
                message: data?.message || 'Unauthorized',
                status,
                data,
              });
            }

            console.log('🔒 401 Unauthorized - clearing auth');
            await AsyncStorage.multiRemove(['authToken', 'userData']);
            this.navigateToLogin();
          }

          return Promise.reject({
            message: data?.message || 'An error occurred',
            status,
            data,
          });
        } else if (error.request) {
          return Promise.reject({
            message: 'Network error. Please check your connection.',
            status: 0,
          });
        } else {
          return Promise.reject({
            message: error.message || 'An unexpected error occurred',
            status: 0,
          });
        }
      }
    );
  }

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.client.get(url, config);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.client.post(url, data, config);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.client.put(url, data, config);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.client.patch(url, data, config);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.client.delete(url, config);
  }
}

export default new ApiClient();