
// src/hooks/useApi.ts

import { useState, useCallback } from 'react';
import { handleApiError } from '../utils/errorHandler';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T = any>(
  apiFunc: (...args: any[]) => Promise<any>
): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      
      try {
        const response = await apiFunc(...args);
        const data = response.success ? response.data : response;
        setState({ data, loading: false, error: null });
        return data;
      } catch (error: any) {
        const errorMessage = handleApiError(error);
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};