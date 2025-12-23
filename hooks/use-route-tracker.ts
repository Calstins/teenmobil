// src/hooks/useRouteTracker.ts
import { useEffect } from 'react';
import { useSegments } from 'expo-router';
import apiClient from '../api/apiClient';

export const useRouteTracker = () => {
  const segments = useSegments();

  useEffect(() => {
    const currentRoute = segments.join('/');
    apiClient.setCurrentRoute(currentRoute);
    
    // Only log on route changes for debugging
    if (currentRoute) {
      console.log('📍 Current route:', currentRoute);
    }
  }, [segments]);
};