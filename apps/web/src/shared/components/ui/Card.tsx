import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  action?: React.ReactNode;
}

export function Card({ className, title, action, children, ...props }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs', className)} {...props}>
      {(title || action) && (
        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-white">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
