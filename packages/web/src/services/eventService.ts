import { supabase } from '@/lib/supabase';
import { dbOperations } from '@/lib/database';
import { generateEventId } from '@baby/domain';
import type { Event, EventType, Feed, Diaper, Sleep, Vitamin, Weight, Height, Other } from '@baby/domain';

class EventService {
  async getEvents(userId: string, date?: string): Promise<Event[]> {
    try {
      // Try to get from server first
      let query = supabase
        .from(this.getTableName('feed'))
        .select('*')
        .eq('user_id', userId);

      if (date) {
        query = query.eq('date', date);
      }

      const results = await Promise.allSettled([
        query.from('feeds'),
        query.from('diapers'),
        query.from('sleeps'),
        query.from('vitamins'),
        query.from('weights'),
        query.from('heights'),
        query.from('others'),
      ]);

      const events: Event[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
          events.push(...result.value.data);
        }
      });

      return events.sort((a, b) => {
        const timeA = this.getEventTime(a);
        const timeB = this.getEventTime(b);
        return timeA.localeCompare(timeB);
      });
    } catch (error) {
      // Fallback to local database
      console.warn('Failed to fetch from server, using local data:', error);
      return dbOperations.getEvents(userId, date);
    }
  }

  async createEvent(type: EventType, data: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const event: Event = {
      ...data,
      id: generateEventId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save locally first (optimistic update)
    await dbOperations.addEvent(event);

    // Queue for sync
    await dbOperations.addToSyncQueue({
      operation: 'create',
      table: this.getTableName(type),
      record_id: event.id,
      data: event,
      timestamp: new Date().toISOString(),
      retry_count: 0,
    });

    // Try to sync immediately if online
    this.syncEvent(event, 'create').catch(console.warn);

    return event;
  }

  async updateEvent(id: string, type: EventType, updates: Partial<Event>): Promise<Event> {
    const updatedEvent = {
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    } as Event;

    // Update locally first
    await dbOperations.updateEvent(id, updatedEvent);

    // Queue for sync
    await dbOperations.addToSyncQueue({
      operation: 'update',
      table: this.getTableName(type),
      record_id: id,
      data: updatedEvent,
      timestamp: new Date().toISOString(),
      retry_count: 0,
    });

    // Try to sync immediately if online
    this.syncEvent(updatedEvent, 'update').catch(console.warn);

    return updatedEvent;
  }

  async deleteEvent(id: string, type: EventType): Promise<void> {
    // Delete locally first
    await dbOperations.deleteEvent(id);

    // Queue for sync
    await dbOperations.addToSyncQueue({
      operation: 'delete',
      table: this.getTableName(type),
      record_id: id,
      data: { id },
      timestamp: new Date().toISOString(),
      retry_count: 0,
    });

    // Try to sync immediately if online
    try {
      const { error } = await supabase
        .from(this.getTableName(type))
        .delete()
        .eq('id', id);

      if (!error) {
        // Remove from sync queue if successful
        const queueItems = await dbOperations.getSyncQueue();
        const queueItem = queueItems.find(item => 
          item.record_id === id && item.operation === 'delete'
        );
        if (queueItem) {
          await dbOperations.removeSyncQueueItem(queueItem.id);
        }
      }
    } catch (error) {
      console.warn('Failed to sync delete operation:', error);
    }
  }

  private async syncEvent(event: Event, operation: 'create' | 'update'): Promise<void> {
    const type = this.getEventType(event);
    const tableName = this.getTableName(type);

    try {
      if (operation === 'create') {
        const { error } = await supabase
          .from(tableName)
          .insert(event);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(tableName)
          .update(event)
          .eq('id', event.id);

        if (error) throw error;
      }

      // Remove from sync queue if successful
      const queueItems = await dbOperations.getSyncQueue();
      const queueItem = queueItems.find(item => 
        item.record_id === event.id && item.operation === operation
      );
      if (queueItem) {
        await dbOperations.removeSyncQueueItem(queueItem.id);
      }
    } catch (error) {
      console.warn(`Failed to sync ${operation} operation:`, error);
      throw error;
    }
  }

  private getTableName(type: EventType): string {
    const tableMap: Record<EventType, string> = {
      feed: 'feeds',
      diaper: 'diapers',
      sleep: 'sleeps',
      vitamin: 'vitamins',
      weight: 'weights',
      height: 'heights',
      other: 'others',
    };
    return tableMap[type];
  }

  private getEventType(event: Event): EventType {
    if ('method' in event) return 'feed';
    if ('pee' in event) return 'diaper';
    if ('start' in event) return 'sleep';
    if ('name' in event) return 'vitamin';
    if ('kg' in event) return 'weight';
    if ('cm' in event) return 'height';
    return 'other';
  }

  private getEventTime(event: Event): string {
    if ('time' in event) return event.time;
    if ('start' in event) return event.start;
    return '00:00';
  }

  async syncPendingOperations(): Promise<void> {
    const queueItems = await dbOperations.getSyncQueue();

    for (const item of queueItems) {
      try {
        if (item.operation === 'create') {
          const { error } = await supabase
            .from(item.table)
            .insert(item.data);

          if (error) throw error;
        } else if (item.operation === 'update') {
          const { error } = await supabase
            .from(item.table)
            .update(item.data)
            .eq('id', item.record_id);

          if (error) throw error;
        } else if (item.operation === 'delete') {
          const { error } = await supabase
            .from(item.table)
            .delete()
            .eq('id', item.record_id);

          if (error) throw error;
        }

        // Remove from queue if successful
        await dbOperations.removeSyncQueueItem(item.id);
      } catch (error) {
        console.warn(`Failed to sync operation ${item.id}:`, error);

        // Increment retry count
        await dbOperations.incrementRetryCount(item.id);

        // Remove from queue if too many retries
        if ((item.retry_count || 0) >= 5) {
          console.error(`Removing failed sync operation after ${item.retry_count} retries:`, item);
          await dbOperations.removeSyncQueueItem(item.id);
        }
      }
    }
  }
}

export const eventService = new EventService();
