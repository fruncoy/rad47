import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Radio-47",
  slug: "radio47",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/Logo.png",
  scheme: "radio-47",
  userInterfaceStyle: "automatic",
  owner: "kitinda",
  splash: {
    image: "./assets/images/Logo.png",
    resizeMode: "contain",
    backgroundColor: "#1E3EA1"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.radio47.app",
    infoPlist: {
      UIBackgroundModes: ["audio", "fetch", "remote-notification"],
      NSMicrophoneUsageDescription: "This app does not need access to the microphone.",
      NSCameraUsageDescription: "This app does not need access to the camera.",
      NSPhotoLibraryUsageDescription: "This app needs access to the photo library to save your favorite shows.",
      NSPhotoLibraryAddUsageDescription: "This app needs access to the photo library to save your favorite shows."
    }
  },
  android: {
    package: "com.radio47.app",
    versionCode: 20,
    adaptiveIcon: {
      foregroundImage: "./assets/images/Logo.png",
      backgroundColor: "#1E3EA1"
    },
    permissions: [
      "INTERNET",
      "WAKE_LOCK",
      "FOREGROUND_SERVICE",
      "POST_NOTIFICATIONS"
    ],
    softwareKeyboardLayoutMode: "pan",
    allowBackup: true,
    blockedPermissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.CAMERA",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION"
    ]
  },
  plugins: [
    "expo-router",
    [
      "expo-notifications",
      {
        "icon": "./assets/images/Logo.png",
        "color": "#1E3EA1",
        "sounds": ["./assets/sounds/notification.wav"]
      }
    ],
    "expo-asset",
    "expo-font"
  ],
  experiments: {
    typedRoutes: true
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/Logo.png"
  },
  extra: {
    eas: {
      projectId: "15a5db5d-9646-4250-8649-ba8bdfc5773c"
    }
  }
});