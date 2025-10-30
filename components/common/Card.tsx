// src/components/common/Card.tsx
import React, { ReactNode } from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, shadows } from '../../theme';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: 'default' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...(variant === 'elevated' ? shadows.lg : shadows.sm),
  };

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};