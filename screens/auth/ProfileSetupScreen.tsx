// screens/auth/ProfileSetupScreen.tsx - Fixed Component
import { useRouter } from 'expo-router';
import React, { useState, useContext, useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Country, State } from 'country-state-city';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { borderRadius, fontSize, fontWeight, spacing, Fonts } from '../../theme';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { profileApi } from '../../api/profileApi';
import { SafeAreaView } from 'react-native-safe-area-context';

// Validation schema for location step
const LocationSchema = Yup.object().shape({
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State/Region is required'),
});

export const ProfileSetupScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, refreshUser } = useContext(AuthContext);
  const { registerForNotifications } = useNotifications();

  const [step, setStep] = useState(1);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Location state
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [stateSearchQuery, setStateSearchQuery] = useState('');

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);

  // Location form data
  const [locationData, setLocationData] = useState({
    country: 'Nigeria',
    state: '',
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

      await updateProfilePhoto(cloudinaryUrl);
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload image. You can try again or skip for now.',
        [
          { text: 'Skip for Now', onPress: () => setProfileImage(null) },
          { text: 'Try Again', onPress: () => uploadImage(imageUri) },
        ]
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const updateProfilePhoto = async (photoUrl: string) => {
    try {
      if (!user?.id) {
        throw new Error('User not found');
      }

      const response = await apiClient.patch('/teen/profile', {
        profilePhoto: photoUrl,
      });

      if (response.success && response.data) {
        const updatedUser = { ...user, profilePhoto: photoUrl };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        await refreshUser();
        console.log('✅ Profile photo updated in backend');
      }
    } catch (error: any) {
      console.error('❌ Failed to update profile photo:', error);
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

  // Location functions
  const requestAutoLocation = async (setFieldValue: any) => {
    try {
      setIsLoadingLocation(true);
      console.log('📍 Requesting location permissions...');

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect your location automatically.');
        setIsLoadingLocation(false);
        return;
      }

      console.log('🗺️ Getting current location...');
      const location = await Location.getCurrentPositionAsync({});

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const detectedCountry = address.country || 'Nigeria';
        const detectedState = address.region || address.city || '';

        const matchedCountry = allCountries.find(
          c => c.name.toLowerCase() === detectedCountry.toLowerCase()
        );

        if (matchedCountry) {
          setSelectedCountryCode(matchedCountry.code);
          setFieldValue('country', matchedCountry.name);

          const countryStates = State.getStatesOfCountry(matchedCountry.code);
          const matchedState = countryStates.find(
            s => s.name.toLowerCase() === detectedState.toLowerCase()
          );

          if (matchedState) {
            setFieldValue('state', matchedState.name);
          } else if (detectedState) {
            setFieldValue('state', detectedState);
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Location error:', error);
      Alert.alert('Location Error', 'Could not detect your location. Please select manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const updateLocation = async (state: string, country: string) => {
    try {
      const response = await profileApi.updateProfile({
        state,
        country,
      });

      if (response.success && response.data) {
        const updatedUser = { ...user!, state, country, needsProfileSetup: false };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        await refreshUser();
        console.log('✅ Location updated in backend');
      }
    } catch (error: any) {
      console.error('❌ Failed to update location:', error);
      throw error;
    }
  };

  // Notification functions
  const enableNotifications = async () => {
    try {
      setIsEnablingNotifications(true);
      console.log('🔔 Enabling notifications...');
      await registerForNotifications();
      setNotificationsEnabled(true);
    } catch (error: any) {
      console.error('❌ Notification error:', error);
      Alert.alert(
        'Notification Error',
        'Could not enable notifications. You can enable them later in settings.'
      );
    } finally {
      setIsEnablingNotifications(false);
    }
  };

  const navigateToHome = async () => {
    if (isNavigating) return;

    setIsNavigating(true);
    console.log('🏠 Navigating to home...');

    try {
      if (user) {
        const updatedUser = { ...user, needsProfileSetup: false };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        console.log('✅ Profile marked as complete');
      }

      await refreshUser();
      await new Promise(resolve => setTimeout(resolve, 200));
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      router.replace('/(tabs)/home');
    }
  };

  const handleSkip = () => {
    // Don't allow skipping location step (step 2) since country is required
    if (step === 2) {
      Alert.alert(
        'Location Required',
        'Please set your location to continue. You can use auto-detect or select manually.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      navigateToHome();
    }
  };

  const handleNext = () => {
    if (isNavigating) return;

    if (step < 3) {
      setStep(step + 1);
    } else {
      navigateToHome();
    }
  };

  const handleLocationSubmit = async (values: any) => {
    try {
      await updateLocation(values.state, values.country);
      setLocationData(values);
      setStep(3); // Move to next step
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save location. Please try again.');
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <View style={styles.stepContainer}>
              <TouchableOpacity
                style={[styles.imagePicker, { borderColor: theme.borderLight }]}
                onPress={handleImageUpload}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <View style={styles.imagePlaceholder}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.uploadingText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                      Uploading...
                    </Text>
                  </View>
                ) : profileImage ? (
                  <>
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    {profileImageUrl && (
                      <View style={[styles.uploadSuccessBadge, { backgroundColor: theme.success }]}>
                        <Icon name="check-circle" size={24} color="#fff" />
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                      <Icon name="camera" size={48} color={theme.primary} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              {profileImageUrl && (
                <Text style={[styles.uploadedText, { color: theme.success, fontFamily: Fonts.body }]}>
                  ✓ Photo uploaded successfully
                </Text>
              )}

              <Text style={[styles.stepTitle, { color: theme.text, fontFamily: Fonts.header }]}>
                Add a Profile Photo
              </Text>
              <Text style={[styles.stepDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                This helps your friends recognize you on the leaderboard and makes your profile more personal
              </Text>

              {!profileImageUrl && (
                <Button
                  title="Upload Photo"
                  variant="primary"
                  style={styles.actionButton}
                  onPress={handleImageUpload}
                  disabled={isUploadingImage}
                />
              )}

              {profileImageUrl && (
                <Button
                  title="Change Photo"
                  variant="outline"
                  style={styles.actionButton}
                  onPress={handleImageUpload}
                  disabled={isUploadingImage}
                />
              )}

              <TouchableOpacity onPress={handleSkip}>
                <Text style={[styles.skipText, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                  Skip for now
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        );

      case 2:
        return (
          <Formik
            initialValues={locationData}
            validationSchema={LocationSchema}
            onSubmit={handleLocationSubmit}
          >
            {(props) => (
              <View style={styles.stepContainer}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Icon name="map-pin" size={64} color={theme.primary} />
                </View>

                <Text style={[styles.stepTitle, { color: theme.text, fontFamily: Fonts.header }]}>
                  Your Location
                </Text>
                <Text style={[styles.stepDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                  Help us customize your experience and connect you with teens in your area
                </Text>
                <Text style={[styles.requiredNote, { color: theme.error, fontFamily: Fonts.body }]}>
                  * Country and State are required
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
                    {props.values.country || 'Select Country *'}
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
                    {props.values.state || (props.values.country ? 'Select State/Region *' : 'Select country first')}
                  </Text>
                  <Icon name="chevron-down" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
                {props.touched.state && props.errors.state && (
                  <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
                    {props.errors.state}
                  </Text>
                )}

                <Button
                  title="Save Location"
                  variant="primary"
                  style={styles.actionButton}
                  onPress={() => props.handleSubmit()}
                  isLoading={props.isSubmitting}
                  disabled={!props.values.country || !props.values.state}
                />
                
                <Button
                  title={isLoadingLocation ? "Detecting..." : "Use Current Location"}
                  variant="outline"
                  style={styles.actionButton}
                  onPress={() => requestAutoLocation(props.setFieldValue)}
                  disabled={isLoadingLocation}
                  icon={isLoadingLocation ? <ActivityIndicator size="small" color={theme.primary} /> : undefined}
                />

                {renderCountryPicker(props)}
                {renderStatePicker(props)}
              </View>
            )}
          </Formik>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
              <Icon name="bell" size={64} color={theme.primary} />
            </View>

            {notificationsEnabled && (
              <View style={[styles.successBadge, { backgroundColor: theme.successLight }]}>
                <Icon name="check-circle" size={20} color={theme.success} />
                <Text style={[styles.successText, { color: theme.success, fontFamily: Fonts.body }]}>
                  Notifications enabled
                </Text>
              </View>
            )}

            <Text style={[styles.stepTitle, { color: theme.text, fontFamily: Fonts.header }]}>
              Stay Updated
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
              Get notified about new challenges, badges, achievements, and when your friends complete tasks
            </Text>

            {!notificationsEnabled ? (
              <Button
                title={isEnablingNotifications ? "Enabling..." : "Enable Notifications"}
                variant="primary"
                style={styles.actionButton}
                onPress={enableNotifications}
                disabled={isEnablingNotifications}
              />
            ) : (
              <View style={[styles.notificationInfo, { backgroundColor: theme.primaryLight }]}>
                <Icon name="info" size={16} color={theme.primary} />
                <Text style={[styles.notificationInfoText, { color: theme.primary, fontFamily: Fonts.body }]}>
                  You'll receive notifications for new challenges, submission reviews, badges earned, and challenge reminders
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={handleSkip}>
              <Text style={[styles.skipText, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.textInverse, fontFamily: Fonts.header }]}>
          Profile Setup
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.primaryLight, fontFamily: Fonts.body }]}>
          Step {step} of 3
        </Text>
      </View>

      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.progressBar,
              {
                backgroundColor: s <= step ? theme.primary : theme.backgroundSecondary,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title={step === 3 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          disabled={isUploadingImage || isNavigating || isLoadingLocation || isEnablingNotifications || step === 2}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,   
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
  },
  headerSubtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
    paddingBottom: spacing.md
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    padding: spacing.xl,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  imagePicker: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.md,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  uploadSuccessBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderRadius: 20,
    padding: 6,
  },
  uploadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
  },
  uploadedText: {
    marginBottom: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  successText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  stepTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  stepDescription: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.5,
  },
  requiredNote: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: fontWeight.semibold,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  locationInputText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: fontSize.base,
  },
  errorText: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    width: '100%',
    maxWidth: 320,
    textAlign: 'left',
  },
  actionButton: {
    marginBottom: spacing.md,
    width: 256,
  },
  skipText: {
    fontSize: fontSize.base,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    maxWidth: 320,
  },
  notificationInfoText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
  },
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
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