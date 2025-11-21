// src/hooks/use-form-validation.ts
import { useState, useCallback } from 'react';

interface ValidationRule<T> {
  validate: (value: T) => { isValid: boolean; error?: string };
  message?: string;
}

interface FormValidationConfig<T> {
  [key: string]: ValidationRule<any>;
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: FormValidationConfig<T>
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  /**
   * Handle field value change
   */
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts editing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  /**
   * Handle field blur (when user leaves the field)
   */
  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field);
    },
    [values, validationRules]
  );

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (field: keyof T): boolean => {
      const rule = validationRules[field as string];
      if (!rule) return true;

      const result = rule.validate(values[field]);

      if (!result.isValid) {
        setErrors((prev) => ({
          ...prev,
          [field]: result.error || rule.message || 'Invalid value',
        }));
        return false;
      }

      // Clear error if valid
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });

      return true;
    },
    [values, validationRules]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    // Validate all fields that have rules
    Object.keys(validationRules).forEach((field) => {
      const rule = validationRules[field];
      const result = rule.validate(values[field as keyof T]);

      if (!result.isValid) {
        newErrors[field as keyof T] =
          result.error || rule.message || 'Invalid value';
        isValid = false;
      }
    });

    setErrors(newErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    return isValid;
  }, [values, validationRules]);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Manually set field error
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Clear field error
   */
  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    setFieldError,
    clearFieldError,
  };
}
