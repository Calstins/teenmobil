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
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { badgeApi } from '../../api/badgeApi';
import { BadgeStatus } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, Fonts } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        return { bg: theme.successLight, text: theme.success, label: 'Earned' };
      case 'PURCHASED':
        return { bg: theme.primaryLight, text: theme.primary, label: 'Purchased' };
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
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.textInverse, fontFamily: Fonts.header }]}>
          My Badges
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.primaryLight, fontFamily: Fonts.body }]}>
          Collect them all!
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card variant="elevated">
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.success, fontFamily: Fonts.body }]}>
                {earnedCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Earned
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primary, fontFamily: Fonts.body }]}>
                {purchasedCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Purchased
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.secondary, fontFamily: Fonts.body }]}>
                {badges.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Total
              </Text>
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
            <Text style={[styles.emptyTitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
              No badges yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
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
                    <Text style={[styles.badgeName, { color: theme.text, fontFamily: Fonts.body }]}>
                      {badgeItem.badge.name}
                    </Text>
                    <Text
                      style={[styles.badgeDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}
                      numberOfLines={2}
                    >
                      {badgeItem.badge.description}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                      <Text style={[styles.statusText, { color: statusColor.text, fontFamily: Fonts.body }]}>
                        {statusColor.label}
                      </Text>
                    </View>
                    {badgeItem.earnedAt && (
                      <Text style={[styles.earnedDate, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
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
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
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
    fontWeight: fontWeight.bold,
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