import React from 'react';
import { clsx } from 'clsx';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-lg font-bold text-navy mb-2">
            {label}
            {props.required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            'w-full px-4 py-3 text-lg rounded-xl border-2 bg-white text-navy focus:outline-none focus:ring-4 focus:ring-teal/20 transition-all min-h-[52px]',
            error ? 'border-red-500 focus:border-red-500' : 'border-stone-300 focus:border-teal',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-base font-semibold text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
