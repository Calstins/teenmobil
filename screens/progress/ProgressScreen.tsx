// src/screens/progress/ProgressScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { progressApi } from '../../api/progressApi';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../../theme';

export const ProgressScreen: React.FC = () => {
  const { theme } = useTheme();
  const [yearlyData, setYearlyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchProgress();
  }, [selectedYear]);

  const fetchProgress = async () => {
    try {
      const response = await progressApi.getYearlyProgress(selectedYear);
      if (response.success && response.data) {
        setYearlyData(response.data);
      }
    } catch (error) {
      console.error('Progress error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProgress();
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[month - 1];
  };

  if (isLoading) {
    return <Loading message="Loading progress..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>My Progress</Text>
        <Text style={[styles.headerSubtitle, { color: theme.primaryLight }]}>
          Track your journey
        </Text>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <Card variant="elevated">
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {yearlyData?.stats.completedChallenges || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.secondary }]}>
                {yearlyData?.stats.totalChallenges || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent }]}>
                {Math.round(yearlyData?.stats.averagePercentage || 0)}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Average</Text>
            </View>
          </View>
        </Card>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Monthly Progress</Text>

        {yearlyData?.progress.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="trending-up" size={64} color={theme.borderLight} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
              No progress yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
              Start completing challenges!
            </Text>
          </View>
        ) : (
          yearlyData?.progress.map((item: any) => (
            <Card key={item.id} style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={[styles.progressMonth, { color: theme.text }]}>
                    {getMonthName(item.challenge.month)} {item.challenge.year}
                  </Text>
                  <Text style={[styles.progressTheme, { color: theme.textSecondary }]}>
                    {item.challenge.theme}
                  </Text>
                </View>
                {item.percentage === 100 && (
                  <View style={[styles.completeBadge, { backgroundColor: theme.secondaryLight }]}>
                    <Icon name="check-circle" size={24} color={theme.secondary} />
                  </View>
                )}
              </View>

              <View style={styles.progressBarSection}>
                <View style={styles.progressBarHeader}>
                  <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                    Progress
                  </Text>
                  <Text style={[styles.progressPercentage, { color: theme.primary }]}>
                    {Math.round(item.percentage)}%
                  </Text>
                </View>
                <View
                  style={[styles.progressBarContainer, { backgroundColor: theme.backgroundSecondary }]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: theme.primary,
                        width: `${item.percentage}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <Text style={[styles.tasksCompleted, { color: theme.textTertiary }]}>
                {item.tasksCompleted} of {item.tasksTotal} tasks completed
              </Text>

              {item.completedAt && (
                <View style={styles.completedRow}>
                  <Icon name="calendar" size={12} color={theme.textTertiary} />
                  <Text style={[styles.completedText, { color: theme.textTertiary }]}>
                    Completed: {new Date(item.completedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </Card>
          ))
        )}
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
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
  headerSubtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.sm,
  },
  divider: {
    width: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  progressCard: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  progressMonth: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  progressTheme: {
    fontSize: fontSize.sm,
  },
  completeBadge: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
  },
  progressBarSection: {
    marginBottom: spacing.sm,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: fontSize.sm,
  },
  progressPercentage: {
    fontWeight: fontWeight.bold,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  tasksCompleted: {
    fontSize: fontSize.xs,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  completedText: {
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
});