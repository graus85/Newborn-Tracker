import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Baby Tracker',
  slug: 'baby-tracker',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.babytracker.app',
    buildNumber: '1.0.0',
    infoPlist: {
      NSUserNotificationUsageDescription: 'This app uses notifications to remind you about feeding times and other important baby care activities.',
      NSCameraUsageDescription: 'This app uses the camera to take photos of your baby for milestone tracking.',
      NSPhotoLibraryUsageDescription: 'This app accesses your photo library to save and view baby photos.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.babytracker.app',
    versionCode: 1,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
      'com.android.alarm.permission.SET_ALARM',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-sqlite',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ffffff',
      },
    ],
  ],
  scheme: 'baby-tracker',
  experiments: {
    tsconfigPaths: true,
  },
  extra: {
    eas: {
      projectId: 'your-eas-project-id',
    },
  },
});
