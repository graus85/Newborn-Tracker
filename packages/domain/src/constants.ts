// Event type metadata
export const EVENT_TYPES = {
  feed: {
    name: 'Feed',
    icon: '🍼',
    color: '#4CAF50',
    lightColor: '#C8E6C9',
  },
  diaper: {
    name: 'Diaper',
    icon: '👶',
    color: '#FF9800',
    lightColor: '#FFE0B2',
  },
  sleep: {
    name: 'Sleep',
    icon: '😴',
    color: '#9C27B0',
    lightColor: '#E1BEE7',
  },
  vitamin: {
    name: 'Vitamin',
    icon: '💊',
    color: '#2196F3',
    lightColor: '#BBDEFB',
  },
  weight: {
    name: 'Weight',
    icon: '⚖️',
    color: '#F44336',
    lightColor: '#FFCDD2',
  },
  height: {
    name: 'Height',
    icon: '📏',
    color: '#795548',
    lightColor: '#D7CCC8',
  },
  other: {
    name: 'Other',
    icon: '📝',
    color: '#607D8B',
    lightColor: '#CFD8DC',
  },
} as const;

// Unit conversion constants
export const ML_PER_OZ = 29.5735;

// Time constants
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

// Validation limits
export const VALIDATION_LIMITS = {
  feed: {
    amount: { min: 1, max: 1000 },
    duration: { min: 1, max: 7200 }, // 2 hours in seconds
  },
  weight: {
    kg: { min: 0.5, max: 50 },
  },
  height: {
    cm: { min: 30, max: 150 },
  },
  note: {
    maxLength: 500,
  },
  name: {
    maxLength: 100,
  },
} as const;

// Default values
export const DEFAULT_VALUES = {
  feed: {
    method: 'bottle' as const,
    unit: 'ml' as const,
  },
  diaper: {
    pee: false,
    poop: false,
  },
  userPreferences: {
    theme: 'light' as const,
    units: 'ml' as const,
    notifications_enabled: true,
  },
} as const;

// Export formats
export const EXPORT_FORMATS = {
  json: {
    extension: 'json',
    mimeType: 'application/json',
    name: 'JSON',
  },
  csv: {
    extension: 'csv',
    mimeType: 'text/csv',
    name: 'CSV',
  },
  html: {
    extension: 'html',
    mimeType: 'text/html',
    name: 'HTML Report',
  },
  pdf: {
    extension: 'pdf',
    mimeType: 'application/pdf',
    name: 'PDF Report',
  },
} as const;

// API endpoints (relative paths)
export const API_ENDPOINTS = {
  auth: {
    signUp: '/auth/v1/signup',
    signIn: '/auth/v1/token?grant_type=password',
    signOut: '/auth/v1/logout',
    refresh: '/auth/v1/token?grant_type=refresh_token',
    user: '/auth/v1/user',
  },
  rest: {
    feeds: '/rest/v1/feeds',
    diapers: '/rest/v1/diapers',
    sleeps: '/rest/v1/sleeps',
    vitamins: '/rest/v1/vitamins',
    weights: '/rest/v1/weights',
    heights: '/rest/v1/heights',
    others: '/rest/v1/others',
    profiles: '/rest/v1/profiles',
    dailySummary: '/rest/v1/daily_summary',
  },
} as const;

// Storage keys
export const STORAGE_KEYS = {
  auth: 'supabase.auth.token',
  userPreferences: 'user-preferences',
  babyProfile: 'baby-profile',
  lastSync: 'last-sync',
  syncQueue: 'sync-queue',
  offlineData: 'offline-data',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  FEED_REMINDER: 'feed_reminder',
  VITAMIN_REMINDER: 'vitamin_reminder',
  SLEEP_TIME: 'sleep_time',
  DATA_SYNC: 'data_sync',
  ERROR: 'error',
} as const;

// Chart colors
export const CHART_COLORS = {
  primary: '#2196F3',
  secondary: '#FF9800',
  success: '#4CAF50',
  warning: '#FF5722',
  error: '#F44336',
  info: '#00BCD4',
  light: '#F5F5F5',
  dark: '#424242',
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  multipleChildren: false,
  growthPercentiles: false,
  aiInsights: false,
  familySharing: false,
  healthcareIntegration: false,
  wearableSync: false,
} as const;

// App metadata
export const APP_METADATA = {
  name: 'Baby Tracker',
  version: '1.0.0',
  description: 'Track your baby\'s daily activities and health',
  author: 'Baby Tracker Team',
  supportEmail: 'support@babytracker.app',
  privacyPolicyUrl: '/privacy',
  termsOfServiceUrl: '/terms',
} as const;
