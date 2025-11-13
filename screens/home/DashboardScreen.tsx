// screens/home/DashboardScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router'; // ← Added
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';
import { profileApi } from '../../api/profileApi';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DashboardData } from '../../types';
import { fontSize, fontWeight, spacing, borderRadius } from '../../theme';

export const DashboardScreen = () => { // ← Removed props
  const router = useRouter(); // ← Added
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await profileApi.getDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (isLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: theme.textInverse }]}>
              Hey, {user?.name?.split(' ')[0]}! 👋
            </Text>
            <Text style={[styles.subtitle, { color: theme.primaryLight }]}>
              Ready to shape up today?
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/settings')} // ← Changed
            style={styles.settingsButton}
          >
            <Icon name="user" size={24} color={theme.textInverse} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {dashboardData?.currentChallenge ? (
          <Card variant="elevated" style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={[styles.challengeTitle, { color: theme.text }]}>
                {dashboardData.currentChallenge.theme}
              </Text>
              <View style={[styles.activeBadge, { backgroundColor: theme.successLight }]}>
                <Text style={[styles.badgeText, { color: theme.secondary }]}>Active</Text>
              </View>
            </View>
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Progress</Text>
                <Text style={[styles.progressPercentage, { color: theme.primary }]}>
                  {Math.round(dashboardData.currentChallenge.progress.percentage)}%
                </Text>
              </View>
              <View style={[styles.progressBarContainer, { backgroundColor: theme.backgroundSecondary }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: theme.primary,
                      width: `${dashboardData.currentChallenge.progress.percentage}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressStats, { color: theme.textTertiary }]}>
                {dashboardData.currentChallenge.progress.tasksCompleted} of{' '}
                {dashboardData.currentChallenge.progress.tasksTotal} tasks completed
              </Text>
            </View>
            <Button
              title="Continue Challenge"
              onPress={() => router.push('/(tabs)/challenges')} // ← Changed
              variant="primary"
              size="md"
            />
          </Card>
        ) : (
          <Card variant="elevated" style={styles.challengeCard}>
            <View style={styles.emptyChallenge}>
              <Icon name="calendar" size={48} color={theme.borderLight} />
              <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                No active challenge right now
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                Check back soon!
              </Text>
            </View>
          </Card>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: theme.primaryLight }]}>
                <Icon name="check-circle" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {dashboardData?.yearlyStats.completedChallenges || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
            </View>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: theme.secondaryLight }]}>
                <Icon name="award" size={24} color={theme.secondary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {dashboardData?.yearlyStats.earnedBadges || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Badges Earned</Text>
            </View>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <Card style={styles.actionsCard}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/badges')} // ← Changed
            style={[styles.actionItem, { borderBottomColor: theme.borderLight }]}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: theme.primaryLight }]}>
                <Icon name="award" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>My Badges</Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/progress')} // ← Changed
            style={styles.actionItem}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: theme.secondaryLight }]}>
                <Icon name="trending-up" size={20} color={theme.secondary} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>My Progress</Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.full,
    padding: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.lg,
  },
  challengeCard: {
    marginBottom: spacing.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  challengeTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  activeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: fontSize.sm,
  },
  progressPercentage: {
    fontWeight: fontWeight.bold,
  },
  progressBarContainer: {
    height: 12,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressStats: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  emptyChallenge: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statIcon: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.sm,
  },
  actionsCard: {
    marginBottom: spacing.lg,
  },
  actionItem: {
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
  actionIconBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  actionText: {
    fontWeight: fontWeight.medium,
  },
});

export default DashboardScreen;