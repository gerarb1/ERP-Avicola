import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-primary-600 w-6 h-6", className)} />;
}
