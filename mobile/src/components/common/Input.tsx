import { useState, type ReactNode } from 'react'
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TextInputProps,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography } from '@/constants'

interface InputProps extends Omit<TextInputProps, 'style'> {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  leftIcon?: keyof typeof Ionicons.glyphMap
  rightElement?: ReactNode
  error?: string
  label?: string
  containerStyle?: ViewStyle
}

export function Input({
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightElement,
  error,
  label,
  containerStyle,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.background,
            borderColor: error ? Colors.error : isFocused ? Colors.primary : theme.border,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={theme.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholder}
          style={[
            styles.input,
            {
              color: theme.text,
              fontFamily: Typography.fontFamily.regular,
            },
          ]}
          {...rest}
        />
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      {error && (
        <Text style={[styles.error, { color: Colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Spacing.radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    padding: 0,
  },
  rightElement: {
    marginLeft: 10,
  },
  error: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 4,
    marginLeft: 4,
  },
})
