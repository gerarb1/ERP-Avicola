import Dexie, { type Table } from 'dexie';

export interface PendingMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: unknown;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}

export class OfflineDatabase extends Dexie {
  mutations!: Table<PendingMutation, string>;

  constructor() {
    super('erp_avicola_offline');
    this.version(1).stores({
      mutations: 'id, endpoint, status, timestamp',
    });
  }
}

export const offlineDB = new OfflineDatabase();
