// theme.ts
import { Platform } from 'react-native';

// Color palette
export const palette = {
  // Primary colors
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#8B5CF6',
    700: '#7C3AED',
    800: '#6D28D9',
    900: '#5B21B6',
  },
  // Secondary colors (Green)
  green: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  // Accent colors (Amber)
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  // Gray scale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  // Red (for errors)
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
};

// Light theme
export const lightTheme = {
  // Primary colors
  primary: palette.purple[600],
  primaryLight: palette.purple[100],
  primaryDark: palette.purple[700],
  
  // Secondary colors
  secondary: palette.green[500],
  secondaryLight: palette.green[100],
  secondaryDark: palette.green[600],
  
  // Accent colors
  accent: palette.amber[500],
  accentLight: palette.amber[100],
  accentDark: palette.amber[600],
  
  // Background colors
  background: palette.white,
  backgroundSecondary: palette.gray[50],
  
  // Surface colors
  surface: palette.white,
  surfaceElevated: palette.white,
  
  // Text colors
  text: palette.gray[900],
  textSecondary: palette.gray[600],
  textTertiary: palette.gray[400],
  textInverse: palette.white,
  
  // Border colors
  border: palette.gray[200],
  borderLight: palette.gray[100],
  
  // Status colors
  success: palette.green[500],
  successLight: palette.green[100],
  error: palette.red[500],
  errorLight: palette.red[100],
  warning: palette.amber[500],
  warningLight: palette.amber[100],
  
  // Tab bar
  tabBarBackground: palette.white,
  tabBarBorder: palette.gray[200],
  tabBarActive: palette.purple[600],
  tabBarInactive: palette.gray[400],
};

// Dark theme
export const darkTheme = {
  // Primary colors
  primary: palette.purple[400],
  primaryLight: palette.purple[900],
  primaryDark: palette.purple[300],
  
  // Secondary colors
  secondary: palette.green[400],
  secondaryLight: palette.green[900],
  secondaryDark: palette.green[300],
  
  // Accent colors
  accent: palette.amber[400],
  accentLight: palette.amber[900],
  accentDark: palette.amber[300],
  
  // Background colors
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  
  // Surface colors
  surface: '#1E1E1E',
  surfaceElevated: '#2A2A2A',
  
  // Text colors
  text: palette.gray[50],
  textSecondary: palette.gray[300],
  textTertiary: palette.gray[500],
  textInverse: palette.gray[900],
  
  // Border colors
  border: palette.gray[700],
  borderLight: palette.gray[800],
  
  // Status colors
  success: palette.green[400],
  successLight: palette.green[900],
  error: palette.red[400],
  errorLight: palette.red[900],
  warning: palette.amber[400],
  warningLight: palette.amber[900],
  
  // Tab bar
  tabBarBackground: '#1E1E1E',
  tabBarBorder: palette.gray[800],
  tabBarActive: palette.purple[400],
  tabBarInactive: palette.gray[500],
};

export type Theme = typeof lightTheme;

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Font sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

// Font weights
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Font families (from existing config)
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
};