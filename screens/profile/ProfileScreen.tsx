// src/screens/profile/ProfileScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';
import { AuthContext } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import type { Teen } from '../../types';
import { spacing, fontSize, fontWeight, borderRadius, Fonts } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const [profile, setProfile] = useState<Teen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [optInPublic, setOptInPublic] = useState(false);
  const {
    isNotificationEnabled,
    notificationCount,
    registerForNotifications,
    unregisterNotifications,
    clearNotifications
  } = useNotifications();

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleNotifications = async () => {
    try {
      if (isNotificationEnabled) {
        Alert.alert(
          'Disable Notifications',
          'Are you sure you want to disable push notifications? You will miss important updates.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                await unregisterNotifications();
                Alert.alert('Success', 'Notifications have been disabled');
              }
            }
          ]
        );
      } else {
        await registerForNotifications();
        Alert.alert(
          'Success',
          'Notifications enabled! You will now receive updates about new challenges and badges.'
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update notification settings');
    }
  };

  const handleClearNotifications = async () => {
    try {
      await clearNotifications();
      Alert.alert('Success', 'Notification badge cleared');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear notifications');
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        setOptInPublic(response.data.optInPublic);
      }
    } catch (error) {
      console.error('Profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublic = async (value: boolean) => {
    try {
      setOptInPublic(value);
      await profileApi.updateProfile({ optInPublic: value });
      Alert.alert('Success', 'Privacy settings updated');
    } catch (error: any) {
      setOptInPublic(!value);
      Alert.alert('Error', error.message || 'Failed to update settings');
    }
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    const modeNames = { light: 'Light', dark: 'Dark', auto: 'Auto (System)' };
    Alert.alert('Theme Changed', `Theme set to ${modeNames[mode]} mode`);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'You will be redirected to reset your password via email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => router.push('/(auth)/forgot-password' as any)
        }
      ]
    );
  };

  const handleRecoverPassword = () => {
    Alert.alert(
      'Recover Password',
      'Need to recover your password? We will send you a reset link.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: () => router.push('/(auth)/forgot-password' as any)
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => await logout() },
    ]);
  };

  if (isLoading) return <Loading message="Loading profile..." />;

  return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {profile?.profilePhoto ? (
              <Image
                source={{ uri: profile.profilePhoto }}
                style={styles.avatarImage}
              />
            ) : (
              <Icon name="user" size={48} color={theme.textInverse} />
            )}
          </View>
          <Text style={[styles.name, { color: theme.textInverse, fontFamily: Fonts.header }]}>
            {profile?.name}
          </Text>
          <Text style={[styles.email, { color: theme.primaryLight, fontFamily: Fonts.body }]}>
            {profile?.email}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Information Card */}
        <Card variant="elevated" style={styles.infoCard}>
          <Text style={[styles.cardTitle, { color: theme.text, fontFamily: Fonts.header }]}>
            Profile Information
          </Text>

          <View style={[styles.infoRow, { borderBottomColor: theme.borderLight }]}>
            <Icon name="calendar" size={20} color={theme.primary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                Age
              </Text>
              <Text style={[styles.infoValue, { color: theme.text, fontFamily: Fonts.body }]}>
                {profile?.age} years
              </Text>
            </View>
          </View>

          {profile?.gender && (
            <View style={[styles.infoRow, { borderBottomColor: theme.borderLight }]}>
              <Icon name="user" size={20} color={theme.primary} />
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                  Gender
                </Text>
                <Text style={[styles.infoValue, { color: theme.text, fontFamily: Fonts.body }]}>
                  {profile.gender}
                </Text>
              </View>
            </View>
          )}

          {profile?.state && (
            <View style={[styles.infoRow, { borderBottomColor: theme.borderLight }]}>
              <Icon name="map-pin" size={20} color={theme.primary} />
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                  Location
                </Text>
                <Text style={[styles.infoValue, { color: theme.text, fontFamily: Fonts.body }]}>
                  {profile.state}{profile.country ? `, ${profile.country}` : ''}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Icon name="clock" size={20} color={theme.primary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                Member Since
              </Text>
              <Text style={[styles.infoValue, { color: theme.text, fontFamily: Fonts.body }]}>
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Appearance Settings Card */}
        <Card style={styles.settingsCard}>
          <Text style={[styles.cardTitle, { color: theme.text, fontFamily: Fonts.header }]}>
            Appearance
          </Text>

          <View style={styles.themeOptionsContainer}>
            <Text style={[styles.switchDescription, { color: theme.textSecondary, fontFamily: Fonts.body, marginBottom: spacing.md }]}>
              Choose how TeenShapers looks to you
            </Text>

            {/* Light Mode */}
            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: theme.border },
                themeMode === 'light' && { borderColor: theme.primary, backgroundColor: theme.primaryLight }
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <View style={styles.themeOptionContent}>
                <Icon name="sun" size={24} color={themeMode === 'light' ? theme.primary : theme.textSecondary} />
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeTitle, { color: theme.text, fontFamily: Fonts.body }]}>
                    Light
                  </Text>
                  <Text style={[styles.themeDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                    Bright and clean interface
                  </Text>
                </View>
              </View>
              {themeMode === 'light' && (
                <Icon name="check-circle" size={20} color={theme.primary} />
              )}
            </TouchableOpacity>

            {/* Dark Mode */}
            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: theme.border },
                themeMode === 'dark' && { borderColor: theme.primary, backgroundColor: theme.primaryLight }
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <View style={styles.themeOptionContent}>
                <Icon name="moon" size={24} color={themeMode === 'dark' ? theme.primary : theme.textSecondary} />
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeTitle, { color: theme.text, fontFamily: Fonts.body }]}>
                    Dark
                  </Text>
                  <Text style={[styles.themeDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                    Easy on the eyes at night
                  </Text>
                </View>
              </View>
              {themeMode === 'dark' && (
                <Icon name="check-circle" size={20} color={theme.primary} />
              )}
            </TouchableOpacity>

            {/* Auto Mode */}
            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: theme.border },
                themeMode === 'auto' && { borderColor: theme.primary, backgroundColor: theme.primaryLight }
              ]}
              onPress={() => handleThemeChange('auto')}
            >
              <View style={styles.themeOptionContent}>
                <Icon name="smartphone" size={24} color={themeMode === 'auto' ? theme.primary : theme.textSecondary} />
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeTitle, { color: theme.text, fontFamily: Fonts.body }]}>
                    Auto
                  </Text>
                  <Text style={[styles.themeDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                    Match system settings
                  </Text>
                </View>
              </View>
              {themeMode === 'auto' && (
                <Icon name="check-circle" size={20} color={theme.primary} />
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* Privacy Settings Card */}
        <Card style={styles.settingsCard}>
          <Text style={[styles.cardTitle, { color: theme.text, fontFamily: Fonts.header }]}>
            Privacy Settings
          </Text>
          <View style={[styles.switchRow, { borderBottomColor: theme.borderLight, borderBottomWidth: 1 }]}>
            <View style={styles.switchTextContainer}>
              <Text style={[styles.switchTitle, { color: theme.text, fontFamily: Fonts.body }]}>
                Public Profile
              </Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Show your progress on the leaderboard
              </Text>
            </View>
            <Switch
              value={optInPublic}
              onValueChange={handleTogglePublic}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={optInPublic ? theme.primary : theme.backgroundSecondary}
            />
          </View>
        </Card>

        {/* Notification Settings Card */}
        <Card style={styles.settingsCard}>
          <Text style={[styles.cardTitle, { color: theme.text, fontFamily: Fonts.header }]}>
            Notification Settings
          </Text>

          <View style={[styles.switchRow, { paddingBottom: spacing.md }]}>
            <View style={styles.switchTextContainer}>
              <View style={styles.notificationHeader}>
                <Icon
                  name={isNotificationEnabled ? "bell" : "bell-off"}
                  size={20}
                  color={isNotificationEnabled ? theme.primary : theme.textSecondary}
                  style={styles.notificationIcon}
                />
                <Text style={[styles.switchTitle, { color: theme.text, fontFamily: Fonts.body }]}>
                  Push Notifications
                </Text>
              </View>
              <Text style={[styles.switchDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Get notified about new challenges, badge updates, and submission reviews
              </Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: isNotificationEnabled ? theme.successLight : theme.errorLight }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: isNotificationEnabled ? theme.success : theme.error, fontFamily: Fonts.body }
                  ]}>
                    {isNotificationEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                {notificationCount > 0 && (
                  <View style={[styles.badgeCount, { backgroundColor: theme.error }]}>
                    <Text style={[styles.badgeCountText, { color: theme.textInverse, fontFamily: Fonts.body }]}>
                      {notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Switch
              value={isNotificationEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={isNotificationEnabled ? theme.primary : theme.backgroundSecondary}
            />
          </View>

          {/* Clear Badge Button */}
          {isNotificationEnabled && notificationCount > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={handleClearNotifications}
            >
              <Icon name="trash-2" size={16} color={theme.textSecondary} />
              <Text style={[styles.clearButtonText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Clear notification badge
              </Text>
            </TouchableOpacity>
          )}

          {/* Notification Info */}
          {isNotificationEnabled && (
            <View style={[styles.notificationInfo, { backgroundColor: theme.primaryLight }]}>
              <Icon name="info" size={16} color={theme.primary} />
              <Text style={[styles.notificationInfoText, { color: theme.primary, fontFamily: Fonts.body }]}>
                You'll receive notifications for: New challenges, submission reviews, badges earned, and challenge reminders
              </Text>
            </View>
          )}
        </Card>

        {/* Account Actions */}
        <Card style={styles.actionsCard}>
          <Text style={[styles.cardTitle, { color: theme.text, fontFamily: Fonts.header }]}>
            Account
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { borderBottomColor: theme.borderLight }]}
            onPress={() => router.push('/profile/edit' as any)}
          >
            <View style={styles.actionLeft}>
              <Icon name="edit" size={20} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text, fontFamily: Fonts.body }]}>
                Edit Profile
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderBottomColor: theme.borderLight }]}
            onPress={handleChangePassword}
          >
            <View style={styles.actionLeft}>
              <Icon name="lock" size={20} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text, fontFamily: Fonts.body }]}>
                Change Password
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderBottomColor: theme.borderLight }]}
            onPress={handleRecoverPassword}
          >
            <View style={styles.actionLeft}>
              <Icon name="key" size={20} color={theme.warning} />
              <Text style={[styles.actionText, { color: theme.text, fontFamily: Fonts.body }]}>
                Recover Password
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/profile/help' as any)}
          >
            <View style={styles.actionLeft}>
              <Icon name="help-circle" size={20} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text, fontFamily: Fonts.body }]}>
                Help & Support
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          icon={<Icon name="log-out" size={20} color={theme.primary} />}
          style={styles.logoutButton}
        />

        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
          TeenShapers v1.0.0
        </Text>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
   paddingTop: spacing.lg,   
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.lg,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
  },
  name: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  email: {
    marginTop: spacing.xs,
    fontSize: fontSize.base,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    paddingBottom: spacing.xl,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  infoText: {
    marginLeft: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.sm,
  },
  infoValue: {
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  themeOptionsContainer: {
    marginTop: spacing.sm,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  themeTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  themeDescription: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchTitle: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  switchDescription: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    lineHeight: fontSize.sm * 1.4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationIcon: {
    marginRight: spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  badgeCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeCountText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  clearButtonText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  notificationInfoText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
  },
  actionsCard: {
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: spacing.md,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  logoutButton: {
    marginBottom: spacing.md,
  },
  versionText: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
});