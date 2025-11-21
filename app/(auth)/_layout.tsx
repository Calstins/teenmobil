// app/(auth)/_layout.tsx
import { useContext } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';

export default function AuthLayout() {
    const { isAuthenticated } = useContext(AuthContext);
    const router = useRouter();

    if (isAuthenticated) {
        console.log('✅ Auth Layout: User already authenticated');
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="profile-setup" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="reset-password" />
        </Stack>
    );
}