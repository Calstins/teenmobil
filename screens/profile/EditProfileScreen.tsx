// src/screens/profile/EditProfileScreen.tsx 
import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Image,
    ActivityIndicator,
    Modal,
    FlatList,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Country, State } from 'country-state-city';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { profileApi } from '../../api/profileApi';
import type { Teen } from '../../types';
import { spacing, fontSize, fontWeight, borderRadius, Fonts } from '../../theme';
import {
    validateAgeWithMessage,
    validateGenderWithMessage,
    validateNameWithMessage,
    sanitizeAgeInput,
    GENDER_OPTIONS,
    getAgeValidationMessage,
} from '../../utils/validation';

interface FormErrors {
    name?: string;
    age?: string;
    gender?: string;
    country?: string;
    state?: string;
    parentEmail?: string;
}

export const EditProfileScreen: React.FC = () => {
    const router = useRouter();
    const { user, updateUser } = useContext(AuthContext);
    const { theme } = useTheme();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedCountryName, setSelectedCountryName] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    // Validation errors
    const [errors, setErrors] = useState<FormErrors>({});

    // Picker states
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showStatePicker, setShowStatePicker] = useState(false);
    const [countrySearchQuery, setCountrySearchQuery] = useState('');
    const [stateSearchQuery, setStateSearchQuery] = useState('');

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

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await profileApi.getProfile();
            if (response.success && response.data) {
                const profile: Teen = response.data;
                setName(profile.name || '');
                setAge(profile.age?.toString() || '');
                setGender(profile.gender || '');
                setSelectedState(profile.state || '');
                setParentEmail(profile.parentEmail || '');
                setProfilePhoto(profile.profilePhoto || null);

                // Set country
                if (profile.country) {
                    const countryName = profile.country.toLowerCase();
                    const matchedCountry = allCountries.find(
                        c => c.name.toLowerCase() === countryName
                    );
                    if (matchedCountry) {
                        setSelectedCountryCode(matchedCountry.code);
                        setSelectedCountryName(matchedCountry.name);
                    } else {
                        setSelectedCountryName(profile.country);
                    }
                }
            }
        } catch (error: any) {
            console.error('Fetch profile error:', error);
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle age input with sanitization
     */
    const handleAgeChange = (text: string) => {
        const sanitized = sanitizeAgeInput(text);
        setAge(sanitized);

        if (errors.age) {
            setErrors({ ...errors, age: undefined });
        }
    };

    /**
     * Handle gender selection
     */
    const handleGenderSelect = (selectedGender: string) => {
        setGender(selectedGender);

        if (errors.gender) {
            setErrors({ ...errors, gender: undefined });
        }
    };

    /**
     * Handle name change
     */
    const handleNameChange = (text: string) => {
        setName(text);

        if (errors.name) {
            setErrors({ ...errors, name: undefined });
        }
    };

    /**
     * Handle parent email change
     */
    const handleParentEmailChange = (text: string) => {
        setParentEmail(text);

        if (errors.parentEmail) {
            setErrors({ ...errors, parentEmail: undefined });
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant camera roll permissions to upload a profile photo.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setIsUploadingPhoto(true);
                const imageUri = result.assets[0].uri;
                setProfilePhoto(imageUri);
                Alert.alert('Success', 'Profile photo updated! Remember to save changes.');
                setIsUploadingPhoto(false);
            }
        } catch (error: any) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
            setIsUploadingPhoto(false);
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant camera permissions to take a photo.'
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setIsUploadingPhoto(true);
                const imageUri = result.assets[0].uri;
                setProfilePhoto(imageUri);
                Alert.alert('Success', 'Profile photo updated! Remember to save changes.');
                setIsUploadingPhoto(false);
            }
        } catch (error: any) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
            setIsUploadingPhoto(false);
        }
    };

    const showPhotoOptions = () => {
        Alert.alert(
            'Profile Photo',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: takePhoto },
                { text: 'Choose from Library', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    /**
     * ✅ UPDATED: Validate form with required country & state
     */
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Validate name
        const nameValidation = validateNameWithMessage(name);
        if (!nameValidation.isValid) {
            newErrors.name = nameValidation.error;
        }

        // Validate age (REQUIRED - 13-19)
        const ageValidation = validateAgeWithMessage(age);
        if (!ageValidation.isValid) {
            newErrors.age = ageValidation.error;
        }

        // Validate gender (REQUIRED - Male/Female)
        const genderValidation = validateGenderWithMessage(gender);
        if (!genderValidation.isValid) {
            newErrors.gender = genderValidation.error;
        }

        // ✅ NEW: Validate country (REQUIRED)
        if (!selectedCountryName || !selectedCountryName.trim()) {
            newErrors.country = 'Country is required';
        }

        // ✅ NEW: Validate state (REQUIRED)
        if (!selectedState || !selectedState.trim()) {
            newErrors.state = 'State/Region is required';
        }

        // Validate parent email if provided
        if (parentEmail && !/\S+@\S+\.\S+/.test(parentEmail)) {
            newErrors.parentEmail = 'Please enter a valid parent email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fix the errors in the form');
            return;
        }

        try {
            setIsSaving(true);

            const updateData = {
                name: name.trim(),
                age: Number(age),
                gender: gender.trim(),
                state: selectedState.trim(), // ✅ UPDATED: Now required, no undefined
                country: selectedCountryName.trim(), // ✅ UPDATED: Now required, no undefined
                parentEmail: parentEmail.trim() || undefined,
                profilePhoto: profilePhoto || undefined,
            };

            const response = await profileApi.updateProfile(updateData);

            if (response.success) {
                if (updateUser && response.data) {
                    updateUser(response.data);
                }

                Alert.alert(
                    'Success',
                    'Profile updated successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to update profile. Please try again.'
            );
        } finally {
            setIsSaving(false);
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
                                    setSelectedState('');
                                    setShowCountryPicker(false);
                                    setCountrySearchQuery('');
                                    // Clear country/state errors when selecting
                                    if (errors.country) {
                                        setErrors({ ...errors, country: undefined, state: undefined });
                                    }
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
                                    // Clear state error when selecting
                                    if (errors.state) {
                                        setErrors({ ...errors, state: undefined });
                                    }
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

    if (isLoading) {
        return <Loading message="Loading profile..." />;
    }

    return (
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Icon name="arrow-left" size={24} color={theme.textInverse} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textInverse, fontFamily: Fonts.header }]}>
                    Edit Profile
                </Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Photo Section */}
                <Card style={styles.photoCard}>
                    <View style={styles.photoSection}>
                        <TouchableOpacity
                            style={styles.photoContainer}
                            onPress={showPhotoOptions}
                            disabled={isUploadingPhoto}
                        >
                            {isUploadingPhoto ? (
                                <View style={[styles.photoPlaceholder, { backgroundColor: theme.primaryLight }]}>
                                    <ActivityIndicator size="large" color={theme.primary} />
                                </View>
                            ) : profilePhoto ? (
                                <Image source={{ uri: profilePhoto }} style={styles.photo} />
                            ) : (
                                <View style={[styles.photoPlaceholder, { backgroundColor: theme.primaryLight }]}>
                                    <Icon name="user" size={48} color={theme.primary} />
                                </View>
                            )}
                            <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                                <Icon name="camera" size={16} color={theme.textInverse} />
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.photoHint, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Tap to change profile photo
                        </Text>
                    </View>
                </Card>

                {/* Personal Information */}
                <Card style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.header }]}>
                        Personal Information
                    </Text>

                    {/* Name Input */}
                    <View style={styles.fieldContainer}>
                        <Input
                            label="Full Name"
                            value={name}
                            onChangeText={handleNameChange}
                            placeholder="Enter your full name"
                            icon="user"
                            error={errors.name}
                        />
                    </View>

                    {/* Age Input */}
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.label, { color: theme.text, fontFamily: Fonts.body }]}>
                            Age <Text style={{ color: theme.error }}>*</Text>
                        </Text>
                        <View style={[styles.inputWrapper, { borderColor: errors.age ? theme.error : theme.border }]}>
                            <Icon name="calendar" size={20} color={theme.primary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.textInput, { color: theme.text, fontFamily: Fonts.body }]}
                                value={age}
                                onChangeText={handleAgeChange}
                                placeholder="13-19"
                                placeholderTextColor={theme.textTertiary}
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                        </View>
                        <Text style={[styles.hintText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            <Icon name="info" size={12} color={theme.textSecondary} /> {getAgeValidationMessage()}
                        </Text>
                        {errors.age && (
                            <View style={styles.errorContainer}>
                                <Icon name="alert-circle" size={14} color={theme.error} />
                                <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
                                    {errors.age}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Gender Selection */}
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.label, { color: theme.text, fontFamily: Fonts.body }]}>
                            Gender <Text style={{ color: theme.error }}>*</Text>
                        </Text>
                        <View style={styles.genderContainer}>
                            {GENDER_OPTIONS.map((option: { value: string; label: string; icon: string }) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.genderOption,
                                        {
                                            backgroundColor: gender === option.value
                                                ? theme.primaryLight
                                                : theme.backgroundSecondary,
                                            borderColor: gender === option.value
                                                ? theme.primary
                                                : errors.gender
                                                    ? theme.error
                                                    : theme.border,
                                        },
                                    ]}
                                    onPress={() => handleGenderSelect(option.value)}
                                    activeOpacity={0.7}
                                >
                                    <Icon
                                        name={option.icon}
                                        size={24}
                                        color={gender === option.value ? theme.primary : theme.textSecondary}
                                    />
                                    <Text
                                        style={[
                                            styles.genderLabel,
                                            {
                                                color: gender === option.value ? theme.primary : theme.text,
                                                fontFamily: Fonts.body,
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {gender === option.value && (
                                        <Icon name="check-circle" size={20} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.gender && (
                            <View style={styles.errorContainer}>
                                <Icon name="alert-circle" size={14} color={theme.error} />
                                <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
                                    {errors.gender}
                                </Text>
                            </View>
                        )}
                    </View>
                </Card>

                {/* ✅ UPDATED: Location - Now Required */}
                <Card style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.header }]}>
                        Location <Text style={{ color: theme.error }}>*</Text>
                    </Text>

                    {/* Country Selector */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.text, fontFamily: Fonts.body }]}>
                            Country <Text style={{ color: theme.error }}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.pickerButton,
                                {
                                    backgroundColor: theme.backgroundSecondary,
                                    borderColor: errors.country ? theme.error : theme.border
                                }
                            ]}
                            onPress={() => setShowCountryPicker(true)}
                        >
                            <Icon name="globe" size={20} color={theme.primary} />
                            <Text style={[styles.pickerButtonText, {
                                color: selectedCountryName ? theme.text : theme.textSecondary,
                                fontFamily: Fonts.body
                            }]}>
                                {selectedCountryName || 'Select Country'}
                            </Text>
                            <Icon name="chevron-down" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                        {errors.country && (
                            <View style={styles.errorContainer}>
                                <Icon name="alert-circle" size={14} color={theme.error} />
                                <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
                                    {errors.country}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* State Selector */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.text, fontFamily: Fonts.body }]}>
                            State/Region <Text style={{ color: theme.error }}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.pickerButton,
                                {
                                    backgroundColor: theme.backgroundSecondary,
                                    borderColor: errors.state ? theme.error : theme.border
                                }
                            ]}
                            onPress={() => setShowStatePicker(true)}
                            disabled={!selectedCountryCode}
                        >
                            <Icon name="map-pin" size={20} color={theme.primary} />
                            <Text style={[styles.pickerButtonText, {
                                color: selectedState ? theme.text : theme.textSecondary,
                                fontFamily: Fonts.body
                            }]}>
                                {selectedState || (selectedCountryCode ? 'Select State/Region' : 'Select country first')}
                            </Text>
                            <Icon name="chevron-down" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                        {errors.state && (
                            <View style={styles.errorContainer}>
                                <Icon name="alert-circle" size={14} color={theme.error} />
                                <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
                                    {errors.state}
                                </Text>
                            </View>
                        )}
                    </View>
                </Card>

                {/* Parent/Guardian */}
                <Card style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.header }]}>
                        Parent/Guardian (Optional)
                    </Text>

                    <View style={styles.fieldContainer}>
                        <Input
                            label="Parent Email"
                            value={parentEmail}
                            onChangeText={handleParentEmailChange}
                            placeholder="parent@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon="mail"
                            error={errors.parentEmail}
                        />
                        <Text style={[styles.hint, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                            Your parent/guardian can receive updates about your progress
                        </Text>
                    </View>
                </Card>

                {/* Save Button */}
                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    isLoading={isSaving}
                    disabled={isSaving}
                    style={styles.saveButton}
                />

                {/* Cancel Button */}
                <Button
                    title="Cancel"
                    onPress={() => router.back()}
                    variant="outline"
                    disabled={isSaving}
                    style={styles.cancelButton}
                />
            </ScrollView>

            {renderCountryPicker()}
            {renderStatePicker()}
        </View>
         </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,   
        paddingBottom: spacing.lg,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    headerRight: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    photoCard: {
        marginBottom: spacing.lg,
    },
    photoSection: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    photoContainer: {
        position: 'relative',
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    photoHint: {
        marginTop: spacing.md,
        fontSize: fontSize.sm,
    },
    card: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
    },
    fieldContainer: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
    },
    inputIcon: {
        marginRight: spacing.sm,
    },
    textInput: {
        flex: 1,
        fontSize: fontSize.base,
        paddingVertical: spacing.md,
    },
    hintText: {
        fontSize: fontSize.xs,
        marginTop: spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
        gap: spacing.xs,
    },
    errorText: {
        fontSize: fontSize.sm,
        flex: 1,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    genderOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        gap: spacing.sm,
        minHeight: 60,
    },
    genderLabel: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
    },
    pickerButtonText: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: fontSize.base,
    },
    hint: {
        fontSize: fontSize.sm,
        marginTop: spacing.sm,
        lineHeight: fontSize.sm * 1.4,
    },
    saveButton: {
        marginBottom: spacing.md,
    },
    cancelButton: {
        marginBottom: spacing.md,
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