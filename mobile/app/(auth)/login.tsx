import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'
import { validateEmail, ValidationErrors, setFieldError } from '@/utils/validation'
import { Button, Input } from '@/components/common'
import { Colors, Spacing, Typography } from '@/constants'

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<ValidationErrors>({})

  const handleLogin = async () => {
    const newErrors: ValidationErrors = {}

    if (!validateEmail(email)) {
      setErrors(setFieldError(newErrors, 'email', 'Invalid email address'))
      return
    }

    if (!password) {
      setErrors(setFieldError(newErrors, 'password', 'Password is required'))
      return
    }

    try {
      await login(email, password)
      Alert.alert('Success', 'Login successful')
      router.replace('/(tabs)/search')
    } catch (err: any) {
      Alert.alert('Login failed', err.message || 'Something went wrong')
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.brand, { color: Colors.primary }]}>CasusApp</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Discover & Book Experiences</Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error.message}</Text>
              </View>
            )}

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              error={errors.email}
              leftIcon="mail-outline"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
              error={errors.password}
              leftIcon="lock-closed-outline"
              containerStyle={styles.inputGap}
            />

            <Button onPress={handleLogin} loading={isLoading} fullWidth style={styles.buttonGap}>
              Login
            </Button>
          </View>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/register')} disabled={isLoading}>
              <Text style={styles.footerLink}>Register</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    justifyContent: 'center',
  },
  header: { marginBottom: 20 },
  brand: {
    fontSize: Typography.fontSize['6xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  subtitle: {
    marginTop: 8,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.regular,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: Spacing.radius['2xl'],
    padding: 16,
    gap: 2,
    ...Spacing.shadow.md,
  },
  inputGap: { marginTop: 8 },
  buttonGap: { marginTop: 14 },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
  },
  footerRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.regular,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
})
