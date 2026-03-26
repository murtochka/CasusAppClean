const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Minimal babel.config.js with path aliases - no custom Metro resolvers
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname, './src'),
  '@components': path.resolve(__dirname, './src/components'),
  '@screens': path.resolve(__dirname, './app'),
  '@hooks': path.resolve(__dirname, './src/hooks'),
  '@services': path.resolve(__dirname, './src/services'),
  '@store': path.resolve(__dirname, './src/store'),
  '@types': path.resolve(__dirname, './src/types'),
  '@utils': path.resolve(__dirname, './src/utils'),
  '@constants': path.resolve(__dirname, './src/constants'),
  '@assets': path.resolve(__dirname, './src/assets'),
};

module.exports = config;
