import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Input Component
 * Supports various types and states
 */
const Input = React.forwardRef(({ 
  className,
  type = 'text',
  error,
  leftIcon,
  rightIcon,
  label,
  helperText,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full bg-slate-100 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600/20 outline-none text-sm text-slate-900 placeholder:text-slate-400 transition-all',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'ring-2 ring-red-500/50',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
