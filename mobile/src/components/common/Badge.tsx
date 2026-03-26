import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native'
import { Colors, Spacing, Typography } from '@/constants'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  color?: string
  backgroundColor?: string
  size?: BadgeSize
  dot?: boolean
  style?: ViewStyle
}

export function Badge({
  label,
  variant = 'default',
  color,
  backgroundColor,
  size = 'md',
  dot = false,
  style,
}: BadgeProps) {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  const sizeStyles = {
    sm: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      fontSize: 9,
      dotSize: 4,
    },
    md: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 11,
      dotSize: 5,
    },
    lg: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontSize: 12,
      dotSize: 6,
    },
  }

  const getColors = (): { bg: string; text: string } => {
    if (backgroundColor && color) {
      return { bg: backgroundColor, text: color }
    }

    switch (variant) {
      case 'success':
        return {
          bg: Colors.success + '22',
          text: Colors.success,
        }
      case 'warning':
        return {
          bg: Colors.warning + '22',
          text: Colors.warning,
        }
      case 'error':
        return {
          bg: Colors.error + '22',
          text: Colors.error,
        }
      case 'info':
        return {
          bg: Colors.info + '22',
          text: Colors.info,
        }
      case 'default':
      default:
        return {
          bg: theme.surfaceSecondary,
          text: theme.textSecondary,
        }
    }
  }

  const colors = getColors()
  const sizeConfig = sizeStyles[size]

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          paddingVertical: sizeConfig.paddingVertical,
          borderRadius: Spacing.radius.sm,
          gap: dot ? 4 : 0,
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            {
              width: sizeConfig.dotSize,
              height: sizeConfig.dotSize,
              backgroundColor: colors.text,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizeConfig.fontSize,
            fontFamily: Typography.fontFamily.semibold,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: 999,
  },
  text: {
    textTransform: 'capitalize',
  },
})
