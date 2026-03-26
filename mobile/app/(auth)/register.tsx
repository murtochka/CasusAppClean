import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePhone,
  ValidationErrors,
  setFieldError,
} from '@/utils/validation'
import { Button, Input } from '@/components/common'
import { Colors, Spacing, Typography } from '@/constants'

export default function RegisterScreen() {
  const { register, isLoading, error } = useAuth()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('traveler')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateForm = (): boolean => {
    let newErrors: ValidationErrors = {}

    // Email validation
    if (!validateEmail(email)) {
      newErrors = setFieldError(newErrors, 'email', 'Invalid email address')
    }

    // Full name validation
    const nameValidation = validateFullName(fullName)
    if (!nameValidation.valid) {
      newErrors = setFieldError(newErrors, 'fullName', nameValidation.error || '')
    }

    // Password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      newErrors = setFieldError(newErrors, 'password', passwordValidation.errors[0])
    }

    // Confirm password
    if (password !== confirmPassword) {
      newErrors = setFieldError(newErrors, 'confirmPassword', 'Passwords do not match')
    }

    // Phone validation (optional)
    if (phone) {
      const phoneValidation = validatePhone(phone)
      if (!phoneValidation.valid) {
        newErrors = setFieldError(newErrors, 'phone', phoneValidation.error || '')
      }
    }

    // Terms agreement
    if (!agreedToTerms) {
      newErrors = setFieldError(newErrors, 'terms', 'You must accept the terms')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    try {
      await register(email, password, fullName, role, phone || undefined)
      Alert.alert('Success', 'Welcome to CasusApp!')
      router.replace('/(tabs)/search')
    } catch (err: any) {
      Alert.alert('Registration failed', err.message || 'Something went wrong')
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors.primary }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Join CasusApp to discover amazing experiences</Text>
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
              containerStyle={styles.fieldGap}
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!isLoading}
              error={errors.fullName}
              leftIcon="person-outline"
            />

            <Input
              containerStyle={styles.fieldGap}
              label="Phone (Optional)"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isLoading}
              error={errors.phone}
              leftIcon="call-outline"
            />

            <Text style={[styles.label, { color: theme.text }]}>I want to be a</Text>
            <View style={styles.roleRow}>
              <Button
                variant={role === 'traveler' ? 'primary' : 'outline'}
                onPress={() => setRole('traveler')}
                style={styles.roleButton}
                disabled={isLoading}
              >
                Traveler
              </Button>
              <Button
                variant={role === 'business' ? 'primary' : 'outline'}
                onPress={() => setRole('business')}
                style={styles.roleButton}
                disabled={isLoading}
              >
                Business
              </Button>
            </View>

            <Input
              containerStyle={styles.fieldGap}
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
              error={errors.password}
              leftIcon="lock-closed-outline"
            />

            <Input
              containerStyle={styles.fieldGap}
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isLoading}
              error={errors.confirmPassword}
              leftIcon="shield-checkmark-outline"
            />

            <View style={styles.termsRow}>
              <Switch
                value={agreedToTerms}
                onValueChange={setAgreedToTerms}
                disabled={isLoading}
                trackColor={{ false: '#d1d5db', true: Colors.primary }}
                thumbColor="#ffffff"
              />
              <Text style={[styles.termsText, { color: theme.textSecondary }]}>I agree to the Terms of Service</Text>
            </View>
            {!!errors.terms && <Text style={styles.errorInline}>{errors.terms}</Text>}

            <Button onPress={handleRegister} loading={isLoading} fullWidth style={styles.submitGap}>
              Create Account
            </Button>
          </View>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')} disabled={isLoading}>
              <Text style={styles.footerLink}>Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: { marginBottom: 16 },
  title: {
    fontSize: Typography.fontSize['6xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  subtitle: {
    marginTop: 4,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: Spacing.radius['2xl'],
    padding: 16,
    ...Spacing.shadow.md,
  },
  fieldGap: { marginTop: 8 },
  label: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
  },
  termsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  termsText: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.regular,
  },
  submitGap: { marginTop: 16 },
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
  errorInline: {
    marginTop: 6,
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
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
