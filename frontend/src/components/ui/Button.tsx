import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-wide rounded-xl transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-teal/30 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[48px]';

    const variants = {
      primary: 'bg-teal text-white hover:bg-teal/90 active:scale-[0.99] shadow-sm',
      secondary: 'bg-soft-mint text-navy hover:bg-soft-mint/80 active:scale-[0.99]',
      outline: 'border-2 border-teal text-teal hover:bg-teal/10 active:scale-[0.99]',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.99]',
      accent: 'bg-accent text-white hover:bg-accent/90 active:scale-[0.99] shadow-sm',
      ghost: 'text-navy hover:bg-navy/10 active:scale-[0.99]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-base min-h-[44px]',
      md: 'px-6 py-3 text-lg min-h-[48px]',
      lg: 'px-8 py-4 text-xl min-h-[56px]',
      xl: 'px-10 py-5 text-2xl min-h-[64px] font-extrabold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
