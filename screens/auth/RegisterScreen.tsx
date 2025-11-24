// screens/auth/RegisterScreen.tsx
import React, { useContext, useState, useMemo } from 'react';
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
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { Country, State } from 'country-state-city';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useTheme } from '../../context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius, Fonts } from '../../theme';
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
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State/Region is required'),
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

  // Location pickers state
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG'); // Default to Nigeria

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: '',
    country: 'Nigeria',
    parentEmail: '',
    agreedToTerms: false,
    parentalConsent: false,
  });

  // Get all countries
  const allCountries = useMemo(() => {
    return Country.getAllCountries().map(country => ({
      code: country.isoCode,
      name: country.name,
      flag: country.flag,
    }));
  }, []);

  // Get states for selected country
  const statesForSelectedCountry = useMemo(() => {
    if (!selectedCountryCode) return [];
    const states = State.getStatesOfCountry(selectedCountryCode);
    return states.map(state => ({
      code: state.isoCode,
      name: state.name,
    }));
  }, [selectedCountryCode]);

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return allCountries;
    return allCountries.filter(country =>
      country.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );
  }, [allCountries, countrySearchQuery]);

  // Filtered states based on search
  const filteredStates = useMemo(() => {
    if (!stateSearchQuery.trim()) return statesForSelectedCountry;
    return statesForSelectedCountry.filter(state =>
      state.name.toLowerCase().includes(stateSearchQuery.toLowerCase())
    );
  }, [statesForSelectedCountry, stateSearchQuery]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
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
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);
      console.log('📤 Uploading image to Cloudinary...');

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

  const renderCountryPicker = (props: any) => (
    <Modal
      visible={showCountryPicker}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setShowCountryPicker(false);
        setCountrySearchQuery('');
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: Fonts.header }]}>
              Select Country
            </Text>
            <TouchableOpacity onPress={() => {
              setShowCountryPicker(false);
              setCountrySearchQuery('');
            }}>
              <Icon name="x" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Icon name="search" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text, fontFamily: Fonts.body }]}
              placeholder="Search countries..."
              placeholderTextColor={theme.textTertiary}
              value={countrySearchQuery}
              onChangeText={setCountrySearchQuery}
              autoCorrect={false}
            />
            {countrySearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setCountrySearchQuery('')}>
                <Icon name="x-circle" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  { borderBottomColor: theme.borderLight },
                  props.values.country === item.name && { backgroundColor: theme.primaryLight }
                ]}
                onPress={() => {
                  setSelectedCountryCode(item.code);
                  props.setFieldValue('country', item.name);
                  props.setFieldValue('state', ''); // Reset state when country changes
                  setFormData({ ...formData, country: item.name, state: '' });
                  setShowCountryPicker(false);
                  setCountrySearchQuery('');
                }}
              >
                <View style={styles.countryRow}>
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={[styles.pickerItemText, { color: theme.text, fontFamily: Fonts.body }]}>
                    {item.name}
                  </Text>
                </View>
                {props.values.country === item.name && (
                  <Icon name="check" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                  No countries found
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );

  const renderStatePicker = (props: any) => (
    <Modal
      visible={showStatePicker}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setShowStatePicker(false);
        setStateSearchQuery('');
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: Fonts.header }]}>
              Select State/Region
            </Text>
            <TouchableOpacity onPress={() => {
              setShowStatePicker(false);
              setStateSearchQuery('');
            }}>
              <Icon name="x" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Icon name="search" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text, fontFamily: Fonts.body }]}
              placeholder="Search states..."
              placeholderTextColor={theme.textTertiary}
              value={stateSearchQuery}
              onChangeText={setStateSearchQuery}
              autoCorrect={false}
            />
            {stateSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setStateSearchQuery('')}>
                <Icon name="x-circle" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredStates}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  { borderBottomColor: theme.borderLight },
                  props.values.state === item.name && { backgroundColor: theme.primaryLight }
                ]}
                onPress={() => {
                  props.setFieldValue('state', item.name);
                  setFormData({ ...formData, state: item.name });
                  setShowStatePicker(false);
                  setStateSearchQuery('');
                }}
              >
                <Text style={[styles.pickerItemText, { color: theme.text, fontFamily: Fonts.body }]}>
                  {item.name}
                </Text>
                {props.values.state === item.name && (
                  <Icon name="check" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                  {stateSearchQuery ? 'No states found' : 'No states available for this country'}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );

  const renderStep1 = (props: any) => (
    <View>
      {/* Profile Image Upload */}
      <View style={styles.imageSection}>
        <Text style={[styles.imageLabel, { color: theme.text, fontFamily: Fonts.body }]}>
          Profile Photo (Optional)
        </Text>
        <TouchableOpacity
          style={[styles.imagePicker, { borderColor: theme.borderLight }]}
          onPress={handleImageUpload}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.imageText, { color: theme.textSecondary, marginTop: spacing.sm, fontFamily: Fonts.body }]}>
                Uploading...
              </Text>
            </View>
          ) : profileImage ? (
            <>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
              {profileImageUrl && (
                <View style={[styles.uploadSuccessBadge, { backgroundColor: theme.success }]}>
                  <Icon name="check-circle" size={20} color="#fff" />
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="camera" size={32} color={theme.textTertiary} />
              <Text style={[styles.imageText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Add Photo
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {profileImageUrl && (
          <Text style={[styles.uploadedText, { color: theme.success, fontFamily: Fonts.body }]}>
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
        <Text style={[styles.label, { color: theme.text, fontFamily: Fonts.body }]}>Gender *</Text>
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
                {
                  color: props.values.gender === 'Male' ? '#fff' : theme.textSecondary,
                  fontFamily: Fonts.body
                },
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
                {
                  color: props.values.gender === 'Female' ? '#fff' : theme.textSecondary,
                  fontFamily: Fonts.body
                },
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>
        {props.touched.gender && props.errors.gender && (
          <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
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

      {/* Location Selection */}
      <View style={styles.locationSection}>
        <Text style={[styles.label, { color: theme.text, fontFamily: Fonts.body }]}>
          Location *
        </Text>

        {/* Country Selector */}
        <TouchableOpacity
          style={[
            styles.locationInput,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: props.touched.country && props.errors.country ? theme.error : theme.border
            }
          ]}
          onPress={() => setShowCountryPicker(true)}
        >
          <Icon name="globe" size={20} color={theme.primary} />
          <Text style={[
            styles.locationInputText,
            {
              color: props.values.country ? theme.text : theme.textSecondary,
              fontFamily: Fonts.body
            }
          ]}>
            {props.values.country || 'Select Country'}
          </Text>
          <Icon name="chevron-down" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
        {props.touched.country && props.errors.country && (
          <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
            {props.errors.country}
          </Text>
        )}

        {/* State Selector */}
        <TouchableOpacity
          style={[
            styles.locationInput,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: props.touched.state && props.errors.state ? theme.error : theme.border
            }
          ]}
          onPress={() => setShowStatePicker(true)}
          disabled={!props.values.country}
        >
          <Icon name="map-pin" size={20} color={theme.primary} />
          <Text style={[
            styles.locationInputText,
            {
              color: props.values.state ? theme.text : theme.textSecondary,
              fontFamily: Fonts.body
            }
          ]}>
            {props.values.state || (props.values.country ? 'Select State/Region' : 'Select country first')}
          </Text>
          <Icon name="chevron-down" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
        {props.touched.state && props.errors.state && (
          <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
            {props.errors.state}
          </Text>
        )}
      </View>
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
        <Text style={[styles.checkboxLabel, { color: theme.text, fontFamily: Fonts.body }]}>
          I agree to the{' '}
          <Text style={{ color: theme.primary, fontWeight: fontWeight.bold }}>
            Terms & Conditions
          </Text>
        </Text>
      </TouchableOpacity>
      {props.touched.agreedToTerms && props.errors.agreedToTerms && (
        <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
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
        <Text style={[styles.checkboxLabel, { color: theme.text, fontFamily: Fonts.body }]}>
          I confirm that I have parental/guardian consent to use this app (required for users under 18)
        </Text>
      </TouchableOpacity>
      {props.touched.parentalConsent && props.errors.parentalConsent && (
        <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
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
          <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.header }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
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

              {/* Render Modals */}
              {currentStep === 2 && (
                <>
                  {renderCountryPicker(props)}
                  {renderStatePicker(props)}
                </>
              )}
            </View>
          )}
        </Formik>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.footerLink, { color: theme.primary, fontFamily: Fonts.body }]}>
              Sign In
            </Text>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.sm,
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
    marginBottom: spacing.md,
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
  imageText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  uploadSuccessBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    borderRadius: 15,
    padding: 4,
  },
  uploadedText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  genderSection: {
    marginBottom: spacing.lg,
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    gap: spacing.sm,
  },
  genderText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  locationSection: {
    marginBottom: spacing.lg,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  locationInputText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: fontSize.base,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
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
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.base,
  },
  footerLink: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.base,
    paddingVertical: spacing.xs,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: fontSize.base,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    fontSize: fontSize.xl,
    marginRight: spacing.sm,
  },
  emptyList: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.base,
  },
});