// src/api/apiClient.ts - Fixed for React Native with proper route tracking
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

const API_BASE_URL = 'https://teensha.vercel.app/api';

class ApiClient {
  private client: AxiosInstance;
  private isNavigatingToLogin = false;
  private currentRoute: string = '';

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    this.setupInterceptors();
  }

  /**
   * Set the current route from outside (called by navigation logic)
   * This allows the API client to know what page the user is on
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

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('authToken');

          // Check if token is required for this endpoint
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

          // ✅ FIX: Don't redirect if on password reset pages
          const onPasswordResetPage = this.isOnPasswordResetPage();

          if (
            !isPublicEndpoint &&
            !token &&
            !this.isNavigatingToLogin &&
            !onPasswordResetPage
          ) {
            this.isNavigatingToLogin = true;
            await AsyncStorage.multiRemove(['authToken', 'userData']);
            console.log('🔒 No token found - redirecting to login');

            setTimeout(() => {
              router.replace('/(auth)/login');
              this.isNavigatingToLogin = false;
            }, 100);

            return Promise.reject({
              message: 'Authentication required',
              status: 401,
            });
          }

          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
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
            // ✅ FIX: Don't auto-redirect on password reset pages
            const onPasswordResetPage = this.isOnPasswordResetPage();

            if (onPasswordResetPage) {
              console.log(
                '⚠️ 401 error on password reset page - not redirecting'
              );
              // Just reject the error without redirecting
              return Promise.reject({
                message: data?.message || 'Unauthorized',
                status,
                data,
              });
            }

            console.log(
              '🔒 Unauthorized - clearing auth and redirecting to login'
            );
            await AsyncStorage.multiRemove(['authToken', 'userData']);

            // Prevent multiple navigation attempts
            if (!this.isNavigatingToLogin) {
              this.isNavigatingToLogin = true;

              setTimeout(() => {
                router.replace('/(auth)/login');
                this.isNavigatingToLogin = false;
              }, 100);
            }
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
