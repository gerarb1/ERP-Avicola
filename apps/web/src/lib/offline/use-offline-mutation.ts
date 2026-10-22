import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueMutation } from './sync-engine';
import { useSyncQueueStore } from './sync-queue-store';
import { apiClient } from '../api-client';

export function useOfflineMutation<TData = any, TVariables = any>(options: {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  invalidateKeys?: string[][];
}) {
  const queryClient = useQueryClient();
  const isOnline = useSyncQueueStore((state) => state.isOnline);
  const method = options.method || 'POST';

  return useMutation<TData | null, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      if (isOnline) {
        return apiClient<TData>(options.endpoint, {
          method,
          body: JSON.stringify(variables)
        });
      } else {
        await enqueueMutation(options.endpoint, method, variables);
        return null;
      }
    },
    onSuccess: () => {
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    }
  });
}
