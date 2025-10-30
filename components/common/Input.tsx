// src/components/common/Input.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, fontSize, fontWeight, spacing } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return theme.error;
    if (isFocused) return theme.primary;
    return 'transparent';
  };

  const containerStyle: ViewStyle = {
    marginBottom: spacing.md,
  };

  const labelStyle: TextStyle = {
    color: theme.textSecondary,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
    fontSize: fontSize.sm,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: getBorderColor(),
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    paddingVertical: spacing.md,
    color: theme.text,
    fontSize: fontSize.base,
  };

  const errorStyle: TextStyle = {
    color: theme.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  };

  return (
    <View style={[containerStyle, style]}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <View style={inputContainerStyle}>
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={theme.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={textInputStyle}
          placeholderTextColor={theme.textTertiary}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
            <Icon name={isSecure ? 'eye-off' : 'eye'} size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Icon name={rightIcon} size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  leftIcon: {
    marginRight: spacing.sm,
  },
});