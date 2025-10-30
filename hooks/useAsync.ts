// src/hooks/useAsync.ts

import { useState, useEffect, useCallback } from 'react';

interface UseAsyncOptions {
  immediate?: boolean;
}

export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = { immediate: true }
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return { data, loading, error, execute };
};

