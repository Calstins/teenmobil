// src/components/ChallengeCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Card } from './common/Card';
import { ProgressBar } from './ProgressBar';
import { Challenge, TeenProgress } from '../types';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../theme';

interface ChallengeCardProps {
  challenge: Challenge;
  progress?: TeenProgress;
  onPress: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  progress,
  onPress,
}) => {
  const { theme } = useTheme();

  const isActive =
    new Date(challenge.goLiveDate) <= new Date() &&
    new Date(challenge.closingDate) >= new Date();

  const activeBadgeStyle: ViewStyle = {
    backgroundColor: theme.secondaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  };

  const inactiveBadgeStyle: ViewStyle = {
    backgroundColor: theme.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  };

  return (
    <Card variant="elevated" style={styles.cardContainer}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {challenge.theme}
          </Text>
          {isActive ? (
            <View style={activeBadgeStyle}>
              <Text style={[styles.badgeText, { color: theme.secondary }]}>Active</Text>
            </View>
          ) : (
            <View style={inactiveBadgeStyle}>
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>Inactive</Text>
            </View>
          )}
        </View>

        <Text style={[styles.instructions, { color: theme.textSecondary }]} numberOfLines={2}>
          {challenge.instructions}
        </Text>

        {progress && (
          <View style={styles.progressContainer}>
            <ProgressBar
              percentage={progress.percentage}
              showLabel={true}
              label={`${progress.tasksCompleted} of ${progress.tasksTotal} tasks`}
            />
          </View>
        )}

        <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
          <View style={styles.dateContainer}>
            <Icon name="calendar" size={14} color={theme.textTertiary} />
            <Text style={[styles.dateText, { color: theme.textTertiary }]}>
              {new Date(challenge.goLiveDate).toLocaleDateString()} -{' '}
              {new Date(challenge.closingDate).toLocaleDateString()}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={theme.textTertiary} />
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    flex: 1,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs,
  },
  instructions: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
});