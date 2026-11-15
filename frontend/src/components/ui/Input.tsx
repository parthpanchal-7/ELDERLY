import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-lg font-bold text-navy mb-2">
            {label}
            {props.required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full px-4 py-3 text-lg rounded-xl border-2 bg-white text-navy placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-teal/20 transition-all min-h-[52px]',
            error ? 'border-red-500 focus:border-red-500' : 'border-stone-300 focus:border-teal',
            className
          )}
          {...props}
        />
        {helperText && !error && <p className="mt-1 text-sm text-stone-500">{helperText}</p>}
        {error && <p className="mt-1 text-base font-semibold text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
