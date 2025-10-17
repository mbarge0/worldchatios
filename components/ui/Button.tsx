'use client';

import React from 'react';

/**
 * Button component props interface
 */
export interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading spinner */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Button content */
  children: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Optional title attribute */
  title?: string;
}

/**
 * Standardized Button component with consistent styling
 * 
 * Features:
 * - Three variants: primary (indigo), secondary (gray), danger (red)
 * - Disabled state with reduced opacity
 * - Loading state with spinner
 * - Hover effects
 * - Full TypeScript support
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Click Me
 * </Button>
 * 
 * <Button variant="danger" disabled>
 *   Delete
 * </Button>
 * 
 * <Button variant="secondary" loading>
 *   Loading...
 * </Button>
 * ```
 */
export default function Button({
  variant = 'primary',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  type = 'button',
  title,
}: ButtonProps) {
  // Base styles shared by all buttons
  const baseStyles = 'px-4 py-3 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Variant-specific styles
  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  // Disabled/loading state styles
  const disabledStyles = (disabled || loading)
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${disabledStyles}
        ${className}
      `}
      title={title}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          {/* Loading spinner */}
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

