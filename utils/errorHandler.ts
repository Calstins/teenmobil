// src/utils/errorHandler.ts

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Network error class
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

/**
 * Authentication error class
 */
export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', public errors?: any[]) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * Handle API errors and return user-friendly message
 * @param error - Error object from API call
 * @returns User-friendly error message
 */
export const handleApiError = (error: any): string => {
  // Log error for debugging
  console.error('API Error:', error);

  // Handle Axios/Fetch response errors
  if (error.response) {
    const { status, data } = error.response;

    // Specific status code handling
    switch (status) {
      case 400:
        return data?.message || 'Invalid request. Please check your input.';
      case 401:
        return data?.message || 'Authentication failed. Please login again.';
      case 403:
        return data?.message || 'You do not have permission to perform this action.';
      case 404:
        return data?.message || 'The requested resource was not found.';
      case 422:
        return data?.message || 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return data?.message || 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return data?.message || `An error occurred (${status})`;
    }
  }

  // Handle network errors (no response)
  if (error.request) {
    return 'Network error. Please check your internet connection.';
  }

  // Handle custom error messages
  if (error.message) {
    return error.message;
  }

  // Default error message
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Log error to console with context
 * @param error - Error object
 * @param context - Optional context string
 */
export const logError = (error: any, context?: string): void => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  
  console.error(`[${timestamp}]${contextStr} Error:`, error);

  // In production, you can send errors to a logging service
  // Example: Sentry, LogRocket, Firebase Crashlytics
  if (__DEV__) {
    console.error('Error stack:', error.stack);
  }
};

/**
 * Handle and display error in UI
 * @param error - Error object
 * @param showAlert - Whether to show alert (optional)
 * @returns Processed error message
 */
export const handleError = (error: any, showAlert: boolean = false): string => {
  const errorMessage = handleApiError(error);
  
  logError(error);

  if (showAlert && typeof alert !== 'undefined') {
    alert(errorMessage);
  }

  return errorMessage;
};

/**
 * Parse validation errors from API response
 * @param error - Error object with validation errors
 * @returns Object with field-specific error messages
 */
export const parseValidationErrors = (error: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (error.response?.data?.errors) {
    const apiErrors = error.response.data.errors;

    if (Array.isArray(apiErrors)) {
      apiErrors.forEach((err: any) => {
        if (err.field && err.message) {
          errors[err.field] = err.message;
        }
      });
    } else if (typeof apiErrors === 'object') {
      Object.keys(apiErrors).forEach((key) => {
        errors[key] = Array.isArray(apiErrors[key])
          ? apiErrors[key][0]
          : apiErrors[key];
      });
    }
  }

  return errors;
};

/**
 * Check if error is a network error
 * @param error - Error object
 * @returns True if network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof NetworkError ||
    !error.response ||
    error.message === 'Network Error' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'NETWORK_ERROR'
  );
};

/**
 * Check if error is an authentication error
 * @param error - Error object
 * @returns True if auth error
 */
export const isAuthError = (error: any): boolean => {
  return (
    error instanceof AuthError ||
    error.response?.status === 401 ||
    error.statusCode === 401 ||
    error.code === 'AUTH_ERROR'
  );
};

/**
 * Check if error is a validation error
 * @param error - Error object
 * @returns True if validation error
 */
export const isValidationError = (error: any): boolean => {
  return (
    error instanceof ValidationError ||
    error.response?.status === 400 ||
    error.response?.status === 422 ||
    error.statusCode === 400 ||
    error.code === 'VALIDATION_ERROR'
  );
};

/**
 * Retry failed API call with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param delay - Initial delay in milliseconds
 * @returns Promise with function result
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on auth errors or validation errors
      if (isAuthError(error) || isValidationError(error)) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
};

/**
 * Create error response object
 * @param message - Error message
 * @param code - Error code
 * @param details - Additional error details
 * @returns Standardized error object
 */
export const createErrorResponse = (
  message: string,
  code?: string,
  details?: any
) => {
  return {
    success: false,
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Global error handler for unhandled errors
 * @param error - Error object
 */
export const globalErrorHandler = (error: any): void => {
  logError(error, 'GLOBAL');

  // You can add global error handling logic here
  // Example: Show a toast notification, send to error tracking service
  
  if (__DEV__) {
    console.error('Unhandled error:', error);
  }
};

// Export all error types
export default {
  AppError,
  NetworkError,
  AuthError,
  ValidationError,
  handleApiError,
  handleError,
  logError,
  parseValidationErrors,
  isNetworkError,
  isAuthError,
  isValidationError,
  retryWithBackoff,
  createErrorResponse,
  globalErrorHandler,
};