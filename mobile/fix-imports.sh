#!/bin/bash

echo "🔧 Fixing imports in mobile/app folder..."

cd /Users/marting/Desktop/CasusApp/mobile

# Fix app folder - replace relative paths with aliases
find app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e "s|from '\.\./\.\./\.\./src/\(.*\)'|from '@/\1'|g" \
  -e "s|from '\.\./\.\./\.\./src/|from '@/|g" \
  -e "s|from '\.\./\.\./src/\(.*\)'|from '@/\1'|g" \
  -e "s|from '\.\./\.\./src/|from '@/|g" \
  -e "s|from '\.\./src/\(.*\)'|from '@/\1'|g" \
  -e "s|from '\.\./src/|from '@/|g" \
  -e "s|from '\.\.\/src/|from '@/|g" \
  -e "s|from 'src/|from '@/|g" \
  {} \;

echo "✅ app/ folder imports fixed"

echo "🔧 Fixing imports in mobile/src folder..."

# Fix src folder - standardize to use aliases where needed
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e "s|from '\.\./\.\./constants'|from '@/constants'|g" \
  -e "s|from '\.\./\.\./components/|from '@/components/|g" \
  -e "s|from '\.\./\.\./hooks/|from '@/hooks/|g" \
  -e "s|from '\.\./\.\./services/|from '@/services/|g" \
  -e "s|from '\.\./\.\./store/|from '@/store/|g" \
  -e "s|from '\.\./\.\./types/|from '@/types/|g" \
  -e "s|from '\.\./\.\./utils/|from '@/utils/|g" \
  -e "s|from '\.\./\.\./theme/|from '@/theme/|g" \
  -e "s|from '\.\./constants'|from '@/constants'|g" \
  -e "s|from '\.\./components/|from '@/components/|g" \
  -e "s|from '\.\./hooks/|from '@/hooks/|g" \
  -e "s|from '\.\./services/|from '@/services/|g" \
  -e "s|from '\.\./store/|from '@/store/|g" \
  -e "s|from '\.\./types/|from '@/types/|g" \
  -e "s|from '\.\./utils/|from '@/utils/|g" \
  -e "s|from '\.\./theme/|from '@/theme/|g" \
  {} \;

echo "✅ src/ folder imports fixed"

echo "🎉 All imports standardized!"
