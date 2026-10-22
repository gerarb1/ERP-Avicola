import { create } from 'zustand';

interface SyncQueueState {
  pendingCount: number;
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncAt: string | null;
  setPendingCount: (count: number) => void;
  setIsSyncing: (syncing: boolean) => void;
  setIsOnline: (online: boolean) => void;
  setLastSyncAt: (date: string) => void;
}

export const useSyncQueueStore = create<SyncQueueState>((set) => ({
  pendingCount: 0,
  isSyncing: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastSyncAt: null,
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
}));
