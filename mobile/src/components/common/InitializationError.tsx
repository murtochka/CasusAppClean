import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography } from '@/constants'

interface InitializationErrorProps {
  error?: string
  onRetry: () => void
  isRetrying?: boolean
}

/**
 * InitializationError - Shows when app fails to start (network error, etc)
 * Provides retry mechanism for network recovery
 */
export function InitializationError({ error, onRetry, isRetrying }: InitializationErrorProps) {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  const isNetworkError = !error || error.includes('Network') || error.includes('timeout')

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isNetworkError ? 'wifi-outline' : 'alert-circle-outline'}
            size={64}
            color={Colors.warning}
          />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          {isNetworkError ? 'Connection Issue' : 'Startup Error'}
        </Text>

        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {isNetworkError
            ? 'Unable to connect to the server. Please check your internet connection and try again.'
            : error || 'An error occurred while starting the app'}
        </Text>

        <View style={styles.tipContainer}>
          <Ionicons name="information-circle-outline" size={20} color={theme.textTertiary} />
          <Text style={[styles.tipText, { color: theme.textTertiary }]}>
            {isNetworkError
              ? 'Make sure your device is connected to WiFi or mobile data'
              : 'Try restarting the app'}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            {
              backgroundColor: pressed ? Colors.primary + 'DD' : Colors.primary,
              opacity: isRetrying ? 0.6 : 1,
            },
          ]}
          onPress={onRetry}
          disabled={isRetrying}
        >
          <Ionicons name="refresh-outline" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>
            {isRetrying ? 'Connecting...' : 'Try Again'}
          </Text>
        </Pressable>

        {__DEV__ && error && (
          <View
            style={[
              styles.devBox,
              { backgroundColor: Colors.warning + '15', borderColor: Colors.warning },
            ]}
          >
            <Text style={[styles.devText, { color: Colors.warning }]}>
              Dev Info: {error}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '10',
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
    width: '100%',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  devBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    width: '100%',
  },
  devText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
})
