#!/bin/bash
# CasusApp Metro Recovery Script
# Run this when Metro bundler needs to be restarted

set -e

echo "🔄 Metro Bundler Recovery"
echo "========================"

# Kill any existing processes
echo "Killing existing processes..."
pkill -9 -f "expo start" || true
pkill -9 -f "npm run dev" || true
sleep 2

# Change to mobile directory
cd /Users/marting/Desktop/CasusApp/mobile

# Verify index.js exists
if [ ! -f "index.js" ]; then
    echo "⚠️  index.js missing - creating it..."
    echo 'import "expo-router/entry";' > index.js
else
    echo "✅ index.js found"
fi

# Clear caches
echo "Clearing caches..."
rm -rf .expo
watchman watch-del-all 2>/dev/null || true

# Start Metro
echo "▶️  Starting Metro bundler on port 8082..."
npm run dev:android:8082

# The process will run in foreground - press Ctrl+C to stop
