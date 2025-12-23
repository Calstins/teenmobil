// screens/home/DashboardScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';
import { profileApi } from '../../api/profileApi';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius, Fonts } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DashboardData {
  stats: {
    totalSubmissions: number;
    totalBadges: number;
    completedChallenges: number;
    averageProgress: number;
  };
  currentChallenge: {
    id: string;
    theme: string;
    instructions: string;
    progress: {
      tasksTotal: number;
      tasksCompleted: number;
      percentage: number;
    };
    badge?: {
      id: string;
      name: string;
      description: string;
      price: number;
      teenStatus: string;
    };
  } | null;
  recentSubmissions: any[];
  upcomingChallenges: any[];
}

export const DashboardScreen = () => {
  const router = useRouter();
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
        console.log('Dashboard data:', response.data);
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
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: theme.textInverse, fontFamily: Fonts.header }]}>
              Hey, {user?.name?.split(' ')[0]}! 👋
            </Text>
            <Text style={[styles.subtitle, { color: theme.primaryLight, fontFamily: Fonts.body }]}>
              Ready to shape up today?
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/settings')}
            style={styles.settingsButton}
          >
            <Icon name="user" size={24} color={theme.textInverse} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {dashboardData?.currentChallenge ? (
          <Card variant="elevated" style={styles.challengeCard}>
            <View style={[styles.activeBadge, { backgroundColor: theme.successLight, alignSelf: 'flex-start' }]}>
              <Text style={[styles.badgeText, { color: theme.success, fontFamily: Fonts.body }]}>
                Active
              </Text>
            </View>
            <Text style={[styles.challengeTitle, { color: theme.text, fontFamily: Fonts.header }]}>
              {dashboardData.currentChallenge.theme}
            </Text>
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                  Progress
                </Text>
                <Text style={[styles.progressPercentage, { color: theme.primary, fontFamily: Fonts.body }]}>
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
              <Text style={[styles.progressStats, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                {dashboardData.currentChallenge.progress.tasksCompleted} of{' '}
                {dashboardData.currentChallenge.progress.tasksTotal} tasks completed
              </Text>
            </View>
            <Button
              title="Continue Challenge"
              onPress={() => router.push('/(tabs)/challenges')}
              variant="primary"
              size="md"
            />
          </Card>
        ) : (
          <Card variant="elevated" style={styles.challengeCard}>
            <View style={styles.emptyChallenge}>
              <Icon name="calendar" size={48} color={theme.borderLight} />
              <Text style={[styles.emptyTitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                No active challenge right now
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                Check back soon!
              </Text>
            </View>
          </Card>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.header }]}>
          Your Stats
        </Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: theme.primaryLight }]}>
                <Icon name="check-circle" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text, fontFamily: Fonts.body }]}>
                {dashboardData?.stats.completedChallenges || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Completed
              </Text>
            </View>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: theme.successLight }]}>
                <Icon name="award" size={24} color={theme.success} />
              </View>
              <Text style={[styles.statValue, { color: theme.text, fontFamily: Fonts.body }]}>
                {dashboardData?.stats.totalBadges || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Badges Earned
              </Text>
            </View>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.header }]}>
          Quick Actions
        </Text>
        <Card style={styles.actionsCard}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/badges')}
            style={[styles.actionItem, { borderBottomColor: theme.borderLight }]}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: theme.primaryLight }]}>
                <Icon name="award" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.actionText, { color: theme.text, fontFamily: Fonts.body }]}>
                My Badges
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/progress')}
            style={styles.actionItem}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: theme.successLight }]}>
                <Icon name="trending-up" size={20} color={theme.success} />
              </View>
              <Text style={[styles.actionText, { color: theme.text, fontFamily: Fonts.body }]}>
                My Progress
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
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
  challengeTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  activeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontWeight: fontWeight.bold,
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
    fontWeight: fontWeight.bold,
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
    fontWeight: fontWeight.bold,
  },
});

export default DashboardScreen;