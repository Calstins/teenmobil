// src/screens/auth/RegisterScreen.tsx
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
import { AuthContext } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { useTheme } from '../../../context/ThemeContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fontSize, fontWeight, spacing } from '../../../theme';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too short').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Too short').required('Password is required'),
  age: Yup.number().min(13, 'Must be 13+').max(19, 'Must be under 20').required('Age is required'),
  gender: Yup.string(),
  state: Yup.string(),
  country: Yup.string(),
  parentEmail: Yup.string().email('Invalid email'),
});

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const { theme } = useTheme();

  const handleRegister = async (values: any) => {
    try {
      await register({
        ...values,
        age: parseInt(values.age),
      });
      navigation.navigate('ProfileSetup');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardView, { backgroundColor: theme.background }]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Sign Up</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Join the TeenShapers community!
          </Text>
        </View>

        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            age: '',
            gender: '',
            state: '',
            country: '',
            parentEmail: '',
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View>
              <Input
                label="Name"
                placeholder="Enter your name"
                icon="user"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                error={touched.name && errors.name ? errors.name : undefined}
              />

              <Input
                label="Age"
                placeholder="Enter your age"
                icon="calendar"
                keyboardType="numeric"
                value={values.age}
                onChangeText={handleChange('age')}
                onBlur={handleBlur('age')}
                error={touched.age && errors.age ? errors.age : undefined}
              />

              <Input
                label="Gender (Optional)"
                placeholder="Enter your gender"
                icon="users"
                value={values.gender}
                onChangeText={handleChange('gender')}
                onBlur={handleBlur('gender')}
              />

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
                placeholder="Create a password"
                icon="lock"
                secureTextEntry
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && errors.password ? errors.password : undefined}
              />

              <Input
                label="State/Country (Optional)"
                placeholder="Enter your location"
                icon="map-pin"
                value={values.state}
                onChangeText={handleChange('state')}
                onBlur={handleBlur('state')}
              />

              <Input
                label="Parent Email (Optional)"
                placeholder="Parent/guardian email"
                icon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={values.parentEmail}
                onChangeText={handleChange('parentEmail')}
                onBlur={handleBlur('parentEmail')}
                error={touched.parentEmail && errors.parentEmail ? errors.parentEmail : undefined}
              />

              <Button
                title="Sign Up"
                  onPress={() => handleSubmit()}
                isLoading={isSubmitting}
                style={styles.submitButton}
              />

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={[styles.footerLink, { color: theme.primary }]}>Sign In</Text>
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