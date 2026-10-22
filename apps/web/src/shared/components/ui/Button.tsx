import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-primary-800 text-white hover:bg-primary-700 focus-visible:ring-primary-600': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600': variant === 'danger',
            'hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400': variant === 'ghost',
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 py-2 px-4 text-sm': size === 'md',
            'h-12 py-3 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
