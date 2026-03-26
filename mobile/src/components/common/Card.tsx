import type { ReactNode } from 'react'
import {
  View,
  StyleSheet,
  Pressable,
  useColorScheme,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { Colors, Spacing } from '@/constants'

type CardVariant = 'default' | 'accent'

interface CardProps {
  children: ReactNode
  variant?: CardVariant
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  padding?: number
}

export function Card({
  children,
  variant = 'default',
  onPress,
  style,
  padding,
}: CardProps) {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: Spacing.radius.lg,  // Use lg (16px) for consistent card styling
      padding: padding ?? Spacing.lg,   // Use generous Spacing.lg (20px)
      borderWidth: 1,
      ...Spacing.shadow.lg,  // Use premium shadow
    }

    switch (variant) {
      case 'accent':
        return {
          ...baseStyle,
          backgroundColor: isDark ? theme.surface : '#333333',
          borderColor: isDark ? theme.border : '#333333',
        }

      case 'default':
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.card,
          borderColor: theme.border,
        }
    }
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          getCardStyle(),
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    )
  }

  return <View style={[getCardStyle(), style]}>{children}</View>
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
})
