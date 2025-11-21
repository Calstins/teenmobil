// app/_layout.tsx 
import { useContext, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

/**
 * Protected route logic component
 */
function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    // ✅ FIX: Check if user is on password reset pages
    const onPasswordPages =
      segments[1] === 'forgot-password' ||
      segments[1] === 'reset-password';

    // ✅ FIX: Check if user is on onboarding/setup pages
    const onSetupPages =
      segments[1] === 'onboarding' ||
      segments[1] === 'profile-setup';

    console.log('🔍 Auth Check:', {
      isAuthenticated,
      isLoading,
      segments: segments.join('/'),
      inAuthGroup,
      inTabsGroup,
      onPasswordPages,
      onSetupPages
    });

    if (!isAuthenticated && inTabsGroup) {
      // User is not authenticated but trying to access protected routes
      console.log('🔒 Redirecting to login - not authenticated');
      router.replace('/(auth)/login');
    } else if (
      isAuthenticated &&
      inAuthGroup &&
      !onSetupPages &&
      !onPasswordPages // ✅ FIX: Don't redirect if on password pages
    ) {
      // User is authenticated but on login/register screens
      console.log('✅ Redirecting to home - already authenticated');
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, segments, isLoading]);

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
        <NotificationProvider>
          <RootLayoutNav />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}