// src/screens/auth/LoginScreen.tsx
import React, { useContext } from 'react';
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
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useTheme } from '../../context/ThemeContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fontSize, fontWeight, spacing } from '../../theme';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Too short').required('Password is required'),
});

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const { theme } = useTheme();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardView, { backgroundColor: theme.background }]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Sign In</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Welcome back to TeenShapers!
          </Text>
        </View>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View>
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
                error={touched.password && errors.password ? errors.password : undefined}
              />

              <Button
                title="Sign In"
                onPress={() => handleSubmit()}
                isLoading={isSubmitting}
                style={styles.submitButton}
              />

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={[styles.footerLink, { color: theme.primary }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: spacing.lg,
  },
  header: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.base,
  },
  footerLink: {
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
});