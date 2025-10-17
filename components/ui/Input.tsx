'use client';

import React from 'react';

/**
 * Input component props interface
 * Extends standard HTML input attributes
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Helper text displayed below the input (when no error) */
  helperText?: string;
  /** Optional additional CSS classes for the input element */
  className?: string;
}

/**
 * Standardized Input component with validation states
 * 
 * Features:
 * - Optional label
 * - Error state with red border and error message
 * - Helper text for additional context
 * - Focus ring styling
 * - Full TypeScript support with HTML input attributes
 * 
 * @example
 * ```tsx
 * <Input 
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 * />
 * 
 * <Input 
 *   label="Username"
 *   helperText="Must be 3-20 characters"
 *   value={username}
 *   onChange={(e) => setUsername(e.target.value)}
 * />
 * ```
 */
export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...inputProps
}: InputProps) {
  // Generate ID for label association if not provided
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  // Base input styles
  const baseStyles = 'w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2';

  // Conditional styles based on error state
  const stateStyles = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-[var(--brand-gold)] focus:border-[var(--brand-gold)]';

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      {/* Input */}
      <input
        id={inputId}
        className={`
          ${baseStyles}
          ${stateStyles}
          ${className}
        `}
        {...inputProps}
      />

      {/* Error or Helper Text */}
      {error ? (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

