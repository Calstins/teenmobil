// src/components/common/Avatar.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../context/ThemeContext';
import { fontSize, fontWeight, borderRadius } from '../../theme';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, size = 'md' }) => {
  const { theme } = useTheme();

  const sizeConfig = {
    sm: { container: 32, icon: 16, fontSize: fontSize.sm },
    md: { container: 48, icon: 24, fontSize: fontSize.base },
    lg: { container: 64, icon: 32, fontSize: fontSize.xl },
    xl: { container: 96, icon: 48, fontSize: fontSize['3xl'] },
  };

  const config = sizeConfig[size];
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const baseSizeStyle = {
    width: config.container,
    height: config.container,
    borderRadius: borderRadius.full,
  };

  const containerStyle: ImageStyle = {
    ...baseSizeStyle,
  };

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[containerStyle, styles.image]}
      />
    );
  }

  const placeholderStyle: ViewStyle = {
    ...baseSizeStyle,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const textStyle: TextStyle = {
    color: theme.primary,
    fontWeight: fontWeight.bold,
    fontSize: config.fontSize,
  };

  return (
    <View style={placeholderStyle}>
      {name ? (
        <Text style={textStyle}>{initials}</Text>
      ) : (
        <Icon name="user" size={config.icon} color={theme.primary} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
});