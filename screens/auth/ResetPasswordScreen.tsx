// screens/auth/ResetPasswordScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { useTheme } from '../../context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius, Fonts } from '../../theme';
import { authApi } from '../../api/authApi';
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm password'),
});

export const ResetPasswordScreen = () => {
    const router = useRouter();
    const { token } = useLocalSearchParams();
    const { theme } = useTheme();
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            if (!token || typeof token !== 'string') {
                throw new Error('No reset token provided');
            }

            const response = await authApi.validateResetToken(token);

            if (response.success) {
                setTokenValid(true);
                setUserEmail(response.data?.email || '');
            } else {
                throw new Error('Invalid token');
            }
        } catch (error: any) {
            Alert.alert(
                'Invalid Link',
                'This password reset link is invalid or has expired. Please request a new one.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(auth)/forgot-password' as any),
                    },
                ]
            );
            setTokenValid(false);
        } finally {
            setIsValidatingToken(false);
        }
    };

    const handleResetPassword = async (
        values: { password: string; confirmPassword: string },
        { setSubmitting }: any
    ) => {
        try {
            if (typeof token !== 'string') {
                throw new Error('Invalid token');
            }

            const response = await authApi.resetPassword(token, values.password);

            if (response.success) {
                Alert.alert(
                    'Success! 🎉',
                    'Your password has been reset successfully. You can now sign in with your new password.',
                    [
                        {
                            text: 'Sign In',
                            onPress: () => router.replace('/(auth)/login' as any),
                        },
                    ]
                );
            }
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.message || 'Failed to reset password. Please try again or request a new reset link.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (isValidatingToken) {
        return <Loading message="Validating reset link..." />;
    }

    if (!tokenValid) {
        return null; // Alert will handle navigation
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.keyboardView, { backgroundColor: theme.background }]}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                        <Icon name="key" size={64} color={theme.primary} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.header }]}>
                            Reset Password
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Enter your new password for {userEmail}
                        </Text>
                    </View>

                    <Formik
                        initialValues={{ password: '', confirmPassword: '' }}
                        validationSchema={ResetPasswordSchema}
                        onSubmit={handleResetPassword}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                            <View style={styles.formContainer}>
                                <Input
                                    label="New Password"
                                    placeholder="Enter new password"
                                    icon="lock"
                                    secureTextEntry
                                    value={values.password}
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    error={touched.password && errors.password ? errors.password : undefined}
                                />

                                <Input
                                    label="Confirm Password"
                                    placeholder="Confirm new password"
                                    icon="lock"
                                    secureTextEntry
                                    value={values.confirmPassword}
                                    onChangeText={handleChange('confirmPassword')}
                                    onBlur={handleBlur('confirmPassword')}
                                    error={
                                        touched.confirmPassword && errors.confirmPassword
                                            ? errors.confirmPassword
                                            : undefined
                                    }
                                />

                                {/* Password Requirements */}
                                <View style={[styles.requirementsBox, { backgroundColor: theme.primaryLight }]}>
                                    <Icon name="info" size={16} color={theme.primary} />
                                    <Text style={[styles.requirementsText, { color: theme.primary, fontFamily: Fonts.body }]}>
                                        Password must be at least 6 characters long
                                    </Text>
                                </View>

                                <Button
                                    title="Reset Password"
                                    onPress={() => handleSubmit()}
                                    isLoading={isSubmitting}
                                    style={styles.submitButton}
                                />

                                <View style={styles.footer}>
                                    <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)}>
                                        <Text style={[styles.footerLink, { color: theme.primary, fontFamily: Fonts.body }]}>
                                            Back to Sign In
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </Formik>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    iconContainer: {
        padding: spacing.xl,
        borderRadius: borderRadius.full,
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: fontSize['3xl'],
        fontWeight: fontWeight.extrabold,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fontSize.sm,
        textAlign: 'center',
        lineHeight: fontSize.sm * 1.5,
        paddingHorizontal: spacing.md,
    },
    formContainer: {
        width: '100%',
    },
    requirementsBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    requirementsText: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: fontSize.sm,
        lineHeight: fontSize.sm * 1.4,
    },
    submitButton: {
        marginTop: spacing.md,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    footerLink: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.bold,
    },
});

export default ResetPasswordScreen;