# CasusApp Mobile

React Native + Expo + TypeScript

## Features

- 🔐 **Authentication**: JWT-based auth with AsyncStorage
- 🔍 **Search**: Native search with debounce optimizations
- 📱 **Native UI**: React Native components
- 🎨 **Navigation**: Expo Router for file-based routing
- 📊 **State Management**: Zustand (shared with web)
- 🌐 **Offline Support**: AsyncStorage for metadata caching

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── screens/         # Screen components
│   ├── auth/        # Login, Register
│   ├── search/      # Search & filters
│   ├── activities/  # Activity details
│   ├── bookings/    # User bookings
│   └── profile/     # User profile
├── hooks/           # Custom React hooks
├── services/        # API clients
├── store/           # Zustand stores
├── types/           # TypeScript types
├── config/          # Environment config
└── utils/           # Utility functions
```

## Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

For iOS simulator, use `http://localhost:3000`
For Android emulator, use `http://10.0.2.2:3000`

## API Integration

Backend API should be accessible from device/emulator.

Use ngrok or similar for testing on physical devices:
```bash
ngrok http 3000
# Update .env with ngrok URL
```

## Development

- **Expo Router**: File-based routing
- **Hot Reload**: Enabled via Expo
- **TypeScript**: Strict mode
- **Platform**: iOS, Android, Web

## Tech Stack

- React Native 0.73
- Expo 50
- TypeScript 5
- Expo Router 3
- Axios
- Zustand
- AsyncStorage
- React Navigation

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Notes

- Shared types and services can be symlinked from web project
- Authentication state persists via AsyncStorage
- Search metadata cached for offline viewing
