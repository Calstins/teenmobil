// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
// Import any other providers you need

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Add other providers here if needed */}
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}