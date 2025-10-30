// src/screens/profile/ProfileScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Card } from '../../../components/common/Card';
import { Loading } from '../../../components/common/Loading';
import { Button } from '../../../components/common/Button';
import { AuthContext } from '../../../context/AuthContext';
import { profileApi } from '../../api/profileApi';
import { useTheme } from '../../../context/ThemeContext';
import type { Teen } from '../../../types';
import { spacing, fontSize, fontWeight, borderRadius } from '../../../theme';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const [profile, setProfile] = useState<Teen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [optInPublic, setOptInPublic] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => await logout() },
    ]);
  };

  if (isLoading) return <Loading message="Loading profile..." />;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Icon name="user" size={48} color={theme.textInverse} />
          </View>
          <Text style={[styles.name, { color: theme.textInverse }]}>{profile?.name}</Text>
          <Text style={[styles.email, { color: theme.primaryLight }]}>{profile?.email}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" style={styles.infoCard}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Profile Information</Text>
          <View style={[styles.infoRow, { borderBottomColor: theme.borderLight }]}>
            <Icon name="calendar" size={20} color={theme.primary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>Age</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {profile?.age} years
              </Text>
            </View>
          </View>
          {profile?.state && (
            <View style={styles.infoRow}>
              <Icon name="map-pin" size={20} color={theme.primary} />
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>Location</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{profile.state}</Text>
              </View>
            </View>
          )}
        </Card>

        <Card style={styles.settingsCard}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Privacy Settings</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={[styles.switchTitle, { color: theme.text }]}>Public Profile</Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
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

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </ScrollView>
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
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchTitle: {
    fontWeight: fontWeight.medium,
  },
  switchDescription: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  logoutButton: {
    marginBottom: spacing.xl,
  },
});