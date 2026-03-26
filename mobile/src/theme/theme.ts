import { extendTheme } from 'native-base';
import { Colors } from '@/constants/Colors';

export const theme = extendTheme({
  colors: {
    // Primary Brand Colors (Soft Forest Green) - Nature-inspired, inviting
    primary: {
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
    // Secondary Brand Colors (Sandy Beige) - Warm, earthy accents ⭐ NEW
    beige: {
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
    // Neutral Colors (Soft Whites & Refined Grays)
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
    // Legacy Accent Colors (kept for backward compatibility)
    accent: {
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
    // Semantic Colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Background Colors (updated for new palette)
    background: '#E8F3EF',     // primary.50 - Light Forest Green ⭐
    surface: '#FEFEFE',        // neutral.50
    'surface-secondary': '#F1F0EF',  // neutral.200
    'surface-beige': '#FAF7F3',      // beige.50 - Warm surface variant ⭐ NEW
  },

  sizes: {
    // Spacing System (increased for breathing room)
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '20px',    // Increased from 16px ⭐
    xl: '24px',    // Increased from 20px
    '2xl': '32px', // Increased from 24px
    '3xl': '40px', // Increased from 32px
    '4xl': '48px', // Increased from 40px
    '5xl': '64px', // Increased from 48px
  },

  radii: {
    // Consistent Border Radius (Premium feel)
    none: '0px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',    // Maintained
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  shadows: {
    // Subtle Soft Shadows
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
    lg: '0 4px 20px rgba(0, 0, 0, 0.08)',  // Primary shadow ⭐
    xl: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
  },

  components: {
    Button: {
      baseStyle: {
        rounded: 'lg',
        fontWeight: '600',
        _pressed: {
          opacity: 0.9,
          transform: [{ scale: 0.985 }],
        },
        _disabled: {
          opacity: 0.5,
        },
      },
      variants: {
        solid: {
          bg: 'primary.600',
          _text: { color: 'white', fontSize: 'md' },
          px: 'lg',
          py: 'md',
          shadow: 'lg',
          _hover: { bg: 'primary.700' },
        },
        outline: {
          borderWidth: 1.5,
          borderColor: 'primary.600',
          _text: { color: 'primary.600' },
          px: 'lg',
          py: 'md',
          _hover: { bg: 'primary.50' },
        },
        ghost: {
          _text: { color: 'primary.600' },
          px: 'lg',
          py: 'md',
          _pressed: { bg: 'primary.50' },
          _hover: { bg: 'primary.50' },
        },
        // Beige variant - Secondary CTA ⭐ NEW
        beige: {
          bg: 'beige.500',
          _text: { color: 'white', fontSize: 'md' },
          px: 'lg',
          py: 'md',
          shadow: 'lg',
          _hover: { bg: 'beige.600' },
        },
        'beige-outline': {
          borderWidth: 1.5,
          borderColor: 'beige.500',
          bg: 'beige.50',
          _text: { color: 'beige.700' },
          px: 'lg',
          py: 'md',
          _hover: { bg: 'beige.100' },
        },
        // Legacy secondary (now using beige)
        secondary: {
          bg: 'beige.500',
          _text: { color: 'white' },
          px: 'lg',
          py: 'md',
          shadow: 'lg',
          _hover: { bg: 'beige.600' },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },

    Card: {
      baseStyle: {
        rounded: 'lg',
        shadow: 'lg',
        bg: 'surface',
        p: 'lg',       // Now 20px instead of 16px
        borderWidth: 0,
      },
    },

    Input: {
      baseStyle: {
        rounded: 'lg',
        borderWidth: 1.5,
        borderColor: 'neutral.300',
        bg: 'surface',
        px: 'lg',      // Now 20px instead of 16px
        py: 'md',
        fontSize: 'md',
        _focus: {
          borderColor: 'primary.600',
          shadow: 'lg',  // Increased from md
        },
        _disabled: {
          bg: 'neutral.200',
          opacity: 0.6,
        },
      },
    },

    TextArea: {
      baseStyle: {
        rounded: 'lg',
        borderWidth: 1.5,
        borderColor: 'neutral.300',
        bg: 'surface',
        px: 'lg',
        py: 'md',
        fontSize: 'md',
        _focus: {
          borderColor: 'primary.600',
          shadow: 'lg',
        },
      },
    },

    Select: {
      baseStyle: {
        rounded: 'lg',
        borderWidth: 1.5,
        borderColor: 'neutral.300',
        bg: 'surface',
        px: 'lg',
        py: 'md',
        _focus: {
          borderColor: 'primary.600',
          shadow: 'lg',
        },
      },
    },

    Checkbox: {
      baseStyle: {
        size: 'lg',
        rounded: 'md',
        _checked: {
          bg: 'primary.600',
          borderColor: 'primary.600',
        },
      },
    },

    Radio: {
      baseStyle: {
        size: 'lg',
        _checked: {
          borderColor: 'primary.600',
          _icon: { color: 'primary.600' },
        },
      },
    },

    Slider: {
      baseStyle: {
        track: {
          bg: 'neutral.300',
          rounded: 'full',
          height: '4px',
        },
        thumb: {
          bg: 'primary.600',
          rounded: 'full',
          size: '20px',
          shadow: 'lg',
          _pressed: {
            shadow: 'xl',
          },
        },
      },
    },

    Badge: {
      baseStyle: {
        rounded: 'md',
        px: 'md',
        py: 'sm',
        fontSize: 'xs',
        fontWeight: '600',
      },
      variants: {
        solid: {
          bg: 'primary.600',
          _text: { color: 'white' },
        },
        'solid-beige': {
          bg: 'beige.500',
          _text: { color: 'white' },
        },
        subtle: {
          bg: 'primary.50',
          _text: { color: 'primary.800' },
        },
        'subtle-beige': {
          bg: 'beige.100',
          _text: { color: 'beige.800' },
        },
        outline: {
          borderWidth: 1,
          borderColor: 'primary.600',
          _text: { color: 'primary.600' },
        },
      },
    },

    Modal: {
      baseStyle: {
        content: {
          rounded: 'xl',
          shadow: '2xl',
          bg: 'surface',
          p: '2xl',  // Generous padding for modals
        },
      },
    },

    Toast: {
      baseStyle: {
        rounded: 'lg',
        shadow: 'xl',
        pl: 'lg',
        pr: 'lg',
        py: 'md',
      },
    },
  },

  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
});

export type CustomTheme = typeof theme;
