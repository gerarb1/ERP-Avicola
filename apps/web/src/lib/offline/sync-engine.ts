import { QueryClient } from '@tanstack/react-query';
import { offlineDB } from './db';
import { useSyncQueueStore } from './sync-queue-store';
import { apiClient } from '../api-client';

export async function enqueueMutation(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  payload: unknown
) {
  await offlineDB.mutations.add({
    id: crypto.randomUUID(),
    endpoint,
    method,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending',
  });
  updatePendingCount();
}

async function updatePendingCount() {
  const count = await offlineDB.mutations.where('status').equals('pending').count();
  useSyncQueueStore.getState().setPendingCount(count);
}

export async function processSyncQueue(queryClient: QueryClient) {
  const store = useSyncQueueStore.getState();
  if (store.isSyncing || !store.isOnline) return;

  const pending = await offlineDB.mutations.where('status').equals('pending').sortBy('timestamp');
  if (pending.length === 0) return;

  store.setIsSyncing(true);

  for (const mutation of pending) {
    try {
      await offlineDB.mutations.update(mutation.id, { status: 'syncing' });
      
      await apiClient(mutation.endpoint, {
        method: mutation.method,
        body: JSON.stringify(mutation.payload),
        headers: {
          'X-Idempotency-Key': mutation.id,
        }
      });

      await offlineDB.mutations.delete(mutation.id);
    } catch (error) {
      await offlineDB.mutations.update(mutation.id, { 
        status: 'pending',
        retryCount: mutation.retryCount + 1,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  await updatePendingCount();
  store.setIsSyncing(false);
  store.setLastSyncAt(new Date().toISOString());
  queryClient.invalidateQueries();
}

export function setupSyncListeners(queryClient: QueryClient) {
  const handleOnline = () => {
    useSyncQueueStore.getState().setIsOnline(true);
    processSyncQueue(queryClient);
  };
  const handleOffline = () => {
    useSyncQueueStore.getState().setIsOnline(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  const intervalId = setInterval(() => {
    if (useSyncQueueStore.getState().isOnline) {
      processSyncQueue(queryClient);
    }
  }, 1000 * 60);

  updatePendingCount();

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    clearInterval(intervalId);
  };
}
