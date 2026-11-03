import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition duration-150 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              icon && 'pl-10',
              error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

