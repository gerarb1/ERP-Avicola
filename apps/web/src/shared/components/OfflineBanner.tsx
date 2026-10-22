import { useSyncQueueStore } from '@/lib/offline/sync-queue-store';
import { AlertCircle } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline, pendingCount } = useSyncQueueStore();

  if (isOnline) return null;

  return (
    <div className="bg-amber-100 p-2 flex items-center justify-center text-amber-800 text-sm font-medium border-b border-amber-200">
      <AlertCircle className="w-4 h-4 mr-2" />
      Trabajando sin conexión
      {pendingCount > 0 && <span className="ml-2 bg-amber-200 px-2 py-0.5 rounded-full text-xs">{pendingCount} pendientes</span>}
    </div>
  );
}
