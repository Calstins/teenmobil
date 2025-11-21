// src/utils/validation.ts - Updated with Gender and Enhanced Age Validation

import * as Yup from 'yup';

/**
 * Gender options constant
 */
export const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male', icon: 'user' },
  { label: 'Female', value: 'Female', icon: 'user' },
] as const;

/**
 * Age range constant for teens
 */
export const AGE_RANGE = {
  MIN: 13,
  MAX: 19,
} as const;

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
    .min(
      AGE_RANGE.MIN,
      `You must be at least ${AGE_RANGE.MIN} years old to use TeenShapers`
    )
    .max(
      AGE_RANGE.MAX,
      `TeenShapers is for teens aged ${AGE_RANGE.MIN}-${AGE_RANGE.MAX} only`
    )
    .required('Age is required')
    .typeError('Please enter a valid age'),

  gender: Yup.string()
    .oneOf(['Male', 'Female'], 'Please select a valid gender')
    .required('Gender is required'),

  phone: Yup.string()
    .matches(/^[0-9]{10,}$/, 'Please enter a valid phone number')
    .optional(),

  text: Yup.string()
    .min(1, 'This field is required')
    .required('This field is required'),

  optionalText: Yup.string().optional(),

  url: Yup.string().url('Please enter a valid URL').optional(),
};

/**
 * Registration form schema
 */
export const registrationSchema = Yup.object().shape({
  name: ValidationSchemas.name,
  email: ValidationSchemas.email,
  password: ValidationSchemas.password,
  age: ValidationSchemas.age,
  gender: ValidationSchemas.gender,
  state: ValidationSchemas.optionalText,
  country: ValidationSchemas.optionalText,
  parentEmail: Yup.string()
    .email('Please enter a valid parent email')
    .optional(),
});

/**
 * Profile update schema
 */
export const profileUpdateSchema = Yup.object().shape({
  name: ValidationSchemas.name,
  age: ValidationSchemas.age,
  gender: ValidationSchemas.gender,
  state: ValidationSchemas.optionalText,
  country: ValidationSchemas.optionalText,
});

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
 * Validate age with detailed error messages
 * @param age - Age to validate (string or number)
 * @returns Validation result with error message
 */
export const validateAgeWithMessage = (
  age: string | number
): { isValid: boolean; error?: string } => {
  const ageStr = String(age);

  if (!ageStr || ageStr.trim() === '') {
    return {
      isValid: false,
      error: 'Age is required',
    };
  }

  const ageNum = parseInt(ageStr, 10);

  if (isNaN(ageNum)) {
    return {
      isValid: false,
      error: 'Please enter a valid age',
    };
  }

  if (ageNum < AGE_RANGE.MIN) {
    return {
      isValid: false,
      error: `You must be at least ${AGE_RANGE.MIN} years old to use TeenShapers`,
    };
  }

  if (ageNum > AGE_RANGE.MAX) {
    return {
      isValid: false,
      error: `TeenShapers is for teens aged ${AGE_RANGE.MIN}-${AGE_RANGE.MAX} only`,
    };
  }

  return { isValid: true };
};

/**
 * Validate gender selection
 * @param gender - Gender value to validate
 * @returns Validation result with error message
 */
export const validateGenderWithMessage = (
  gender: string
): { isValid: boolean; error?: string } => {
  if (!gender || gender.trim() === '') {
    return {
      isValid: false,
      error: 'Please select your gender',
    };
  }

  const validGenders = ['Male', 'Female'];
  if (!validGenders.includes(gender)) {
    return {
      isValid: false,
      error: 'Please select a valid gender option',
    };
  }

  return { isValid: true };
};

/**
 * Sanitize age input - only allow numeric characters
 * @param input - Age input string
 * @returns Sanitized numeric string (max 2 digits)
 */
export const sanitizeAgeInput = (input: string): string => {
  // Remove non-numeric characters
  const numeric = input.replace(/[^0-9]/g, '');

  // Limit to 2 digits
  return numeric.slice(0, 2);
};

/**
 * Get age validation hint message
 * @returns Age validation hint
 */
export const getAgeValidationMessage = (): string => {
  return `Must be ${AGE_RANGE.MIN}-${AGE_RANGE.MAX} years old`;
};

/**
 * Check if gender is valid
 * @param gender - Gender to check
 * @returns True if gender is valid
 */
export const isValidGender = (gender: string): boolean => {
  return ['Male', 'Female'].includes(gender);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with errors
 */
export const validatePassword = (
  password: string
): { valid: boolean; errors: string[] } => {
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
 * Validate simple password (just length check)
 * @param password - Password to validate
 * @returns Validation result with error message
 */
export const validateSimplePassword = (
  password: string
): { isValid: boolean; error?: string } => {
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required',
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters',
    };
  }

  if (password.length > 100) {
    return {
      isValid: false,
      error: 'Password must be less than 100 characters',
    };
  }

  return { isValid: true };
};

/**
 * Validate name with detailed error messages
 * @param name - Name to validate
 * @returns Validation result with error message
 */
export const validateNameWithMessage = (
  name: string
): { isValid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: 'Name is required',
    };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters',
    };
  }

  if (name.trim().length > 50) {
    return {
      isValid: false,
      error: 'Name must be less than 50 characters',
    };
  }

  return { isValid: true };
};

/**
 * Validate file size
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes (default 10MB)
 * @returns True if file size is valid
 */
export const validateFileSize = (
  size: number,
  maxSize: number = 10 * 1024 * 1024
): boolean => {
  return size <= maxSize;
};

/**
 * Validate file type
 * @param type - File MIME type
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if file type is allowed
 */
export const validateFileType = (
  type: string,
  allowedTypes: string[]
): boolean => {
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
 * Validate age range (legacy function)
 * @param age - Age to validate
 * @param min - Minimum age (default 13)
 * @param max - Maximum age (default 19)
 * @returns True if age is within range
 */
export const validateAge = (
  age: number,
  min: number = AGE_RANGE.MIN,
  max: number = AGE_RANGE.MAX
): boolean => {
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
