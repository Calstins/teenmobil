// src/components/common/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, fontSize, fontWeight, spacing } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = true,
  disabled,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
      md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
      lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: theme.primary },
      secondary: { backgroundColor: theme.secondary },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.primary,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...((disabled || isLoading) && { opacity: 0.5 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const textVariantStyles: Record<string, TextStyle> = {
      primary: { color: theme.textInverse },
      secondary: { color: theme.textInverse },
      outline: { color: theme.primary },
    };

    const textSizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: fontSize.sm },
      md: { fontSize: fontSize.base },
      lg: { fontSize: fontSize.lg },
    };

    return {
      ...textVariantStyles[variant],
      ...textSizeStyles[size],
      fontWeight: fontWeight.semibold,
    };
  };

  const getLoaderColor = () => {
    return variant === 'outline' ? theme.primary : theme.textInverse;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
});