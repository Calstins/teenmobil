// src/components/ProgressBar.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '../theme';

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  color?: string;
  height?: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showLabel = true,
  color,
  height = 12,
  label,
}) => {
  const { theme } = useTheme();
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  const barColor = color || theme.primary;

  const barContainerStyle: ViewStyle = {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    height,
  };

  const barFillStyle: ViewStyle = {
    width: `${safePercentage}%`,
    height: '100%',
    backgroundColor: barColor,
    borderRadius: borderRadius.full,
  };

  const percentageTextStyle: TextStyle = {
    fontWeight: fontWeight.bold,
    color: barColor,
  };

  return (
    <View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {label || 'Progress'}
          </Text>
          <Text style={percentageTextStyle}>
            {Math.round(safePercentage)}%
          </Text>
        </View>
      )}
      <View style={barContainerStyle}>
        <View style={barFillStyle} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
  },
});