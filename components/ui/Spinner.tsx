'use client';

import React from 'react';

/**
 * Spinner component props interface
 */
export interface SpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional additional CSS classes */
  className?: string;
  /** Color variant */
  color?: 'primary' | 'white' | 'gray';
}

/**
 * Standardized loading Spinner component
 * 
 * Features:
 * - Three size variants: sm (16px), md (32px), lg (48px)
 * - Color variants for different backgrounds
 * - Smooth rotation animation
 * - Accessible loading indicator
 * 
 * @example
 * ```tsx
 * <Spinner size="md" />
 * 
 * <Spinner size="sm" color="white" />
 * 
 * <Spinner size="lg" className="my-4" />
 * ```
 */
export default function Spinner({
  size = 'md',
  className = '',
  color = 'primary',
}: SpinnerProps) {
  // Size styles
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  // Color styles
  const colorStyles = {
    primary: 'border-indigo-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
  };

  return (
    <div
      className={`
        inline-block rounded-full border-4 animate-spin
        ${sizeStyles[size]}
        ${colorStyles[color]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

