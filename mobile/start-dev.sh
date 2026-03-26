#!/bin/bash
# Mobile Development Startup Script
# Automatically detects your machine's IP and starts Expo with correct API URL
# Works on macOS, Linux, and WSL

echo "🚀 CasusApp Mobile Development Setup"
echo "======================================"
echo ""

ANDROID_TARGET="${ANDROID_TARGET:-device}"
BACKEND_HEALTH_CONNECT_TIMEOUT_SECONDS="${BACKEND_HEALTH_CONNECT_TIMEOUT_SECONDS:-1}"
BACKEND_HEALTH_MAX_TIME_SECONDS="${BACKEND_HEALTH_MAX_TIME_SECONDS:-2}"
BACKEND_LAST_HEALTH_ENDPOINT=""
BACKEND_LAST_CURL_ERROR=""

if [[ "$ANDROID_TARGET" != "emulator" && "$ANDROID_TARGET" != "device" ]]; then
  echo "❌ Invalid ANDROID_TARGET='$ANDROID_TARGET'"
  echo "Valid values: emulator | device"
  echo "Example: ANDROID_TARGET=device ./start-dev.sh"
  exit 1
fi

# Detect OS and get machine IP address
get_machine_ip() {
  local ip=""
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: Use ifconfig - try multiple patterns to find a valid IP
    ip=$(ifconfig | grep -E "^\s+inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}')
  elif [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "linux"* ]]; then
    # Linux/WSL: Try multiple methods
    if command -v hostname &> /dev/null; then
      ip=$(hostname -I | awk '{print $1}')
    elif command -v ip &> /dev/null; then
      ip=$(ip route get 1 | sed -n 's/^.*src \([0-9.]*\) .*$/\1/p')
    fi
  fi
  
  echo "$ip"
}

check_backend_health() {
  local endpoint
  local curl_output=""

  BACKEND_LAST_HEALTH_ENDPOINT=""
  BACKEND_LAST_CURL_ERROR=""

  for endpoint in "http://localhost:3000/health" "http://localhost:3000/api/v1/health"; do
    curl_output=$(curl --silent --show-error --fail \
      --connect-timeout "$BACKEND_HEALTH_CONNECT_TIMEOUT_SECONDS" \
      --max-time "$BACKEND_HEALTH_MAX_TIME_SECONDS" \
      "$endpoint" -o /dev/null 2>&1) && {
      BACKEND_LAST_HEALTH_ENDPOINT="$endpoint"
      BACKEND_LAST_CURL_ERROR=""
      return 0
    }

    BACKEND_LAST_HEALTH_ENDPOINT="$endpoint"
    BACKEND_LAST_CURL_ERROR="$curl_output"
  done

  return 1
}

echo "🎯 Android target mode: $ANDROID_TARGET"

if [ "$ANDROID_TARGET" = "device" ]; then
  # Attempt to get IP for LAN mode
  MACHINE_IP=$(get_machine_ip)

  if [ -z "$MACHINE_IP" ] && [ -z "${EXPO_PUBLIC_API_BASE_URL:-}" ]; then
    echo "❌ Could not detect machine IP address"
    echo "Please set it manually:"
    echo "   export EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:3000/api/v1"
    echo ""
    echo "To find your IP:"
    echo "   macOS: ifconfig | grep 'inet ' | grep -v 127.0.0.1"
    echo "   Linux: hostname -I"
    echo "   WSL: ip route | grep default | awk '{print \$3}'"
    exit 1
  fi

  if [ -n "$MACHINE_IP" ]; then
    echo "✅ Detected Machine IP: $MACHINE_IP"
    echo ""
  fi

  # Set API Base URL
  if [ -z "${EXPO_PUBLIC_API_BASE_URL:-}" ] && [ -n "$MACHINE_IP" ]; then
    export EXPO_PUBLIC_API_BASE_URL="http://${MACHINE_IP}:3000/api/v1"
  fi
  export EXPO_PUBLIC_ANDROID_TARGET="device"
  if [ -n "$MACHINE_IP" ]; then
    export REACT_NATIVE_PACKAGER_HOSTNAME="$MACHINE_IP"
  fi
  EXPO_HOST_MODE="lan"
else
  export EXPO_PUBLIC_API_BASE_URL="${EXPO_PUBLIC_API_BASE_URL:-http://10.0.2.2:3000/api/v1}"
  export EXPO_PUBLIC_ANDROID_TARGET="emulator"
  unset REACT_NATIVE_PACKAGER_HOSTNAME
  EXPO_HOST_MODE="localhost"
fi

echo "📡 API Base URL: $EXPO_PUBLIC_API_BASE_URL"
echo ""

# Check if backend is running
echo "🔍 Checking if backend API is running..."
if check_backend_health; then
  echo "✅ Backend API is running on port 3000"
else
  echo "⚠️  WARNING: Backend API might not be running"
  if [ -n "$BACKEND_LAST_HEALTH_ENDPOINT" ]; then
    echo "   Last endpoint checked: $BACKEND_LAST_HEALTH_ENDPOINT"
  fi
  if [ -n "$BACKEND_LAST_CURL_ERROR" ]; then
    echo "   Last curl error: $BACKEND_LAST_CURL_ERROR"
  fi
  echo "   Start it with: cd ../my-api-project && npm start"
  echo "   (or for mock server: node src/mock-api.js)"
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""
echo "🎯 Starting Expo Dev Server..."
echo "======================================"
echo "🧩 Launch mode: Expo Development Client"
echo ""
echo "📱 Device Options:"
echo "   • Press 'a' for Android emulator/device"
echo "   • Press 'i' for iOS simulator (requires macOS + Xcode)"
echo "   • Open installed development build on physical device*"
echo ""
echo "* Physical device must be on same WiFi network as this machine"
echo "  and have the CasusApp development build installed"
echo ""

# Optional Android preflight check when adb is available
if [ "$ANDROID_TARGET" = "emulator" ] && command -v adb &> /dev/null; then
  DEVICE_COUNT=$(adb devices 2>/dev/null | grep -v "List" | grep "device$" | wc -l | tr -d ' ')
  if [ "$DEVICE_COUNT" -gt "0" ]; then
    if adb shell pm list packages 2>/dev/null | grep -q "com.casusapp.mobile"; then
      echo "✅ Android dev build installed: com.casusapp.mobile"
    else
      echo "⚠️  Android dev build missing: com.casusapp.mobile"
      echo "   Build and install first: npm run build:dev"
      echo ""
    fi
    
    # Setup adb port forwarding for emulator
    echo "🔧 Setting up adb reverse port forwarding..."
    adb reverse tcp:8082 tcp:8082 2>/dev/null && echo "   ✅ Metro bundler (8082)" || echo "   ⚠️  Metro forwarding failed"
    adb reverse tcp:3000 tcp:3000 2>/dev/null && echo "   ✅ Backend API (3000)" || echo "   ⚠️  API forwarding failed"
    echo ""
  fi
fi

# Start Expo dev client with clear cache
npx expo start --dev-client --host "$EXPO_HOST_MODE" --port 8082 --scheme casusapp --clear
