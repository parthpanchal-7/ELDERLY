import React from 'react';
import { clsx } from 'clsx';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'animate-spin rounded-full border-teal border-t-transparent',
        sizes[size],
        className
      )}
    />
  );
};
