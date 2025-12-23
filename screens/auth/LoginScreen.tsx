// screens/auth/LoginScreen.tsx
import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius, Fonts } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const LoginScreen = () => {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const { theme } = useTheme();

  const handleLogin = async (
    values: { email: string; password: string },
    { setSubmitting }: any
  ) => {
    try {
      await login(values.email, values.password);
      // Navigation handled by AuthContext
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
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
        <View style={styles.container}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.header }]}>
              Welcome Back! 👋
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
              Sign in to continue your journey
            </Text>
          </View>

          {/* Login Form */}
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View style={styles.formContainer}>
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  icon="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email ? errors.email : undefined}
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  icon="lock"
                  secureTextEntry
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={
                    touched.password && errors.password ? errors.password : undefined
                  }
                />

                {/* Forgot Password Link */}
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password' as any)}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={[styles.forgotPasswordText, { color: theme.primary, fontFamily: Fonts.body }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  onPress={() => handleSubmit()}
                  isLoading={isSubmitting}
                  style={styles.loginButton}
                />

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                  <Text style={[styles.dividerText, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                    OR
                  </Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                </View>

                {/* Sign Up Link */}
                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                    <Text style={[styles.footerLink, { color: theme.primary, fontFamily: Fonts.body }]}>
                      Sign Up
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
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    padding: spacing.xl,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 200,
    height: 120,
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
  },
  formContainer: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: fontSize.sm,
  },
  footerLink: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});

export default LoginScreen;