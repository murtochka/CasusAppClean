import React, { useEffect } from 'react'
import { NativeBaseProvider } from 'native-base'
import { Stack, useRouter } from 'expo-router'
import { theme } from '@/theme/theme'
import { useAuthStore } from '@/store/authStore'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { CustomSplashScreen } from '@/components/common/CustomSplashScreen'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { logger } from '@/utils/logger'

const NAVIGATION_RETRY_DELAY_MS = 500
const NAVIGATION_MAX_RETRIES = 3

export default function RootLayout() {
  const router = useRouter()
  const { isAuthenticated, isLoading, _initAuthCalled, initAuth, loadMetadata, metadataReady } = useAuthStore()
  const [initializing, setInitializing] = React.useState(true)
  const [splashProgress, setSplashProgress] = React.useState(0)
  const [navigationError, setNavigationError] = React.useState<string | null>(null)
  const hasNavigated = React.useRef(false)

  // Initialize auth and metadata on mount with parallel loading and metrics
  useEffect(() => {
    const bootstrap = async () => {
      // Mark startup beginning
      console.log('[BOOTSTRAP] 🚀 Starting app bootstrap sequence')
      logger.markStartupStart()

      try {
        if (!_initAuthCalled) {
          // Phase 1: Auth check
          console.log('[BOOTSTRAP] Phase 1: Initializing auth...')
          logger.startupMetrics('auth_start')
          await initAuth()
          console.log('[BOOTSTRAP] Phase 1: Auth initialization complete')
          logger.startupMetrics('auth_complete')
          setSplashProgress(1)

          // Phase 2: Metadata loading (in parallel, with 5s timeout)
          console.log('[BOOTSTRAP] Phase 2: Loading metadata...')
          logger.startupMetrics('metadata_start')
          const metadataPromise = loadMetadata()
          const metadataTimeoutPromise = new Promise((resolve) => 
            setTimeout(resolve, 5000)
          )
          
          await Promise.race([metadataPromise, metadataTimeoutPromise])
          console.log('[BOOTSTRAP] Phase 2: Metadata loading complete (or timed out)')
          logger.startupMetrics('metadata_complete')
          setSplashProgress(2)
        } else {
          console.log('[BOOTSTRAP] initAuth already called, skipping initialization')
        }
      } catch (error) {
        console.error('[BOOTSTRAP] ❌ Bootstrap error:', error)
        logger.warn('Bootstrap error', error)
      }

      // Phase 3: Final initialization
      console.log('[BOOTSTRAP] Phase 3: Preparing navigation...')
      logger.startupMetrics('navigation_start')
      setTimeout(() => {
        console.log('[BOOTSTRAP] Phase 3: Setting initializing=false')
        setInitializing(false)
        logger.startupMetrics('navigation_complete')
      }, 50)
    }

    bootstrap()
  }, [initAuth, loadMetadata])

  // Navigate once auth is initialized and stack is mounted
  useEffect(() => {
    console.log('[NAVIGATION] Navigation guard check:', {
      initializing,
      isLoading,
      isAuthenticated,
      hasNavigated: hasNavigated.current
    })
    
    if (!initializing && !isLoading && !hasNavigated.current) {
      const targetRoute = isAuthenticated ? '/(tabs)' : '/(auth)/login'
      console.log(`[NAVIGATION] ✅ Conditions met, navigating to: ${targetRoute}`)

      const attemptNavigation = (attempt: number) => {
        try {
          router.replace(targetRoute as any)
          hasNavigated.current = true
          setNavigationError(null)
          console.log(`[NAVIGATION] ✅ Successfully called router.replace(${targetRoute}) on attempt ${attempt + 1}`)
        } catch (error) {
          console.error(`[NAVIGATION] ❌ router.replace() failed on attempt ${attempt + 1}:`, error)
          logger.error('Navigation failed', { error, attempt: attempt + 1, targetRoute })

          if (attempt < NAVIGATION_MAX_RETRIES - 1) {
            setTimeout(() => attemptNavigation(attempt + 1), NAVIGATION_RETRY_DELAY_MS)
            return
          }

          hasNavigated.current = true
          setNavigationError('Navigation failed during app startup. Tap below to retry.')
        }
      }

      attemptNavigation(0)
    } else if (!hasNavigated.current) {
      console.log('[NAVIGATION] ⏳ Waiting for conditions...', {
        waitingFor: [
          initializing && 'initializing',
          isLoading && 'isLoading'
        ].filter(Boolean)
      })
    }
  }, [initializing, isLoading, isAuthenticated, router])

  // Show enhanced splash while initializing
  if (initializing) {
    console.log('[BOOTSTRAP] Rendering splash screen, progress:', splashProgress)
    return (
      <ErrorBoundary
        level="app"
        fallback={
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackTitle}>Startup Error</Text>
            <Text style={styles.fallbackSubtitle}>A rendering issue occurred during initialization.</Text>
          </View>
        }
        onError={(error, errorInfo) => {
          console.error('[BOOTSTRAP] ❌ Error in splash screen rendering:', error)
          console.error('[BOOTSTRAP] Error info:', errorInfo)
          logger.error('Splash screen error', { error, errorInfo })
        }}
      >
        <NativeBaseProvider theme={theme}>
          <CustomSplashScreen progress={splashProgress} />
        </NativeBaseProvider>
      </ErrorBoundary>
    )
  }

  if (navigationError) {
    return (
      <NativeBaseProvider theme={theme}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>Navigation Error</Text>
          <Text style={styles.fallbackSubtitle}>{navigationError}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              hasNavigated.current = false
              setNavigationError(null)
              setInitializing(false)
            }}
          >
            <Text style={styles.retryButtonText}>Retry Navigation</Text>
          </Pressable>
        </View>
      </NativeBaseProvider>
    )
  }

  console.log('[BOOTSTRAP] Rendering main Stack, isAuthenticated:', isAuthenticated)

  return (
    <NativeBaseProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="activity/[id]" />
        <Stack.Screen name="booking/[activityId]" />
        <Stack.Screen name="review/[bookingId]" />
      </Stack>
    </NativeBaseProvider>
  )
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D4C3C',
    paddingHorizontal: 24,
  },
  fallbackTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    color: '#E7E5E4',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FAFAF9',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#0D4C3C',
    fontSize: 15,
    fontWeight: '600',
  },
})
