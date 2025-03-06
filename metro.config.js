const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add image file extensions and other asset types
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'wav',
  'mp3'
];

// Disable source maps in production to reduce memory usage
config.transformer.minifierConfig.sourceMap = process.env.NODE_ENV !== 'production';

// Add expo-router to watchFolders
config.watchFolders = [
  ...config.watchFolders || [],
  path.resolve(__dirname, 'node_modules/expo-router')
];

// Add expo-router to extraNodeModules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'expo-router': path.resolve(__dirname, 'node_modules/expo-router')
};

// Optimize for development
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];
config.resolver.platforms = ['ios', 'android', 'web'];

// Fix for cache store issue
config.cacheStores = undefined;

// Reduce memory usage to prevent out of bounds errors
config.maxWorkers = 1; // Reduce to 1 worker to minimize memory usage
config.transformer.workerPath = require.resolve('metro/src/DeltaBundler/Worker');
config.transformer.maxWorkers = 1;

// Disable unnecessary features to reduce memory usage
config.transformer.enableBabelRuntime = false;
config.resolver.useWatchman = false;
config.resolver.blockList = /node_modules\/\.cache\/.*/;

// Increase Node.js memory limit
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--max-old-space-size=4096';

module.exports = config;