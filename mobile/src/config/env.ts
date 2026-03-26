import { Platform } from 'react-native'

// Environment configuration for React Native
// For physical device: set EXPO_PUBLIC_API_BASE_URL=http://<YOUR_MACHINE_IP>:3000/api/v1
// Example: http://192.168.1.100:3000/api/v1

const getAndroidTarget = (): 'emulator' | 'device' | '' => {
  const target = process.env.EXPO_PUBLIC_ANDROID_TARGET?.trim().toLowerCase()
  if (target === 'emulator' || target === 'device') {
    return target
  }

  return ''
}

// Detect if running on physical device or simulator
const getApiBaseUrl = (): string => {
  const androidTarget = getAndroidTarget()
  const isAndroidEmulatorMode = __DEV__ && Platform.OS === 'android' && androidTarget === 'emulator'
  const isAndroidDeviceMode = __DEV__ && Platform.OS === 'android' && androidTarget === 'device'

  // Check environment variable first (takes priority)
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()
  if (envUrl) {
    const isEmulatorOnlyUrl = envUrl.includes('10.0.2.2')

    if (isAndroidDeviceMode && isEmulatorOnlyUrl) {
      console.warn(
        '[ENV] EXPO_PUBLIC_API_BASE_URL uses 10.0.2.2 while EXPO_PUBLIC_ANDROID_TARGET=device. '
          + '10.0.2.2 is emulator-only. Use your LAN IP for physical devices.'
      )
    }

    if (__DEV__ && Platform.OS === 'android' && !androidTarget && isEmulatorOnlyUrl) {
      console.warn(
        '[ENV] EXPO_PUBLIC_API_BASE_URL uses emulator host 10.0.2.2 but EXPO_PUBLIC_ANDROID_TARGET is not set. '
          + 'Set EXPO_PUBLIC_ANDROID_TARGET=emulator or use a LAN API URL for physical devices.'
      )
    }

    // Android emulator cannot reach host via localhost/127.0.0.1
    if (isAndroidEmulatorMode) {
      if (envUrl.includes('localhost')) {
        return envUrl.replace('localhost', '10.0.2.2')
      }

      if (envUrl.includes('127.0.0.1')) {
        return envUrl.replace('127.0.0.1', '10.0.2.2')
      }
    }

    return envUrl
  }

  // Sensible defaults for local development
  // Android emulator cannot reach host via localhost
  if (isAndroidEmulatorMode) {
    return 'http://10.0.2.2:3000/api/v1'
  }

  // iOS simulator / web / fallback
  return 'http://localhost:3000/api/v1'
}

export const ENV = {
  API_BASE_URL: getApiBaseUrl(),
  APP_NAME: 'CasusApp',
  APP_VERSION: '0.1.0',
  isDev: __DEV__,
  isProd: !__DEV__,
}

export default ENV
