import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'warning' | 'mint';
}

export const Card: React.FC<CardProps> = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-white border-2 border-stone-200 shadow-sm',
    highlight: 'bg-white border-2 border-teal shadow-md',
    warning: 'bg-amber-50/50 border-2 border-accent shadow-sm',
    mint: 'bg-soft-mint border-2 border-teal/20 shadow-sm',
  };

  return (
    <div className={clsx('rounded-2xl p-6 transition-all', variants[variant], className)} {...props}>
      {children}
    </div>
  );
};
