/**
 * Spacing System - Roamly Design System v2.5
 * Consistent spacing scale, border radius, and shadows
 * Updated for generous breathing room and premium aesthetic
 */

export const Spacing = {
  // Base spacing scale (increased for breathing room)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,       // Increased from 16px for generous padding ⭐
  xl: 24,       // Increased from 20px
  '2xl': 32,    // Increased from 24px
  '3xl': 40,    // Increased from 28px
  '4xl': 48,    // Increased from 32px
  '5xl': 64,    // Increased from 36px
  '6xl': 80,    // Increased from 40px
  '7xl': 96,    // Increased from 48px
  '8xl': 128,   // Increased from 60px

  // Border radius (aligned with design system)
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,     // Fixed from 12 to match design system ⭐
    xl: 20,     // Fixed from 14
    '2xl': 24,  // Fixed from 16 (proper 2xl value)
    '3xl': 28,  // Renamed from old '3xl': 20
    full: 9999,
  },

  // Shadows (iOS/Android compatible) - Updated for softer premium depth
  shadow: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    lg: {
      // Primary shadow: 0 4px 20px rgba(0,0,0,0.08) ⭐
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 3,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
      elevation: 4,
    },
    '2xl': {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.15,
      shadowRadius: 40,
      elevation: 5,
    },
  },

  // Common padding/margin patterns (updated for new spacing)
  container: {
    paddingHorizontal: 20,  // Using lg spacing
  },

  section: {
    marginTop: 32,  // Using 2xl spacing
  },

  card: {
    padding: 20,         // Using lg spacing (increased from 14)
    borderRadius: 16,    // Using lg radius
  },

  button: {
    paddingHorizontal: 20,  // Using lg spacing (increased from 14)
    paddingVertical: 12,    // Using md spacing (increased from 9)
    borderRadius: 16,       // Using lg radius (increased from 12)
  },

  input: {
    paddingHorizontal: 20,  // Using lg spacing (increased from 14)
    paddingVertical: 12,    // Using md spacing (increased from 13)
    borderRadius: 16,       // Using lg radius (increased from 14)
  },
}

export default Spacing
