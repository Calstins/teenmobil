// screens/auth/RegisterScreen.tsx
// Multi-step registration with direct Cloudinary upload (NO BASE64)
import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useTheme } from '../../context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';

// Validation schemas for each step
const Step1Schema = Yup.object().shape({
  name: Yup.string().min(2, 'Too short').required('Name is required'),
  age: Yup.number().min(13, 'Must be 13+').max(19, 'Must be under 20').required('Age is required'),
  gender: Yup.string().required('Gender is required'),
});

const Step2Schema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm password'),
});

const Step3Schema = Yup.object().shape({
  parentEmail: Yup.string().email('Invalid email'),
  agreedToTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the terms and conditions')
    .required('Required'),
  parentalConsent: Yup.boolean()
    .oneOf([true], 'Parental consent is required for users under 18')
    .required('Required'),
});

export const RegisterScreen = () => {
  const router = useRouter();
  const { register } = useContext(AuthContext);
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: '',
    country: '',
    parentEmail: '',
    agreedToTerms: false,
    parentalConsent: false,
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // Upload immediately after selection
      uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera permissions to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // Upload immediately after taking photo
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);
      console.log('📤 Uploading image to Cloudinary...');
      
      // Direct upload to Cloudinary (NO BASE64 CONVERSION!)
      const cloudinaryUrl = await uploadImageToCloudinary(imageUri);
      
      setProfileImageUrl(cloudinaryUrl);
      console.log('✅ Image uploaded successfully:', cloudinaryUrl);
      
      Alert.alert('Success', 'Profile photo uploaded!');
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload image. You can continue without a photo or try again.',
        [
          { text: 'Continue Without Photo', onPress: () => setProfileImage(null) },
          { text: 'Try Again', onPress: () => uploadImage(imageUri) },
        ]
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = () => {
    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleNextStep = (values: any) => {
    setFormData({ ...formData, ...values });
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async (values: any, formikBag: any) => {
    try {
      const finalData = { ...formData, ...values };
      
      // Register with Cloudinary URL (NOT base64!)
      await register({
        email: finalData.email,
        password: finalData.password,
        name: finalData.name,
        age: parseInt(finalData.age, 10),
        gender: finalData.gender,
        state: finalData.state,
        country: finalData.country,
        parentEmail: finalData.parentEmail,
        profilePhotoUrl: profileImageUrl ?? undefined, 
      });
      
      // Navigation happens in AuthContext
    } catch (error: any) {
      formikBag.setSubmitting(false);
      Alert.alert('Registration Failed', error.message || 'Please try again');
    }
  };

  const getValidationSchema = () => {
    switch (currentStep) {
      case 1:
        return Step1Schema;
      case 2:
        return Step2Schema;
      case 3:
        return Step3Schema;
      default:
        return Step1Schema;
    }
  };

  const renderStep1 = (props: any) => (
    <View>
      {/* Profile Image Upload */}
      <View style={styles.imageSection}>
        <Text style={[styles.imageLabel, { color: theme.text }]}>Profile Photo</Text>
        <TouchableOpacity
          style={[styles.imagePicker, { borderColor: theme.borderLight }]}
          onPress={handleImageUpload}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.imageText, { color: theme.textSecondary, marginTop: spacing.sm }]}>
                Uploading...
              </Text>
            </View>
          ) : profileImage ? (
            <>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
              {profileImageUrl && (
                <View style={styles.uploadSuccessBadge}>
                  <Icon name="check-circle" size={20} color="#fff" />
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="camera" size={32} color={theme.textTertiary} />
              <Text style={[styles.imageText, { color: theme.textSecondary }]}>
                Add Photo
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {profileImageUrl && (
          <Text style={[styles.uploadedText, { color: theme.success }]}>
            ✓ Photo uploaded successfully
          </Text>
        )}
      </View>

      <Input
        label="Full Name"
        placeholder="Enter your full name"
        icon="user"
        value={props.values.name}
        onChangeText={props.handleChange('name')}
        onBlur={props.handleBlur('name')}
        error={props.touched.name && props.errors.name ? props.errors.name : undefined}
      />

      <Input
        label="Age"
        placeholder="Enter your age"
        icon="calendar"
        keyboardType="numeric"
        value={props.values.age}
        onChangeText={props.handleChange('age')}
        onBlur={props.handleBlur('age')}
        error={props.touched.age && props.errors.age ? props.errors.age : undefined}
      />

      {/* Gender Selection */}
      <View style={styles.genderSection}>
        <Text style={[styles.label, { color: theme.text }]}>Gender *</Text>
        <View style={styles.genderOptions}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              {
                backgroundColor: props.values.gender === 'Male' ? theme.primary : theme.backgroundSecondary,
                borderColor: props.values.gender === 'Male' ? theme.primary : theme.borderLight,
              },
            ]}
            onPress={() => props.setFieldValue('gender', 'Male')}
          >
            <Icon
              name="user"
              size={24}
              color={props.values.gender === 'Male' ? '#fff' : theme.textSecondary}
            />
            <Text
              style={[
                styles.genderText,
                { color: props.values.gender === 'Male' ? '#fff' : theme.textSecondary },
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              {
                backgroundColor: props.values.gender === 'Female' ? theme.primary : theme.backgroundSecondary,
                borderColor: props.values.gender === 'Female' ? theme.primary : theme.borderLight,
              },
            ]}
            onPress={() => props.setFieldValue('gender', 'Female')}
          >
            <Icon
              name="user"
              size={24}
              color={props.values.gender === 'Female' ? '#fff' : theme.textSecondary}
            />
            <Text
              style={[
                styles.genderText,
                { color: props.values.gender === 'Female' ? '#fff' : theme.textSecondary },
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>
        {props.touched.gender && props.errors.gender && (
          <Text style={[styles.errorText, { color: theme.error }]}>
            {props.errors.gender}
          </Text>
        )}
      </View>
    </View>
  );

  const renderStep2 = (props: any) => (
    <View>
      <Input
        label="Email"
        placeholder="Enter your email"
        icon="mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={props.values.email}
        onChangeText={props.handleChange('email')}
        onBlur={props.handleBlur('email')}
        error={props.touched.email && props.errors.email ? props.errors.email : undefined}
      />

      <Input
        label="Password"
        placeholder="Create a password"
        icon="lock"
        secureTextEntry
        value={props.values.password}
        onChangeText={props.handleChange('password')}
        onBlur={props.handleBlur('password')}
        error={props.touched.password && props.errors.password ? props.errors.password : undefined}
      />

      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        icon="lock"
        secureTextEntry
        value={props.values.confirmPassword}
        onChangeText={props.handleChange('confirmPassword')}
        onBlur={props.handleBlur('confirmPassword')}
        error={
          props.touched.confirmPassword && props.errors.confirmPassword
            ? props.errors.confirmPassword
            : undefined
        }
      />

      <Input
        label="Location (Optional)"
        placeholder="City, State or Country"
        icon="map-pin"
        value={props.values.state}
        onChangeText={props.handleChange('state')}
        onBlur={props.handleBlur('state')}
      />
    </View>
  );

  const renderStep3 = (props: any) => (
    <View>
      <Input
        label="Parent/Guardian Email (Optional)"
        placeholder="Parent or guardian email"
        icon="mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={props.values.parentEmail}
        onChangeText={props.handleChange('parentEmail')}
        onBlur={props.handleBlur('parentEmail')}
        error={
          props.touched.parentEmail && props.errors.parentEmail
            ? props.errors.parentEmail
            : undefined
        }
      />

      {/* Terms and Conditions */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => props.setFieldValue('agreedToTerms', !props.values.agreedToTerms)}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: props.values.agreedToTerms ? theme.primary : theme.borderLight,
              backgroundColor: props.values.agreedToTerms ? theme.primary : 'transparent',
            },
          ]}
        >
          {props.values.agreedToTerms && <Icon name="check" size={16} color="#fff" />}
        </View>
        <Text style={[styles.checkboxLabel, { color: theme.text }]}>
          I agree to the{' '}
          <Text style={{ color: theme.primary, fontWeight: fontWeight.semibold }}>
            Terms & Conditions
          </Text>
        </Text>
      </TouchableOpacity>
      {props.touched.agreedToTerms && props.errors.agreedToTerms && (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {props.errors.agreedToTerms}
        </Text>
      )}

      {/* Parental Consent */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => props.setFieldValue('parentalConsent', !props.values.parentalConsent)}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: props.values.parentalConsent ? theme.primary : theme.borderLight,
              backgroundColor: props.values.parentalConsent ? theme.primary : 'transparent',
            },
          ]}
        >
          {props.values.parentalConsent && <Icon name="check" size={16} color="#fff" />}
        </View>
        <Text style={[styles.checkboxLabel, { color: theme.text }]}>
          I confirm that I have parental/guardian consent to use this app (required for users under 18)
        </Text>
      </TouchableOpacity>
      {props.touched.parentalConsent && props.errors.parentalConsent && (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {props.errors.parentalConsent}
        </Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardView, { backgroundColor: theme.background }]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Step {currentStep} of 3
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((step) => (
            <View
              key={step}
              style={[
                styles.progressBar,
                {
                  backgroundColor: step <= currentStep ? theme.primary : theme.backgroundSecondary,
                },
              ]}
            />
          ))}
        </View>

        {/* Form */}
        <Formik
          initialValues={formData}
          validationSchema={getValidationSchema()}
          onSubmit={currentStep === 3 ? handleRegister : handleNextStep}
          enableReinitialize
        >
          {(props) => (
            <View>
              {currentStep === 1 && renderStep1(props)}
              {currentStep === 2 && renderStep2(props)}
              {currentStep === 3 && renderStep3(props)}

              <View style={styles.buttonContainer}>
                {currentStep > 1 && (
                  <Button
                    title="Back"
                    onPress={handlePreviousStep}
                    variant="outline"
                    style={styles.button}
                    disabled={isUploadingImage}
                  />
                )}
                <Button
                  title={currentStep === 3 ? 'Sign Up' : 'Next'}
                  onPress={() => props.handleSubmit()}
                  isLoading={props.isSubmitting}
                  disabled={isUploadingImage}
                  style={[styles.button, currentStep === 1 && styles.fullButton]}
                />
              </View>
            </View>
          )}
        </Formik>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.footerLink, { color: theme.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: borderRadius.full,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  imageLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imageText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
  },
  uploadSuccessBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#10b981',
    borderRadius: 15,
    padding: 4,
  },
  uploadedText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  genderSection: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  genderText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  errorText: {
    fontSize: fontSize.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
  },
  fullButton: {
    flex: 1,
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

export default RegisterScreen;