export default ({ config }) => ({
  ...config,
  name: 'casusapp',
  slug: 'casusapp',
  scheme: 'casusapp',
  version: '1.0.0',
  platforms: ['ios', 'android'],
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: 'com.casusapp.mobile',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.casusapp.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-dev-client',
      {
        launchMode: 'launcher',
      },
    ],
    'expo-router',
    [
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: 'merchant.com.casusapp.mobile',
        enableGooglePay: true,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow CasusApp to access your photos to add images to reviews',
        cameraPermission: 'Allow CasusApp to use your camera to take photos for reviews',
      },
    ],
  ],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
})
