# Android Development Quick Start

## One-Command Solution ✨

### Emulator / USB debugging flow
```bash
./start-android.sh
```

This script automatically:
- ✅ Checks for connected Android device/emulator
- ✅ Configures adb reverse port forwarding (8082 & 3000)
- ✅ Cleans up old processes and caches
- ✅ Starts Mock API on port 3000
- ✅ Starts Expo Metro on port 8082
- ✅ Opens Android app automatically

### Physical device on WiFi (dev-client APK)
```bash
bash start-dev.sh
```

This mode automatically:
- ✅ Starts backend on port 3000
- ✅ Starts Expo Metro in LAN host mode on port 8082
- ✅ Sets `EXPO_PUBLIC_API_BASE_URL` to your machine LAN IP
- ✅ Avoids emulator-only `10.0.2.2` routing

`start-dev.sh` now auto-detects a connected physical Android device and prefers device mode.
Use explicit overrides when needed:

```bash
ANDROID_TARGET=device bash start-dev.sh
ANDROID_TARGET=emulator bash start-dev.sh
```

---

## Manual Steps (if needed)

### 1. Start Development Environment
```bash
cd /Users/marting/Desktop/CasusApp
bash start-dev.sh                         # auto-detect: physical device first, else emulator
# Optional explicit override:
ANDROID_TARGET=device bash start-dev.sh   # force physical device (WiFi)
ANDROID_TARGET=emulator bash start-dev.sh # force emulator/adb reverse
```

### 2. Configure Android Port Forwarding (Emulator / USB only)
```bash
adb reverse tcp:8082 tcp:8082
adb reverse tcp:3000 tcp:3000
```

### 3. Configure Android Dev Settings
In the Android app:
- Open Dev Menu: Shake device or `Cmd+M` (emulator)
- Go to **Settings**
- Set **Debug server host & port** to:
  - Emulator: `10.0.2.2:8082`
  - Physical device on same network: `<your-mac-ip>:8082`
  - Or **clear the field** to use default localhost (if adb reverse is working)

---

## Troubleshooting Connection Refused

### Issue: "Could not connect to development server" or "ECONNREFUSED"

**Quick Fix:**
```bash
# Kill all dev servers
pkill -f "expo|metro|mock-api"

# Emulator flow
./start-android.sh

# Physical device flow (WiFi)
ANDROID_TARGET=device bash start-dev.sh
```

### Issue: "Failed to connect to localhost / 127.0.0.1:8082" (Physical Device)

This means the app is still trying to use a stale localhost dev-server URL.

1. Restart Metro in device mode:
   ```bash
   ANDROID_TARGET=device bash start-dev.sh
   ```
2. In the app Dev Menu -> **Settings** -> **Debug server host & port**, clear `127.0.0.1:8082`.
3. Re-open the app from the current Metro session (QR/launcher), not from an old recent entry.
4. If the app still defaults to localhost, install a fresh dev APK built with the latest config:
   ```bash
   cd mobile
   npm run build:dev:device
   ```
5. Open the app by scanning the Metro QR from the current terminal session so it uses the active LAN URL.

**If still failing:**

1. **Verify emulator is running:**
   ```bash
   adb devices
   ```
   Should show at least one device with status "device"

2. **Check port forwarding:**
   ```bash
   adb reverse --list
   ```
   Should show: `tcp:8082 tcp:8082`

3. **Re-apply port forwarding:**
   ```bash
   adb reverse --remove-all
   adb reverse tcp:8082 tcp:8082
   adb reverse tcp:3000 tcp:3000
   ```

4. **Clear app data:**
   - In Android Dev Menu → **Reload** (or `R` in Metro terminal)
   - Or: Settings → Apps → CasusApp → Storage → Clear Data

5. **Check Metro is on correct port:**
   ```bash
   lsof -iTCP:8082 -sTCP:LISTEN
   ```
   Should show node process listening on 8082

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `./start-android.sh` | **Recommended** - Auto-configures everything for Android |
| `bash start-dev.sh` | Root script with auto target detection (device-first, then emulator fallback) |
| `ANDROID_TARGET=emulator bash start-dev.sh` | Root script in emulator mode (localhost + adb reverse) |
| `ANDROID_TARGET=device bash start-dev.sh` | Root script in physical-device mode (LAN host + LAN API URL) |
| `bash restart-all.sh` | Legacy script - restarts all services |

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Mock API | 3000 | http://localhost:3000 |
| Expo Metro | 8082 | http://localhost:8082 |

**Android Virtual Device (AVD) Access:**
- Use `10.0.2.2` instead of `localhost` if adb reverse fails
- Example: http://10.0.2.2:8082

---

## Common Dev Menu Commands

In Metro terminal:
- `a` - Open on Android
- `r` - Reload app
- `m` - Toggle menu
- `d` - Show developer menu
- Press `Ctrl+C` to stop

In Android app (Dev Menu):
- Shake device or `Cmd+M` (emulator)
- `Reload` - Refresh JavaScript bundle
- `Debug` - Open Chrome DevTools
- `Settings` - Configure server host/port

---

## Quick Test

After running `./start-android.sh`, verify:

1. **Mock API Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok", ...}`

2. **Metro Running:**
   Visit http://localhost:8082 in browser
   Should show Metro bundler status page

3. **Android Connection:**
   Open app - you should see login screen with no errors

---

**Created:** 4 March 2026  
**Last Updated:** 7 March 2026
