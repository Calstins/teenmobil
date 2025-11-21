// screens/auth/ProfileSetupScreen.tsx
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
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { borderRadius, fontSize, fontWeight, spacing, Fonts } from '../../theme';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { profileApi } from '../../api/profileApi';

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
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG'); // Default to Nigeria
  const [selectedCountryName, setSelectedCountryName] = useState('Nigeria');
  const [selectedState, setSelectedState] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationSet, setLocationSet] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [stateSearchQuery, setStateSearchQuery] = useState('');

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);

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
        // Update user in context with fresh data from API
        const updatedUser = { ...user, profilePhoto: photoUrl };
        // Store updated user data
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
  const requestAutoLocation = async () => {
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

        // Find matching country
        const matchedCountry = allCountries.find(
          c => c.name.toLowerCase() === detectedCountry.toLowerCase()
        );

        if (matchedCountry) {
          setSelectedCountryCode(matchedCountry.code);
          setSelectedCountryName(matchedCountry.name);

          // Find matching state
          const countryStates = State.getStatesOfCountry(matchedCountry.code);
          const matchedState = countryStates.find(
            s => s.name.toLowerCase() === detectedState.toLowerCase()
          );

          if (matchedState) {
            setSelectedState(matchedState.name);
          } else if (detectedState) {
            setSelectedState(detectedState);
          }

          await updateLocation(matchedState?.name || detectedState, matchedCountry.name);
          setLocationSet(true);
        }
      }
    } catch (error: any) {
      console.error('❌ Location error:', error);
      Alert.alert('Location Error', 'Could not detect your location. Please select manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedCountryName || !selectedState) {
      Alert.alert('Required', 'Please select both country and state/region');
      return;
    }

    await updateLocation(selectedState, selectedCountryName);
    setLocationSet(true);
  };

  const updateLocation = async (state: string, country: string) => {
    try {
      const response = await profileApi.updateProfile({
        state,
        country,
      });

      if (response.success && response.data) {
        // Update user in context with fresh data from API
        const updatedUser = { ...user!, state, country, needsProfileSetup: false };
        // Store updated user data
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        await refreshUser();
        console.log('✅ Location updated in backend');
      }
    } catch (error: any) {
      console.error('❌ Failed to update location:', error);
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
      // Mark profile setup as complete in AsyncStorage
      if (user) {
        const updatedUser = { ...user, needsProfileSetup: false };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        console.log('✅ Profile marked as complete');
      }

      // Refresh user data to trigger context update
      await refreshUser();

      // Small delay to ensure context updates
      await new Promise(resolve => setTimeout(resolve, 200));

      // Navigate to home with replace to prevent back navigation
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback navigation
      router.replace('/(tabs)/home');
    }
  };

  const handleSkip = () => {
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

  const renderCountryPicker = () => (
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

          {/* Search Input */}
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
                  selectedCountryCode === item.code && { backgroundColor: theme.primaryLight }
                ]}
                onPress={() => {
                  setSelectedCountryCode(item.code);
                  setSelectedCountryName(item.name);
                  setSelectedState(''); // Reset state when country changes
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
                {selectedCountryCode === item.code && (
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

  const renderStatePicker = () => (
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

          {/* Search Input */}
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
                  selectedState === item.name && { backgroundColor: theme.primaryLight }
                ]}
                onPress={() => {
                  setSelectedState(item.name);
                  setShowStatePicker(false);
                  setStateSearchQuery('');
                }}
              >
                <Text style={[styles.pickerItemText, { color: theme.text, fontFamily: Fonts.body }]}>
                  {item.name}
                </Text>
                {selectedState === item.name && (
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
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
              <Icon name="map-pin" size={64} color={theme.primary} />
            </View>

            {locationSet && (
              <View style={[styles.successBadge, { backgroundColor: theme.successLight }]}>
                <Icon name="check-circle" size={20} color={theme.success} />
                <Text style={[styles.successText, { color: theme.success, fontFamily: Fonts.body }]}>
                  Location saved: {selectedState}, {selectedCountryName}
                </Text>
              </View>
            )}

            <Text style={[styles.stepTitle, { color: theme.text, fontFamily: Fonts.header }]}>
              Your Location
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
              Help us customize your experience and connect you with teens in your area
            </Text>

            {/* Country Selector */}
            <TouchableOpacity
              style={[styles.locationInput, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              onPress={() => setShowCountryPicker(true)}
            >
              <Icon name="globe" size={20} color={theme.primary} />
              <Text style={[styles.locationInputText, { color: selectedCountryName ? theme.text : theme.textSecondary, fontFamily: Fonts.body }]}>
                {selectedCountryName || 'Select Country'}
              </Text>
              <Icon name="chevron-down" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* State Selector */}
            <TouchableOpacity
              style={[styles.locationInput, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              onPress={() => setShowStatePicker(true)}
              disabled={!selectedCountryCode}
            >
              <Icon name="map-pin" size={20} color={theme.primary} />
              <Text style={[styles.locationInputText, { color: selectedState ? theme.text : theme.textSecondary, fontFamily: Fonts.body }]}>
                {selectedState || (selectedCountryCode ? 'Select State/Region' : 'Select country first')}
              </Text>
              <Icon name="chevron-down" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {!locationSet ? (
              <>
                <Button
                  title="Save Location"
                  variant="primary"
                  style={styles.actionButton}
                  onPress={handleSaveLocation}
                  disabled={!selectedCountryName || !selectedState}
                />
                <Button
                  title={isLoadingLocation ? "Detecting..." : "Use Current Location"}
                  variant="outline"
                  style={styles.actionButton}
                  onPress={requestAutoLocation}
                  disabled={isLoadingLocation}
                  icon={isLoadingLocation ? <ActivityIndicator size="small" color={theme.primary} /> : undefined}
                />
              </>
            ) : (
              <Button
                title="Change Location"
                variant="outline"
                style={styles.actionButton}
                onPress={() => setLocationSet(false)}
              />
            )}

            <TouchableOpacity onPress={handleSkip}>
              <Text style={[styles.skipText, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
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
          disabled={isUploadingImage || isNavigating || isLoadingLocation || isEnablingNotifications}
        />
      </View>

      {renderCountryPicker()}
      {renderStatePicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
  },
  headerSubtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
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
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  locationInputText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: fontSize.base,
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