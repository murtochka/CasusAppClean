/**
 * Color System - Roamly Design System v2.5
 * Nature-inspired color palette with soft forest greens and sandy beige
 * Updated for premium travel app aesthetic with automatic dark mode support
 */

export const Colors = {
  // Direct color exports (for components expecting strings)
  primary: '#2A6D59',      // primary.600 - Softer forest green
  secondary: '#A89379',    // beige.500 - Sandy beige for secondary actions
  accent: '#F59E0B',       // Legacy amber accent
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  star: '#F59E0B',        // For star ratings
  
  // Primary shade scales (Soft Forest Green) - Nature-inspired, inviting
  primaryShades: {
    50: '#E8F3EF',
    100: '#C7E3D8',
    200: '#A5D4C1',
    300: '#7FC4A6',
    400: '#59B48B',
    500: '#34856C',
    600: '#2A6D59',
    700: '#205446',
    800: '#163B33',
    900: '#0C2520',
  },

  // Secondary shade scales (Sandy Beige) - Warm, earthy accents ⭐ NEW
  beigeShades: {
    50: '#FAF7F3',
    100: '#F0EAE1',
    200: '#E8DFD3',
    300: '#D9CABA',
    400: '#C4B39C',
    500: '#A89379',
    600: '#8F7A62',
    700: '#6F5F4D',
    800: '#564A3D',
    900: '#3D342B',
  },

  // Neutral scales (Soft Whites & Refined Grays)
  neutral: {
    50: '#FEFEFE',
    100: '#F9F9F8',
    200: '#F1F0EF',
    300: '#E2E1DF',
    400: '#B8B6B3',
    500: '#8B8885',
    600: '#6A6764',
    700: '#504E4B',
    800: '#353431',
    900: '#1F1E1C',
  },

  // Legacy accent shades (kept for backward compatibility)
  accentShades: {
    50: '#FEF9F3',
    100: '#FEF1E3',
    200: '#FDE8CD',
    300: '#FDD5A0',
    400: '#FBB24B',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  background: '#F9F9F8',     // neutral.100 - Soft off-white
  surface: '#FEFEFE',        // neutral.50 - Pure white
  surfaceBeige: '#FAF7F3',   // beige.50 - Warm card backgrounds ⭐ NEW

  // Complete theme definitions (updated for new palette)
  light: {
    background: '#F9F9F8',        // neutral.100
    surface: '#FEFEFE',           // neutral.50
    card: '#FEFEFE',              // neutral.50
    cardBeige: '#FAF7F3',         // beige.50 - Warm variant ⭐ NEW
    surfaceSecondary: '#F1F0EF',  // neutral.200
    border: '#E2E1DF',            // neutral.300
    borderLight: '#F1F0EF',       // neutral.200
    text: '#1F1E1C',              // neutral.900
    textSecondary: '#6A6764',     // neutral.600
    textTertiary: '#8B8885',      // neutral.500
    textQuaternary: '#B8B6B3',    // neutral.400
    placeholder: '#B8B6B3',       // neutral.400
  },

  dark: {
    background: '#1F1E1C',        // neutral.900
    surface: '#353431',           // neutral.800
    card: '#353431',              // neutral.800
    cardBeige: '#3D342B',         // beige.900 - Dark warm variant
    surfaceSecondary: '#504E4B',  // neutral.700
    border: '#504E4B',            // neutral.700
    borderLight: '#6A6764',       // neutral.600
    text: '#F9F9F8',              // neutral.100
    textSecondary: '#E2E1DF',     // neutral.300
    textTertiary: '#B8B6B3',      // neutral.400
    textQuaternary: '#8B8885',    // neutral.500
    placeholder: '#8B8885',       // neutral.500
  },
  
  transparent: {
    white05: 'rgba(255, 255, 255, 0.05)',
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
    white30: 'rgba(255, 255, 255, 0.3)',
    black05: 'rgba(0, 0, 0, 0.05)',
    black10: 'rgba(0, 0, 0, 0.1)',
    black20: 'rgba(0, 0, 0, 0.2)',
  },
};

// Updated spacing export (aligned with spacing.ts fix)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,      // Increased from 16 ⭐
  xl: 24,      // Increased from 20
  '2xl': 32,   // Increased from 24
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// Fixed BorderRadius export (aligned with spacing.ts)
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,      // Fixed to match design system ⭐
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
  lg: '0 4px 20px rgba(0, 0, 0, 0.08)',  // Primary shadow ⭐
  xl: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 13,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
