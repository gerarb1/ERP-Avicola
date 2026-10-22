import { useSyncQueueStore } from '@/lib/offline/sync-queue-store';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

export function SyncStatusIndicator() {
  const { isOnline, isSyncing, pendingCount } = useSyncQueueStore();

  if (!isOnline) {
    return (
      <div className="flex items-center text-amber-300">
        <CloudOff className="w-5 h-5" />
        {pendingCount > 0 && <span className="ml-1 text-xs font-bold">{pendingCount}</span>}
      </div>
    );
  }

  if (isSyncing) {
    return <RefreshCw className="w-5 h-5 text-blue-300 animate-spin" />;
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center text-blue-300">
        <Cloud className="w-5 h-5" />
        <span className="ml-1 text-xs font-bold">{pendingCount}</span>
      </div>
    );
  }

  return <Cloud className="w-5 h-5 text-primary-300" />;
}
