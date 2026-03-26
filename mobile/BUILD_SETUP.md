# Development Build Setup Guide

This guide walks you through setting up and using Expo Development Builds for the CasusApp mobile application. Development builds are required because the app uses native modules (Stripe payments, image picker) that are not supported in the standard Expo Go app.

## 📋 Prerequisites

- **Expo account**: Sign up at https://expo.dev if you don't have one
- **EAS CLI**: Already installed globally (`eas-cli`)
- **Node.js & npm**: Already installed
- **Android**: Android Emulator or physical device with "Install from Unknown Sources" enabled
- **iOS (Simulator)**: macOS with Xcode & iOS Simulator
- **iOS (Physical Device)**: 
  - Apple Developer account ($99/year) - required for cloud builds via EAS
  - macOS with Xcode installed
  - Physical device with development certificates setup
  - See "iOS Physical Device Setup" section below

## ✅ Configuration Complete

**Run all EAS CLI commands from this `mobile/` directory** (where [eas.json](./eas.json) and `package.json` live). From the repository root, use `cd mobile` first, or run `npm run eas:production` / `eas:preview` / `eas:dev-device` from the repo root [package.json](../package.json).

The following configuration has already been completed:

- ✅ [app.config.ts](./app.config.ts) - Configured with bundle identifiers and native plugins
- ✅ [eas.json](./eas.json) - Build profiles configured for development, preview, and production
- ✅ [package.json](./package.json) - Development build scripts added
- ✅ `expo-dev-client` - Installed as dependency

## 🔑 EAS & Apple Developer Account Requirements

### For Android Development
- **No cost** - EAS builds for free with internal distribution
- EAS account required (free tier available)
- Simple keystore management handled by EAS

### For iOS Development (Important!)

**Simulator Only:**
- Free - use EAS or local Xcode builds
- No developer account needed
- Can build locally with `eas build --local` command

**Physical Device Testing:**
- **Requires Apple Developer Program** ($99/year)
- https://developer.apple.com/programs/
- Cannot use free Apple Developer account for cloud builds
- EAS will request your Apple ID to create certificates

**First iOS Build Timeline:**
- Setup: 10-15 minutes (certificate generation)
- Build time: 20-30 minutes (first time is slower)
- Subsequent builds: 10-15 minutes

### Skip to Your Scenario

- ✅ **Android Emulator Only?** → Jump to "Step 1"
- ✅ **iOS Simulator Only?** → Jump to "Step 1" 
- ✅ **Android Physical Device?** → Jump to "Step 1"
- ⚠️ **iOS Physical Device?** → Get Apple Developer account first, then continue

## 🔑 Step 1: Obtain Stripe API Keys

You need Stripe test keys for payment processing.

### Option A: Use Existing Stripe Account
1. Log in to https://dashboard.stripe.com
2. Navigate to **Developers → API Keys**
3. Copy the **Publishable key** (starts with `pk_test_...`)

### Option B: Create New Stripe Account
1. Sign up at https://stripe.com
2. Complete account setup (test mode is available immediately)
3. Navigate to **Developers → API Keys**
4. Copy the **Publishable key** (starts with `pk_test_...`)

### Configure Environment Variable
Edit [.env](./.env) and replace the placeholder:

```bash
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
```

⚠️ **Important**: Never commit real API keys to version control. The `.env` file should be git-ignored.

## 🔐 Step 2: Login to EAS

Authenticate with your Expo account:

```bash
cd mobile
eas login
```

Enter your Expo credentials when prompted.

### Verify Login
```bash
eas whoami
```

This should display your Expo username.

## 🏗️ Step 3: Build Development Build

### Build for Both Platforms (Recommended)
```bash
npm run build:dev
```

This runs: `eas build --profile development_device --platform all`

Note: after changes to `app.config.ts` plugins (such as `expo-dev-client` launch mode), install a newly built dev APK so native config changes take effect.

### Build for Specific Platform
```bash
# Android only
eas build --profile development_device --platform android

# Android emulator-specific build
eas build --profile development_emulator --platform android

# iOS only  
eas build --profile development_device --platform ios
```

### What Happens During Build
- EAS creates cloud builds (~15-20 minutes for first build)
- You'll be prompted to set up credentials:
  - **iOS**: Apple Developer account (can use free tier for development)
  - **Android**: EAS manages keystore automatically
- Build artifacts are uploaded to EAS dashboard
- You'll receive a URL to download the builds

### Build Output
- **Android**: `.apk` file (can install directly on devices/emulator)
- **iOS**: `.app` file (for simulator) or `.ipa` file (for device)

## � EAS Build Profiles Reference

The [eas.json](./eas.json) file (next to this app’s `package.json`) contains multiple build profiles for various scenarios:

### 1. **development** (⭐ Recommended for Development)
**Use Case:** Local development with native modules support
- **Dev Client:** ✅ Enabled - includes `expo-dev-client` 
- **Distribution:** Internal (team only)
- **Output:** APK (Android), .app (iOS Simulator)
- **Android Target:** Device-safe default (`EXPO_PUBLIC_ANDROID_TARGET=device`)
- **Environment:** Development mode with logging
- **Typical Use:** Backward-compatible alias; prefer explicit `development_device` profile

### 2. **development_device** (⭐ Recommended for Physical Devices)
**Use Case:** Physical Android/iOS development build usage
- **Dev Client:** ✅ Enabled
- **Distribution:** Internal
- **Android Target:** Device mode (LAN/API values supplied when starting Metro)
- **Dev Launcher Mode:** `launcher` (prevents stale localhost recent sessions)
- **Typical Use:** `npm run build:dev` or `npm run build:dev:device`

### 3. **development_emulator** (Android Emulator)
**Use Case:** Emulator-first Android development
- **Dev Client:** ✅ Enabled
- **Distribution:** Internal
- **Android Target:** Emulator mode (`10.0.2.2` + localhost workflow)
- **Typical Use:** `npm run build:dev:emulator`

### 4. **preview** (Testing & QA)
**Use Case:** Quick preview builds for testing without dev client
- **Dev Client:** ❌ Disabled
- **Output:** APK (Android), simulator app (iOS)
- **Limitations:** No hot reload, native modules fully bundled
- **Build Time:** Faster than development
- **When to Use:** Quick builds for QA testing

### 5. **preview2** (Release Testing)
**Use Case:** Test production-like build settings
- **Dev Client:** ❌ Disabled
- **Gradle Command:** assembleRelease (Android release build)
- **Output:** Optimized APK
- **Build Time:** Slower (optimization step)
- **When to Use:** Before pushing to production, test optimized APK

### 6. **preview3** (Alt Development Build)
**Use Case:** Alternative development profile
- **Dev Client:** ✅ Enabled
- **Purpose:** Backup development profile if main fails
- **Configuration:** Minimal setup
- **When to Use:** Emergency fallback if main development profile has issues

### 7. **production** (App Store/Play Store)
**Use Case:** Final production release builds
- **Dev Client:** ❌ Disabled
- **App Store Ready:** ✅ Yes (iOS) / ✅ Yes (Android)
- **Bundle ID:** `com.casusapp.mobile`
- **Output:** AAB (Android for Play Store), IPA (iOS for App Store)
- **Build Time:** 30+ minutes (full optimization)
- **When to Use:** Release to app stores only
- **⚠️ Important:** Use only for public releases

## Quick Profile Selection Guide

| Scenario | Profile | Command |
|----------|---------|---------|
| Local development on physical device | development_device | `npm run build:dev` |
| Local development on Android emulator | development_emulator | `npm run build:dev:emulator` |
| QA testing without dev features | preview | `eas build --profile preview` |
| Test release-optimized APK | preview2 | `eas build --profile preview2` |
| Emergency dev build | preview3 | `eas build --profile preview3` |
| Production release | production | `eas build --profile production` |

## �📱 Step 4: Install Development Build

### Android Emulator

1. Start your Android emulator
2. Download the `.apk` from EAS build page
3. Install using adb:
   ```bash
   adb install path/to/casusapp.apk
   ```

### Android Physical Device

1. Download the `.apk` from EAS build page (scan QR code on phone)
2. Enable "Install from Unknown Sources" in device settings
3. Open the `.apk` file to install

### iOS Simulator (Mac Only)

1. Download the `.app` file from EAS build page
2. Unzip if necessary
3. Drag the `.app` file onto the running iOS Simulator window

### iOS Physical Device

#### Prerequisites for iOS Device Testing
- **Apple Developer Account** ($99/year) - Required for building on real devices
  - Not needed for simulator testing
  - Free tier does not support cloud builds
  - Sign up at: https://developer.apple.com
- **Physical iPhone/iPad** running iOS 14+
- **Xcode** installed on macOS
- **Trusted device**: Device must be trusted by your computer for development

#### Step 1: Get Device Identifier (UDID)
1. Connect iPhone to Mac via USB
2. Open Xcode → Window → Devices and Simulators
3. Select your device from the left panel
4. Copy the **Identifier** (40-character hex string)
   - Example: `12345678901234567890123456789012abcdef01`

#### Step 2: Register Device with Apple Developer
1. Log in to: https://developer.apple.com/account
2. Navigate to: Certificates, Identifiers & Profiles → Devices
3. Click "Add Device" (+ button)
4. Enter:
   - **Device Name**: e.g., "Martin's iPhone" (for your reference)
   - **Device Identifier (UDID)**: Paste the 40-char ID from Step 1
5. Click "Continue" → "Register" → "Done"

#### Step 3: Create Ad-Hoc Provisioning Profile (Option A: Local Build)
If building locally with credentials managed:

1. Go to: Certificates, Identifiers & Profiles → Provisioning Profiles
2. Click "+" → Create new profile
3. Select: **App ID** = `com.casusapp.mobile`
4. Select your certificate
5. Select the device you registered
6. Name it: "CasusApp Dev (Device)"
7. Download the `.mobileprovision` file

#### Step 4: Build for Device via EAS (Recommended)
This is the **easiest method** - EAS handles credentials:

```bash
# Build for iOS device
eas build --profile development_device --platform ios

# When prompted during first build:
# - EAS will ask about Apple Developer credentials
# - Enter your Apple ID and password
# - EAS creates certificates and provisioning profiles on your account
# - Allow EAS to manage these automatically
```

**If you have existing credentials:**
```bash
# Use existing certificate/key
eas build --profile development_device --platform ios --non-interactive
```

#### Step 5: Install on Device via EAS
1. Build completes - you'll see a QR code
2. Scan QR code with iPhone's camera app
3. Click notification → "Install"
4. You'll be prompted for developer mode confirmation:
   - Go to: Settings → Privacy & Security → Developer Mode
   - Toggle "Developer Mode" ON
   - Confirm when prompted
5. App installs automatically

**Alternative: Manual via TestFlight (Requires Enterprise)**
```bash
# For production use, configure TestFlight in eas.json
# Requires Apple Developer + TestFlight setup
```

#### Step 6: Enable Developer Mode on Device
All iOS 16+ devices require developer mode enabled:

1. On Device: Settings → Privacy & Security
2. Scroll down to "Developer Mode"
3. Toggle ON
4. Restart device when prompted
5. Device is now ready for development

#### Step 7: Run Dev Server on Device
After build installs and dev mode is enabled:

```bash
cd /Users/marting/Desktop/CasusApp/mobile

# Start development server
npm run dev:ios

# Device should connect and display app
# Press 'r' in terminal to reload
```

#### Step 8: Trust Developer Certificate (If Prompted)
If you see "Untrusted Enterprise Developer":

1. On Device: Settings → General → Device Management
2. Select your developer certificate
3. Tap "Trust"
4. Confirm in popup

#### Troubleshooting iOS Device Connection

**"Device not found" in Xcode:**
- Trust certificate on device first (Step 8)
- Reconnect USB cable
- Restart Xcode

**"App crashes on device:"**
- Check: Settings → Privacy & Security → Developer Mode is ON
- Verify device is registered at developer.apple.com/account
- Check device has same bundle ID: `com.casusapp.mobile`

**"Cannot connect to Metro bundler:"**
- Ensure device is on same WiFi as Mac
- Check: `lsof -i:8081` (Metro runs on port 8081)
- Device must be on same local network

**"Build fails on EAS (iOS):"**
- Verify Apple ID is added to eas.json
- Check: `eas credentials` command shows valid certs
- Try: `eas build --profile development_device --platform ios --clear-cache`

## 🚀 Step 5: Run Development Server

After installing the development build, start the Metro bundler:

### Android
```bash
npm run dev:android
```

This runs: `expo start --dev-client --android`

### iOS
```bash
npm run dev:ios
```

This runs: `expo start --dev-client --ios`

### Important Notes
- **DO NOT** use `npm start` or `npm run android` - these try to use Expo Go
- Always use `dev:android` or `dev:ios` scripts with development builds
- The dev build app must already be installed on the device
- Press `r` to reload, `m` to open dev menu

## ✅ Step 6: Verify Native Features

Test that native modules are working correctly:

### Test Stripe Payment
1. Navigate through app: Home → Activity Details → Book Activity
2. Fill booking details and proceed to payment
3. Verify **native payment sheet UI** appears (not web view)
4. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
5. Complete payment and verify success

### Test Image Picker
1. Complete a booking (or use existing booking)
2. Navigate to Reviews section
3. Tap "Add Photo" button
4. Verify **native permission dialog** appears
5. Grant camera/photo library access
6. Select or take a photo
7. Verify photo preview displays correctly

### Test Other Features
- Location permissions (if using activity maps)
- Network connectivity detection
- Secure storage (auth tokens persist)
- Haptic feedback on interactions

## 🔄 Daily Development Workflow

```bash
# 1. Pull latest code
git pull

# 2. Install any new dependencies
npm install

# 3. Start dev server (build already installed)
npm run dev:android   # or dev:ios

# 4. Develop with Fast Refresh
# Changes appear in app automatically
```

**When to rebuild:**
- Added new native dependency
- Changed app.config.ts plugins
- Changed bundle identifier
- Modified native permissions
- After several weeks (to get latest patches)

## 🐛 Troubleshooting

### Issue: "Unable to connect to Metro bundler"

**Solution:**
```bash
# Check Metro is running on correct port
lsof -i:8081

# Restart with clean cache
npx expo start --dev-client --clear
```

### Issue: "Development build has expired"

Development builds typically expire after 30 days.

**Solution:**
```bash
npm run build:dev  # Build fresh version
```

### Issue: "Stripe payment sheet not appearing"

**Causes:**
- Missing or invalid `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env`
- Backend not returning payment intent correctly
- Network connectivity issue

**Solution:**
```bash
# Verify environment variable is loaded
npx expo config --type public | grep STRIPE

# Check backend is running
curl http://localhost:3000/api/v1/health

# Restart Metro bundler
npm run dev:android  
```

### Issue: "Image picker permissions not working"

**Cause:** Plugin configuration not applied during build

**Solution:**
```bash
# Rebuild with updated plugin config
eas build --profile development_device --platform android --clear-cache
```

### Issue: "App crashes on launch"

**Debug steps:**
```bash
# Android logs
adb logcat | grep ReactNativeJS

# iOS logs (use Xcode)
xcrun simctl spawn booted log stream --predicate 'process == "Expo"'

# Check for missing environment variables
npx expo config --type public
```

### Issue: "EAS build fails"

**Common causes:**
- Invalid credentials (iOS)
- Network timeout
- eas.json configuration error

**Solution:**
```bash
# Re-authenticate
eas logout && eas login

# Rebuild with fresh credentials
eas build --profile development_device --platform android --clear-cache
```

## 📊 Build Status & Management

### Check Build Status
```bash
eas build:list
```

### View Specific Build
```bash
eas build:view BUILD_ID
```

### Cancel Running Build
```bash
eas build:cancel
```

## 🔧 Environment Variables Reference

Current environment variables (from [.env](./.env)):

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API URL | `http://192.168.1.100:3000/api/v1` (device) or `http://10.0.2.2:3000/api/v1` (emulator) |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe payments | `pk_test_...` |
| `EXPO_PUBLIC_ANDROID_TARGET` | Android network mode | `device` or `emulator` |

⚠️ All `EXPO_PUBLIC_*` variables are embedded in the build and exposed to client.

## 📱 Device Access URLs

When using **Android Emulator**, use:
```
http://10.0.2.2:3000  # Maps to localhost on host machine
```

When using **Physical Device** (same network), use:
```
http://192.168.X.X:3000  # Your machine's local IP
```

Update `EXPO_PUBLIC_API_BASE_URL` in `.env` accordingly and **rebuild**.

## 🚢 Production Builds

For app store submission, use production profile:

```bash
# Both platforms
eas build --profile production --platform all

# Specific platform
eas build --profile production --platform ios
eas build --profile production --platform android
```

See [Documentation/PHASE_7_APP_STORE_SUBMISSION.md](../Documentation/PHASE_7_APP_STORE_SUBMISSION.md) for submission guide.

## 📚 Additional Resources

- [Expo Development Builds Docs](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Stripe React Native Setup](https://github.com/stripe/stripe-react-native)
- [Expo Image Picker Docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Project Quick Start](./MOBILE_QUICK_START.md)
- [Developer Cheatsheet](./MOBILE_DEVELOPER_CHEATSHEET.md)

## ❓ Need Help?

1. Check [build logs on EAS dashboard](https://expo.dev/)
2. Review this troubleshooting section
3. Check existing project documentation in `/Documentation`
4. Search [Expo Forums](https://forums.expo.dev/)

---

**Next Steps**: Complete Steps 1-6 above, then begin daily development with the new development build! 🎉
