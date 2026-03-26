import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography } from '@/constants'

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'link' | 'outline'

interface ButtonProps {
  children: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  style?: StyleProp<ViewStyle>
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  size = 'md',
  style,
}: ButtonProps) {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  const isDisabled = disabled || loading

  const sizeStyles = {
    sm: {
      paddingHorizontal: Spacing.md,   // 12px
      paddingVertical: Spacing.sm,     // 8px
      fontSize: 13,
    },
    md: {
      paddingHorizontal: Spacing.lg,   // 20px (increased)
      paddingVertical: Spacing.md,     // 12px (increased)
      fontSize: 14,
    },
    lg: {
      paddingHorizontal: Spacing.xl,   // 24px (increased)
      paddingVertical: Spacing.lg,     // 20px (increased)
      fontSize: 15,
    },
  }

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: Spacing.radius.lg,
      ...sizeStyles[size],
    }

    if (fullWidth) {
      baseStyle.width = '100%'
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: Colors.primary,
          borderWidth: 1,
          borderColor: Colors.primary,
        }

      case 'accent':
        return {
          ...baseStyle,
          backgroundColor: isDark ? theme.card : Colors.accent,
          borderWidth: 1,
          borderColor: isDark ? theme.border : Colors.accent,
        }

      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.surfaceSecondary,
          borderWidth: 1,
          borderColor: theme.borderLight,
        }

      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isDark ? theme.border : '#cccccc',
        }

      case 'link':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          paddingHorizontal: 0,
        }

      default:
        return baseStyle
    }
  }

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: sizeStyles[size].fontSize,
      fontFamily: variant === 'link' ? Typography.fontFamily.regular : Typography.fontFamily.semibold,
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: '#ffffff',
        }

      case 'accent':
        return {
          ...baseTextStyle,
          color: isDark ? theme.text : '#ffffff',
        }

      case 'secondary':
      case 'outline':
        return {
          ...baseTextStyle,
          color: theme.text,
        }

      case 'link':
        return {
          ...baseTextStyle,
          color: theme.textSecondary,
          textDecorationLine: 'underline',
        }

      default:
        return baseTextStyle
    }
  }

  const iconColor =
    variant === 'primary'
      ? '#ffffff'
      : variant === 'accent'
      ? isDark
        ? theme.text
        : '#ffffff'
      : theme.textSecondary

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={4}
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'accent' ? '#ffffff' : theme.textSecondary} 
          size="small" 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={sizeStyles[size].fontSize + 4} color={iconColor} />
          )}
          <Text style={getTextStyle()}>{children}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={sizeStyles[size].fontSize + 4} color={iconColor} />
          )}
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
  },
})
