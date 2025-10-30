// src/screens/badges/BadgesScreen.tsx
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
import { Card } from '../../../components/common/Card';
import { Loading } from '../../../components/common/Loading';
import { badgeApi } from '../../api/badgeApi';
import { BadgeStatus } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../../../theme';

export const BadgesScreen: React.FC = () => {
  const { theme } = useTheme();
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchBadges();
  }, [selectedYear]);

  const fetchBadges = async () => {
    try {
      const response = await badgeApi.getMyBadges(selectedYear);
      if (response.success && response.data) {
        setBadges(response.data);
      }
    } catch (error) {
      console.error('Badges error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBadges();
  };

  const getBadgeStatusColor = (status: BadgeStatus) => {
    switch (status) {
      case 'EARNED':
        return { bg: theme.secondaryLight, text: theme.secondary, label: 'Earned' };
      case 'PURCHASED':
        return { bg: theme.accentLight, text: theme.accent, label: 'Purchased' };
      default:
        return { bg: theme.backgroundSecondary, text: theme.textSecondary, label: 'Available' };
    }
  };

  if (isLoading) {
    return <Loading message="Loading badges..." />;
  }

  const earnedCount = badges.filter((b) => b.status === 'EARNED').length;
  const purchasedCount = badges.filter((b) => b.status === 'PURCHASED').length;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>My Badges</Text>
        <Text style={[styles.headerSubtitle, { color: theme.primaryLight }]}>
          Collect them all!
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card variant="elevated">
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.secondary }]}>{earnedCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Earned</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent }]}>{purchasedCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Purchased</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{badges.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
            </View>
          </View>
        </Card>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {badges.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="award" size={64} color={theme.borderLight} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No badges yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
              Complete challenges to earn badges!
            </Text>
          </View>
        ) : (
          <View style={styles.badgesGrid}>
            {badges.map((badgeItem) => {
              const statusColor = getBadgeStatusColor(badgeItem.status);
              return (
                <Card key={badgeItem.id} style={styles.badgeCard}>
                  <View style={styles.badgeContent}>
                    <View style={[styles.badgeIcon, { backgroundColor: statusColor.bg }]}>
                      <Icon name="award" size={40} color={theme.primary} />
                    </View>
                    <Text style={[styles.badgeName, { color: theme.text }]}>
                      {badgeItem.badge.name}
                    </Text>
                    <Text
                      style={[styles.badgeDescription, { color: theme.textSecondary }]}
                      numberOfLines={2}
                    >
                      {badgeItem.badge.description}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                      <Text style={[styles.statusText, { color: statusColor.text }]}>
                        {statusColor.label}
                      </Text>
                    </View>
                    {badgeItem.earnedAt && (
                      <Text style={[styles.earnedDate, { color: theme.textTertiary }]}>
                        {new Date(badgeItem.earnedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
  badgeContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  badgeIcon: {
    padding: spacing.md,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  badgeName: {
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  badgeDescription: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  earnedDate: {
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
});