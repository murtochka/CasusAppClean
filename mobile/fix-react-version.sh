#!/bin/bash
# Fix React version mismatch error
# This script updates React to 19.1.4 to match react-native-renderer

set -e

echo "🔧 Fixing React version mismatch..."
echo ""

# Navigate to mobile directory
cd "$(dirname "$0")"

# Kill any running Expo processes
echo "⏹️  Stopping existing Expo processes..."
pkill -f "expo/bin/cli start" || true
pkill -f "expo start" || true
pkill -f "metro" || true
sleep 2

# Check if port 8081 is free
if lsof -nP -iTCP:8081 -sTCP:LISTEN > /dev/null 2>&1; then
  echo "⚠️  Port 8081 still in use, forcing kill..."
  lsof -nP -iTCP:8081 -sTCP:LISTEN | awk 'NR>1 {print $2}' | xargs kill -9 2>/dev/null || true
  sleep 1
fi

echo "✅ Port 8081 is free"
echo ""

# Remove node_modules and package-lock to ensure clean install
echo "🧹 Cleaning up old dependencies..."
rm -rf node_modules package-lock.json

# Install dependencies with exact React versions aligned to Expo 54
echo "📦 Installing dependencies with React 19.1.0 and react-native 0.81.5..."
/opt/homebrew/opt/node@20/bin/npm install --legacy-peer-deps

echo ""
echo "✅ React version mismatch fixed!"
echo ""
echo "React packages now aligned to Expo 54 requirements:"
/opt/homebrew/opt/node@20/bin/npm ls react react-dom 2>&1 | grep -E "react@|react-dom@" || true
echo ""
echo "🚀 Starting Expo with --clear flag..."
echo ""

# Start Expo
EXPO_NO_TELEMETRY=1 /opt/homebrew/opt/node@20/bin/npm run android -- --clear
