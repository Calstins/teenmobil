// src/utils/helpers.ts

import { Challenge, Task } from '../../types';

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @param format - 'short' or 'long' format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format time to readable string
 * @param date - Date string or Date object
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

/**
 * Get month name from number (1-12)
 * @param month - Month number (1-12)
 * @param short - Return short name (3 letters)
 * @returns Month name
 */
export const getMonthName = (month: number, short: boolean = false): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = months[month - 1] || 'Unknown';
  return short ? monthName.slice(0, 3) : monthName;
};

/**
 * Calculate progress percentage
 * @param completed - Number of completed items
 * @param total - Total number of items
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Truncate text to maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Generate initials from full name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format file size to readable string
 * @param bytes - File size in bytes
 * @returns Formatted file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get task type label for display
 * @param taskType - Task type enum value
 * @returns Human-readable task type
 */
export const getTaskTypeLabel = (taskType: string): string => {
  const labels: Record<string, string> = {
    TEXT: 'Text Response',
    IMAGE: 'Image Upload',
    VIDEO: 'Video Upload',
    QUIZ: 'Quiz',
    FORM: 'Form',
    PICK_ONE: 'Pick One',
    CHECKLIST: 'Checklist',
  };
  
  return labels[taskType] || taskType;
};

/**
 * Debounce function execution
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function execution
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Get days remaining until date
 * @param endDate - End date string or Date object
 * @returns Number of days remaining
 */
export const getDaysRemaining = (endDate: string | Date): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Check if challenge is currently active
 * @param goLiveDate - Challenge start date
 * @param closingDate - Challenge end date
 * @returns True if challenge is active
 */
export const isChallengeLive = (goLiveDate: string, closingDate: string): boolean => {
  const now = new Date();
  const start = new Date(goLiveDate);
  const end = new Date(closingDate);
  
  return now >= start && now <= end;
};

/**
 * Group array of objects by key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Object with grouped arrays
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Group tasks by tab name
 * @param tasks - Array of tasks
 * @returns Object with tasks grouped by tab
 */
export const groupTasksByTab = (tasks: Task[]): Record<string, Task[]> => {
  return tasks.reduce((acc, task) => {
    if (!acc[task.tabName]) {
      acc[task.tabName] = [];
    }
    acc[task.tabName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
};

/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format currency amount
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate random ID
 * @returns Random ID string
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if value is defined and not null
 * @param value - Value to check
 * @returns True if value is defined
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

