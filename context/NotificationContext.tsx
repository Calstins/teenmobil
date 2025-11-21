// context/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import notificationService from '../services/notificationService';

interface NotificationContextType {
    expoPushToken: string | null;
    isNotificationEnabled: boolean;
    notificationCount: number;
    registerForNotifications: () => Promise<void>;
    unregisterNotifications: () => Promise<void>;
    clearNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    useEffect(() => {
        // Initialize notifications
        initializeNotifications();

        // Set up notification listeners
        notificationListener.current = notificationService.addNotificationReceivedListener(
            handleNotificationReceived
        );

        responseListener.current = notificationService.addNotificationResponseListener(
            handleNotificationResponse
        );

        // Load badge count
        loadBadgeCount();

        // Cleanup
        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    const initializeNotifications = async () => {
        try {
            const token = await notificationService.registerForPushNotifications();
            if (token) {
                setExpoPushToken(token);
                setIsNotificationEnabled(true);
                console.log('✅ Notifications initialized:', token);
            }
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
        }
    };

    const loadBadgeCount = async () => {
        try {
            const count = await notificationService.getBadgeCount();
            setNotificationCount(count);
        } catch (error) {
            console.error('Failed to load badge count:', error);
        }
    };

    const handleNotificationReceived = (notification: Notifications.Notification) => {
        console.log('📬 Notification received:', notification);

        // Increment badge count
        setNotificationCount(prev => {
            const newCount = prev + 1;
            notificationService.setBadgeCount(newCount);
            return newCount;
        });

        // You can show in-app notification here if needed
        const { title, body } = notification.request.content;
        console.log(`Title: ${title}, Body: ${body}`);
    };

    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
        console.log('👆 Notification tapped:', response);

        const data = response.notification.request.content.data;

        // Navigate based on notification type
        switch (data.type) {
            case 'CHALLENGE_PUBLISHED':
                router.push('/(tabs)/challenges');
                break;
            case 'SUBMISSION_REVIEWED':
                if (data.submissionId) {
                    // Navigate to submission detail if you have such a screen
                    router.push('/(tabs)/progress');
                }
                break;
            case 'BADGE_EARNED':
                router.push('/(tabs)/badges');
                break;
            case 'CHALLENGE_CLOSING':
                router.push('/(tabs)/challenges');
                break;
            default:
                router.push('/(tabs)/home');
        }

        // Decrement badge count
        setNotificationCount(prev => {
            const newCount = Math.max(0, prev - 1);
            notificationService.setBadgeCount(newCount);
            return newCount;
        });
    };

    const registerForNotifications = async () => {
        try {
            const token = await notificationService.registerForPushNotifications();
            if (token) {
                setExpoPushToken(token);
                setIsNotificationEnabled(true);
            }
        } catch (error) {
            console.error('Failed to register for notifications:', error);
            throw error;
        }
    };

    const unregisterNotifications = async () => {
        try {
            await notificationService.unregisterPushNotifications();
            setExpoPushToken(null);
            setIsNotificationEnabled(false);
        } catch (error) {
            console.error('Failed to unregister notifications:', error);
            throw error;
        }
    };

    const clearNotifications = async () => {
        try {
            await notificationService.clearBadgeCount();
            setNotificationCount(0);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                expoPushToken,
                isNotificationEnabled,
                notificationCount,
                registerForNotifications,
                unregisterNotifications,
                clearNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};