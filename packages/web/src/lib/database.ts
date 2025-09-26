import Dexie, { Table } from 'dexie';
import type { Event, SyncQueueItem } from '@baby/domain';

export class BabyTrackerDB extends Dexie {
  events!: Table<Event>;
  syncQueue!: Table<SyncQueueItem>;
  settings!: Table<{ key: string; value: any }>;

  constructor() {
    super('BabyTrackerDB');

    this.version(1).stores({
      events: '++id, user_id, date, type, created_at, updated_at',
      syncQueue: '++id, operation, table, record_id, timestamp',
      settings: '&key, value',
    });

    this.version(2).stores({
      events: '++id, user_id, date, type, created_at, updated_at',
      syncQueue: '++id, operation, table, record_id, timestamp, retry_count',
      settings: '&key, value',
    }).upgrade(trans => {
      // Add retry_count field to existing syncQueue items
      return trans.syncQueue.toCollection().modify(item => {
        if (!item.retry_count) {
          item.retry_count = 0;
        }
      });
    });
  }
}

export const db = new BabyTrackerDB();

// Database operations
export const dbOperations = {
  // Events
  async getEvents(userId: string, date?: string): Promise<Event[]> {
    let query = db.events.where('user_id').equals(userId);

    if (date) {
      query = query.and(event => event.date === date);
    }

    return query.toArray();
  },

  async addEvent(event: Event): Promise<void> {
    await db.events.add(event);
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    await db.events.update(id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  },

  async deleteEvent(id: string): Promise<void> {
    await db.events.delete(id);
  },

  // Sync queue
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void> {
    await db.syncQueue.add({
      ...item,
      id: crypto.randomUUID(),
    });
  },

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return db.syncQueue.orderBy('timestamp').toArray();
  },

  async removeSyncQueueItem(id: string): Promise<void> {
    await db.syncQueue.delete(id);
  },

  async incrementRetryCount(id: string): Promise<void> {
    const item = await db.syncQueue.get(id);
    if (item) {
      await db.syncQueue.update(id, {
        retry_count: (item.retry_count || 0) + 1,
      });
    }
  },

  // Settings
  async getSetting(key: string): Promise<any> {
    const result = await db.settings.get(key);
    return result?.value;
  },

  async setSetting(key: string, value: any): Promise<void> {
    await db.settings.put({ key, value });
  },

  async clearAllData(): Promise<void> {
    await db.transaction('rw', db.events, db.syncQueue, db.settings, () => {
      db.events.clear();
      db.syncQueue.clear();
      db.settings.clear();
    });
  },
};
