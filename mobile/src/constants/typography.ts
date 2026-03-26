/**
 * Typography System - Roamly Design System
 * Font sizes, weights, and styles matching Outfit font family
 */

export const Typography = {
  // Font families
  fontFamily: {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semibold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
  },

  // Font sizes (matches Replit design)
  fontSize: {
    '2xs': 9,
    xs: 10,
    sm: 11,
    base: 12,
    md: 13,
    lg: 14,
    xl: 15,
    '2xl': 16,
    '3xl': 18,
    '4xl': 20,
    '5xl': 22,
    '6xl': 26,
    '7xl': 28,
    '8xl': 30,
    '9xl': 32,
    '10xl': 36,
  },

  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Common text styles
  styles: {
    // Hero titles
    heroTitle: {
      fontSize: 30,
      fontFamily: 'Outfit_700Bold',
      lineHeight: 36,
      color: '#fff',
    },
    heroGreeting: {
      fontSize: 14,
      fontFamily: 'Outfit_400Regular',
      marginBottom: 4,
    },

    // Section titles
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Outfit_700Bold',
    },

    // Headers
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Outfit_700Bold',
    },
    headerSub: {
      fontSize: 13,
      fontFamily: 'Outfit_400Regular',
      marginTop: 2,
    },

    // Body text
    body: {
      fontSize: 14,
      fontFamily: 'Outfit_400Regular',
      lineHeight: 20,
    },
    bodySmall: {
      fontSize: 12,
      fontFamily: 'Outfit_400Regular',
    },
    bodyLarge: {
      fontSize: 16,
      fontFamily: 'Outfit_400Regular',
    },

    // Captions
    caption: {
      fontSize: 11,
      fontFamily: 'Outfit_400Regular',
    },

    // Button text
    button: {
      fontSize: 14,
      fontFamily: 'Outfit_600SemiBold',
    },
    buttonSmall: {
      fontSize: 13,
      fontFamily: 'Outfit_600SemiBold',
    },

    // Labels
    label: {
      fontSize: 13,
      fontFamily: 'Outfit_500Medium',
    },

    // Prices
    price: {
      fontSize: 15,
      fontFamily: 'Outfit_700Bold',
    },
    priceLarge: {
      fontSize: 22,
      fontFamily: 'Outfit_700Bold',
    },

    // Stats
    statValue: {
      fontSize: 20,
      fontFamily: 'Outfit_700Bold',
    },
    statLabel: {
      fontSize: 11,
      fontFamily: 'Outfit_400Regular',
      marginTop: 2,
    },
  },
}

export default Typography
