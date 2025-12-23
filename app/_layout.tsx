// app/_layout.tsx - Clean fix without type errors
import { useContext, useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouteTracker } from '../hooks/use-route-tracker';

/**
 * Protected route logic component
 */
function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);
  
  // Track current route for API client
  useRouteTracker();

  useEffect(() => {
    // Don't navigate if still loading or already navigated
    if (isLoading || hasNavigated.current) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    // Special pages that shouldn't trigger redirects
    const onPasswordPages =
      segments[1] === 'forgot-password' ||
      segments[1] === 'reset-password';

    const onSetupPages =
      segments[1] === 'onboarding' ||
      segments[1] === 'profile-setup';

    console.log('🔍 Navigation Check:', {
      isAuthenticated,
      segments: segments.join('/'),
      inAuthGroup,
      inTabsGroup,
      needsProfileSetup: user?.needsProfileSetup,
    });

    // Skip navigation logic if not in a defined group (let index.tsx handle it)
    if (!inAuthGroup && !inTabsGroup) {
      console.log('📍 Not in auth or tabs group - skipping navigation logic');
      return;
    }

    // Don't redirect if on onboarding page (let user complete it)
    if (segments[1] === 'onboarding') {
      console.log('⏸️ On onboarding - no redirect needed');
      return;
    }

    // Don't redirect if on password reset pages
    if (onPasswordPages) {
      console.log('⏸️ On password reset page - no redirect needed');
      return;
    }

    // Handle profile setup navigation
    if (isAuthenticated && user?.needsProfileSetup && segments[1] !== 'profile-setup') {
      console.log('📝 Profile setup needed - redirecting');
      hasNavigated.current = true;
      router.replace('/(auth)/profile-setup');
      setTimeout(() => { hasNavigated.current = false; }, 1000);
      return;
    }

    // Redirect unauthenticated users trying to access protected routes
    if (!isAuthenticated && inTabsGroup) {
      console.log('🔒 Redirecting to login - not authenticated');
      hasNavigated.current = true;
      router.replace('/(auth)/login');
      setTimeout(() => { hasNavigated.current = false; }, 1000);
      return;
    }

    // Redirect authenticated users away from login/register
    if (
      isAuthenticated &&
      !user?.needsProfileSetup &&
      inAuthGroup &&
      segments[1] !== 'profile-setup' &&
      !onPasswordPages
    ) {
      const authPages = ['login', 'register'];
      const currentPage = segments[1] as string;
      if (authPages.includes(currentPage)) {
        console.log('✅ Redirecting to home - already authenticated');
        hasNavigated.current = true;
        router.replace('/(tabs)/home');
        setTimeout(() => { hasNavigated.current = false; }, 1000);
      }
    }
  }, [isAuthenticated, segments, isLoading, user]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

/**
 * Root layout with providers
 */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <NotificationProvider>
            <RootLayoutNav />
          </NotificationProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}