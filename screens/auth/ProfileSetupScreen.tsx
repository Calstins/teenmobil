// src/screens/auth/ProfileSetupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, fontSize, fontWeight, borderRadius } from '../../theme';

interface ProfileSetupScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);

  const handleSkip = () => {
    Alert.alert(
      'Setup Complete',
      'You can update your profile anytime from settings!',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          },
        },
      ]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
              <Icon name="user" size={64} color={theme.primary} />
            </View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Add a profile photo</Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              This helps your friends recognize you on the leaderboard
            </Text>
            <Button
              title="Upload Photo"
              variant="primary"
              style={styles.actionButton}
              onPress={() => {}}
            />
            <TouchableOpacity onPress={handleSkip}>
              <Text style={[styles.skipText, { color: theme.textTertiary }]}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, { backgroundColor: theme.secondaryLight }]}>
              <Icon name="map-pin" size={64} color={theme.secondary} />
            </View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Your Location</Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Help us customize your experience based on your location
            </Text>
            <Button
              title="Set Location"
              variant="primary"
              style={styles.actionButton}
              onPress={() => {}}
            />
            <TouchableOpacity onPress={handleSkip}>
              <Text style={[styles.skipText, { color: theme.textTertiary }]}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, { backgroundColor: theme.accentLight }]}>
              <Icon name="bell" size={64} color={theme.accent} />
            </View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Stay Updated</Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Get notified about new challenges, badges, and achievements
            </Text>
            <Button
              title="Enable Notifications"
              variant="primary"
              style={styles.actionButton}
              onPress={() => {}}
            />
            <TouchableOpacity onPress={handleSkip}>
              <Text style={[styles.skipText, { color: theme.textTertiary }]}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>Profile Setup</Text>
        <Text style={[styles.headerSubtitle, { color: theme.primaryLight }]}>
          Step {step} of 3
        </Text>
      </View>

      {/* Progress Indicator */}
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
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
  },
  actionButton: {
    marginBottom: spacing.md,
    width: 256,
  },
  skipText: {
    fontSize: fontSize.base,
  },
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});