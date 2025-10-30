// src/components/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BadgeStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../theme';

interface BadgeComponentProps {
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  status: BadgeStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const BadgeComponent: React.FC<BadgeComponentProps> = ({
  name,
  description,
  status,
  price,
  size = 'md',
}) => {
  const { theme } = useTheme();

  const sizeConfig = {
    sm: { icon: 24, fontSize: fontSize.sm, padding: spacing.sm },
    md: { icon: 40, fontSize: fontSize.base, padding: spacing.md },
    lg: { icon: 56, fontSize: fontSize.lg, padding: spacing.lg },
  };

  const statusColors = {
    EARNED: { bg: theme.secondaryLight, icon: theme.secondary, label: 'Earned' },
    PURCHASED: { bg: theme.accentLight, icon: theme.accent, label: 'Purchased' },
    AVAILABLE: { bg: theme.backgroundSecondary, icon: theme.primary, label: 'Available' },
  };

  const config = sizeConfig[size];
  const colors = statusColors[status];

  const iconContainerStyle: ViewStyle = {
    backgroundColor: colors.bg,
    padding: config.padding,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  };

  const nameStyle: TextStyle = {
    color: theme.text,
    fontWeight: fontWeight.bold,
    fontSize: config.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xs,
  };

  const descriptionStyle: TextStyle = {
    color: theme.textSecondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginBottom: spacing.sm,
  };

  const labelContainerStyle: ViewStyle = {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  };

  const labelStyle: TextStyle = {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.icon,
  };

  const priceStyle: TextStyle = {
    color: theme.primary,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  };

  return (
    <View style={styles.container}>
      <View style={iconContainerStyle}>
        <Icon name="award" size={config.icon} color={colors.icon} />
      </View>
      <Text style={nameStyle}>{name}</Text>
      <Text style={descriptionStyle} numberOfLines={2}>
        {description}
      </Text>
      <View style={labelContainerStyle}>
        <Text style={labelStyle}>{colors.label}</Text>
      </View>
      {status === 'AVAILABLE' && <Text style={priceStyle}>${price}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});