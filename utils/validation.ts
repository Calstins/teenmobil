// src/utils/validation.ts

import * as Yup from 'yup';

/**
 * Yup validation schemas for forms
 */
export const ValidationSchemas = {
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),

  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),

  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),

  age: Yup.number()
    .min(13, 'You must be at least 13 years old')
    .max(19, 'You must be under 20 years old')
    .required('Age is required'),

  phone: Yup.string()
    .matches(/^[0-9]{10,}$/, 'Please enter a valid phone number')
    .optional(),

  text: Yup.string()
    .min(1, 'This field is required')
    .required('This field is required'),

  optionalText: Yup.string().optional(),

  url: Yup.string()
    .url('Please enter a valid URL')
    .optional(),
};

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with errors
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate file size
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes (default 10MB)
 * @returns True if file size is valid
 */
export const validateFileSize = (size: number, maxSize: number = 10 * 1024 * 1024): boolean => {
  return size <= maxSize;
};

/**
 * Validate file type
 * @param type - File MIME type
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if file type is allowed
 */
export const validateFileType = (type: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(type);
};

/**
 * Validate phone number
 * @param phone - Phone number to validate
 * @returns True if phone number is valid
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate age range
 * @param age - Age to validate
 * @param min - Minimum age (default 13)
 * @param max - Maximum age (default 19)
 * @returns True if age is within range
 */
export const validateAge = (age: number, min: number = 13, max: number = 19): boolean => {
  return age >= min && age <= max;
};

/**
 * Check if string is empty or whitespace
 * @param value - String to check
 * @returns True if string is empty
 */
export const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * Sanitize string input (trim and normalize spaces)
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if value is numeric
 * @param value - Value to check
 * @returns True if value is numeric
 */
export const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export default ValidationSchemas;