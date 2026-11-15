import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border-2 border-dashed border-stone-300">
      {icon && <div className="p-4 mb-4 rounded-full bg-soft-mint text-teal">{icon}</div>}
      <h3 className="text-2xl font-bold italic text-navy mb-2">{title}</h3>
      <p className="text-stone-600 max-w-md text-lg mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
