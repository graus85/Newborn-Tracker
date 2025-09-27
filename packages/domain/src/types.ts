export type EventType = 'feed' | 'diaper' | 'sleep' | 'vitamin' | 'weight' | 'height' | 'other';

export interface BaseEvent {
  id: string;
  user_id?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  created_at?: string; // ISO datetime string
  updated_at?: string; // ISO datetime string
}

export interface Feed extends BaseEvent {
  time: string; // HH:MM format
  amount?: number;
  unit?: 'ml' | 'oz';
  method: 'breast' | 'bottle';
  side?: 'left' | 'right';
  duration_sec?: number;
  milk_type?: string;
  note?: string;
}

export interface Diaper extends BaseEvent {
  time: string; // HH:MM format
  pee: boolean;
  poop: boolean;
  note?: string;
}

export interface Sleep extends BaseEvent {
  start: string; // HH:MM format
  end: string; // HH:MM format
  note?: string;
}

export interface Vitamin extends BaseEvent {
  time: string; // HH:MM format
  name: string;
  dose?: string;
  note?: string;
}

export interface Weight extends BaseEvent {
  time: string; // HH:MM format
  kg: number;
  note?: string;
}

export interface Height extends BaseEvent {
  time: string; // HH:MM format
  cm: number;
  note?: string;
}

export interface Other extends BaseEvent {
  time: string; // HH:MM format
  note: string;
}

export type Event = Feed | Diaper | Sleep | Vitamin | Weight | Height | Other;

export interface DayData {
  feeds: Feed[];
  diapers: Diaper[];
  sleeps: Sleep[];
  vitamins: Vitamin[];
  weights: Weight[];
  heights: Height[];
  others: Other[];
}

export interface Store {
  [isoDate: string]: DayData;
}

export interface BabyProfile {
  name: string;
  sex: 'Female' | 'Male';
  date_of_birth: string; // ISO date string
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  units: 'ml' | 'oz';
  notifications_enabled: boolean;
  quiet_hours_start?: string; // HH:MM
  quiet_hours_end?: string; // HH:MM
}

export interface ExportBundle {
  version: '1.0.0';
  exported_at: string; // ISO datetime string
  profile: BabyProfile;
  store: Store;
}

export interface DailySummary {
  date: string;
  feed_count: number;
  total_feed_ml: number;
  pee_count: number;
  poop_count: number;
  total_sleep_minutes: number;
  vitamin_count: number;
  weight_kg?: number;
  height_cm?: number;
}

export interface WeeklySummary {
  week_start: string; // ISO date string (Monday)
  week_end: string; // ISO date string (Sunday)
  daily_summaries: DailySummary[];
  avg_feeds_per_day: number;
  avg_sleep_minutes_per_day: number;
  total_feed_ml: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM format
  weekly_summaries: WeeklySummary[];
  total_feeds: number;
  total_sleep_hours: number;
  avg_weight_kg?: number;
  avg_height_cm?: number;
  growth_percentile_weight?: number;
  growth_percentile_height?: number;
}

// Sync types
export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  table: string;
  record_id: string;
  data: any;
  timestamp: string;
  retry_count: number;
  last_error?: string;
}

export interface SyncStatus {
  last_sync_at?: string;
  pending_operations: number;
  is_syncing: boolean;
  last_error?: string;
}

// Chart data types
export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface EventMapData {
  date: string;
  hour: number; // 0-23
  type: EventType;
  count: number;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

// Error types
export type ValidationError = {
  field: string;
  message: string;
  value?: any;
};

export interface AppError {
  code: string;
  message: string;
  details?: ValidationError[];
}
