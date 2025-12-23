// screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useTheme } from '../../context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius, Fonts } from '../../theme';
import { authApi } from '../../api/authApi';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
});

export const ForgotPasswordScreen = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const [emailSent, setEmailSent] = useState(false);

    const handleForgotPassword = async (values: { email: string }, { setSubmitting }: any) => {
        try {
            const response = await authApi.forgotPassword(values.email);

            if (response.success) {
                setEmailSent(true);
                Alert.alert(
                    'Email Sent! 📧',
                    'If an account exists with this email, you will receive password reset instructions.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            }
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.message || 'Failed to send reset email. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

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
                {/* Back Button */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.container}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                        <Icon name="lock" size={64} color={theme.primary} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.header }]}>
                            Forgot Password?
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            No worries! Enter your email and we'll send you reset instructions.
                        </Text>
                    </View>

                    {!emailSent ? (
                        <Formik
                            initialValues={{ email: '' }}
                            validationSchema={ForgotPasswordSchema}
                            onSubmit={handleForgotPassword}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                                <View style={styles.formContainer}>
                                    <Input
                                        label="Email"
                                        placeholder="Enter your email address"
                                        icon="mail"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={values.email}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        error={touched.email && errors.email ? errors.email : undefined}
                                    />

                                    <Button
                                        title="Send Reset Link"
                                        onPress={() => handleSubmit()}
                                        isLoading={isSubmitting}
                                        style={styles.submitButton}
                                    />

                                    <View style={styles.footer}>
                                        <Text style={[styles.footerText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                            Remember your password?{' '}
                                        </Text>
                                        <TouchableOpacity onPress={() => router.back()}>
                                            <Text style={[styles.footerLink, { color: theme.primary, fontFamily: Fonts.body }]}>
                                                Sign In
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    ) : (
                        <View style={styles.successContainer}>
                            <Icon name="check-circle" size={64} color={theme.success} />
                            <Text style={[styles.successTitle, { color: theme.text, fontFamily: Fonts.header }]}>
                                Check Your Email
                            </Text>
                            <Text style={[styles.successText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                We've sent password reset instructions to your email address.
                            </Text>
                            <Button
                                title="Back to Sign In"
                                onPress={() => router.back()}
                                variant="outline"
                                style={styles.backToLoginButton}
                            />
                        </View>
                    )}
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
        padding: spacing.lg,
        paddingTop: spacing.xxl,
    },
    backButton: {
        marginBottom: spacing.lg,
    },
    container: {
        flex: 1,
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
        fontSize: fontSize.base,
        textAlign: 'center',
        lineHeight: fontSize.base * 1.5,
        paddingHorizontal: spacing.md,
    },
    formContainer: {
        width: '100%',
    },
    submitButton: {
        marginTop: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.lg,
    },
    footerText: {
        fontSize: fontSize.sm,
    },
    footerLink: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    successTitle: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    successText: {
        fontSize: fontSize.base,
        textAlign: 'center',
        lineHeight: fontSize.base * 1.5,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    backToLoginButton: {
        marginTop: spacing.md,
        minWidth: 200,
    },
});

export default ForgotPasswordScreen;