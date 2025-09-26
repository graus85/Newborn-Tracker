import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import type {
  Event,
  Feed,
  Sleep,
  DayData,
  DailySummary,
  WeeklySummary,
  MonthlySummary,
  EventType,
  ChartDataPoint,
  EventMapData,
} from './types';

// Date utilities
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDateTime(date: Date): string {
  return date.toISOString();
}

export function parseTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

export function timeStringToMinutes(timeString: string): number {
  const { hours, minutes } = parseTime(timeString);
  return hours * 60 + minutes;
}

export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Unit conversion utilities
export function ozToMl(oz: number): number {
  return Math.round(oz * 29.5735);
}

export function mlToOz(ml: number): number {
  return Math.round((ml / 29.5735) * 100) / 100;
}

export function convertFeedAmount(amount: number, fromUnit: 'ml' | 'oz', toUnit: 'ml' | 'oz'): number {
  if (fromUnit === toUnit) return amount;
  if (fromUnit === 'oz' && toUnit === 'ml') return ozToMl(amount);
  if (fromUnit === 'ml' && toUnit === 'oz') return mlToOz(amount);
  return amount;
}

// Sleep duration utilities
export function calculateSleepDuration(start: string, end: string): number {
  const startMinutes = timeStringToMinutes(start);
  let endMinutes = timeStringToMinutes(end);

  // Handle overnight sleep (end time is next day)
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return endMinutes - startMinutes;
}

export function formatSleepDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Event utilities
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getEventTypeFromEvent(event: Event): EventType {
  if ('method' in event) return 'feed';
  if ('pee' in event) return 'diaper';
  if ('start' in event) return 'sleep';
  if ('name' in event) return 'vitamin';
  if ('kg' in event) return 'weight';
  if ('cm' in event) return 'height';
  return 'other';
}

export function sortEventsByTime(events: Event[]): Event[] {
  return events.sort((a, b) => {
    const timeA = 'time' in a ? a.time : 'start' in a ? a.start : '00:00';
    const timeB = 'time' in b ? b.time : 'start' in b ? b.start : '00:00';
    return timeA.localeCompare(timeB);
  });
}

// Summary calculation utilities
export function calculateDailySummary(date: string, dayData: DayData): DailySummary {
  const { feeds, diapers, sleeps, vitamins, weights, heights } = dayData;

  // Calculate total feed amount in ml
  const totalFeedMl = feeds.reduce((total, feed) => {
    if (!feed.amount || feed.method !== 'bottle') return total;
    const amountInMl = feed.unit === 'oz' ? ozToMl(feed.amount) : feed.amount;
    return total + amountInMl;
  }, 0);

  // Calculate total sleep in minutes
  const totalSleepMinutes = sleeps.reduce((total, sleep) => {
    return total + calculateSleepDuration(sleep.start, sleep.end);
  }, 0);

  // Get latest weight and height
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].kg : undefined;
  const latestHeight = heights.length > 0 ? heights[heights.length - 1].cm : undefined;

  return {
    date,
    feed_count: feeds.length,
    total_feed_ml: totalFeedMl,
    pee_count: diapers.filter(d => d.pee).length,
    poop_count: diapers.filter(d => d.poop).length,
    total_sleep_minutes: totalSleepMinutes,
    vitamin_count: vitamins.length,
    weight_kg: latestWeight,
    height_cm: latestHeight,
  };
}

export function calculateWeeklySummary(weekStart: Date, dailySummaries: DailySummary[]): WeeklySummary {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 }); // Week starts on Monday

  const totalFeeds = dailySummaries.reduce((sum, day) => sum + day.feed_count, 0);
  const totalSleepMinutes = dailySummaries.reduce((sum, day) => sum + day.total_sleep_minutes, 0);
  const totalFeedMl = dailySummaries.reduce((sum, day) => sum + day.total_feed_ml, 0);

  const daysWithData = dailySummaries.filter(day => 
    day.feed_count > 0 || day.total_sleep_minutes > 0
  ).length || 1;

  return {
    week_start: formatDate(weekStart),
    week_end: formatDate(weekEnd),
    daily_summaries: dailySummaries,
    avg_feeds_per_day: Math.round(totalFeeds / daysWithData),
    avg_sleep_minutes_per_day: Math.round(totalSleepMinutes / daysWithData),
    total_feed_ml: totalFeedMl,
  };
}

// Chart data utilities
export function generateEventMapData(events: Event[], dateRange: string[]): EventMapData[] {
  const mapData: EventMapData[] = [];

  dateRange.forEach(date => {
    const dayEvents = events.filter(event => event.date === date);

    // Group events by hour and type
    for (let hour = 0; hour < 24; hour++) {
      const hourEvents = dayEvents.filter(event => {
        const eventTime = 'time' in event ? event.time : 'start' in event ? event.start : '00:00';
        const eventHour = parseInt(eventTime.split(':')[0]);
        return eventHour === hour;
      });

      if (hourEvents.length > 0) {
        // Group by event type
        const typeGroups = hourEvents.reduce((acc, event) => {
          const type = getEventTypeFromEvent(event);
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<EventType, number>);

        // Add data points for each type
        Object.entries(typeGroups).forEach(([type, count]) => {
          mapData.push({
            date,
            hour,
            type: type as EventType,
            count,
          });
        });
      }
    }
  });

  return mapData;
}

export function generateFeedTrendData(dailySummaries: DailySummary[]): ChartDataPoint[] {
  return dailySummaries.map((summary, index) => ({
    x: index,
    y: summary.total_feed_ml,
    label: summary.date,
  }));
}

export function generateSleepTrendData(dailySummaries: DailySummary[]): ChartDataPoint[] {
  return dailySummaries.map((summary, index) => ({
    x: index,
    y: summary.total_sleep_minutes / 60, // Convert to hours
    label: summary.date,
  }));
}

export function generateGrowthTrendData(
  dailySummaries: DailySummary[],
  metric: 'weight' | 'height'
): ChartDataPoint[] {
  return dailySummaries
    .filter(summary => 
      metric === 'weight' ? summary.weight_kg !== undefined : summary.height_cm !== undefined
    )
    .map((summary, index) => ({
      x: index,
      y: metric === 'weight' ? summary.weight_kg! : summary.height_cm!,
      label: summary.date,
    }));
}

// CSV export utilities
export function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function eventToCSVRow(event: Event): string {
  const type = getEventTypeFromEvent(event);
  const time = 'time' in event ? event.time : 'start' in event ? event.start : '';
  const details = JSON.stringify(event);

  return [
    event.date,
    type,
    time,
    escapeCSVField(details)
  ].join(',');
}

export function generateCSVContent(events: Event[]): string {
  const header = 'date,type,time,details\n';
  const rows = events.map(eventToCSVRow).join('\n');
  return header + rows;
}

// Validation utilities
export function isValidTimeRange(start: string, end: string): boolean {
  const startMinutes = timeStringToMinutes(start);
  const endMinutes = timeStringToMinutes(end);

  // Allow overnight sleep (end can be next day)
  return endMinutes !== startMinutes;
}

export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidTime(timeString: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeString);
}

// Storage key utilities
export function getStorageKey(key: string, userId?: string): string {
  return userId ? `baby-tracker-${userId}-${key}` : `baby-tracker-${key}`;
}

// Error handling utilities
export function createError(code: string, message: string, details?: any): Error {
  const error = new Error(message) as any;
  error.code = code;
  error.details = details;
  return error;
}

export function isNetworkError(error: any): boolean {
  return error?.name === 'NetworkError' || 
         error?.code === 'NETWORK_ERROR' ||
         error?.message?.includes('fetch');
}
