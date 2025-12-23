// app/index.tsx - Fixed to prevent login screen flash
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export default function Index() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Check onboarding FIRST, before waiting for auth
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Then handle auth navigation once onboarding check is done
  useEffect(() => {
    if (!isLoading && !isCheckingOnboarding) {
      handleAuthNavigation();
    }
  }, [isAuthenticated, isLoading, isCheckingOnboarding]);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

      console.log('📱 Onboarding Check:', {
        hasSeenOnboarding: !!hasSeenOnboarding,
      });

      if (!hasSeenOnboarding) {
        // First time user - go straight to onboarding
        console.log('👋 First time user - showing onboarding immediately');
        router.replace('/(auth)/onboarding' as any);
        // Don't set isCheckingOnboarding to false - we're navigating away
      } else {
        // Has seen onboarding - now check auth
        console.log('✅ Has seen onboarding - checking auth');
        setIsCheckingOnboarding(false);
      }
    } catch (error) {
      console.error('❌ Onboarding check error:', error);
      // On error, assume first time user
      router.replace('/(auth)/onboarding' as any);
    }
  };

  const handleAuthNavigation = () => {
    console.log('📱 Auth Navigation:', {
      isAuthenticated,
    });

    if (isAuthenticated) {
      // Authenticated user - go to home
      console.log('✅ Authenticated user - going to home');
      router.replace('/(tabs)/home' as any);
    } else {
      // Not authenticated - go to login
      console.log('🔐 Not authenticated - showing login');
      router.replace('/(auth)/login' as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <ActivityIndicator size="large" color={theme.textInverse} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});