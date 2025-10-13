'use client';

import React from 'react';

/**
 * Avatar component props interface
 */
export interface AvatarProps {
  /** User's display name (used to generate initials) */
  displayName: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Standardized Avatar component with initials fallback
 * 
 * Features:
 * - Generates initials from display name (first 1-2 characters)
 * - Three size variants: sm (32px), md (40px), lg (48px)
 * - Colored background (consistent indigo)
 * - White text, centered
 * - Circular shape
 * 
 * @example
 * ```tsx
 * <Avatar displayName="Matt" size="md" />
 * 
 * <Avatar displayName="John Doe" size="sm" />
 * 
 * <Avatar displayName="A" size="lg" />
 * ```
 */
export default function Avatar({
  displayName,
  size = 'md',
  className = '',
}: AvatarProps) {
  /**
   * Generate initials from display name
   * - Takes first character of first word
   * - If name has multiple words, takes first character of second word
   * - Converts to uppercase
   * - Returns single character if name is very short
   */
  const getInitials = (name: string): string => {
    if (!name) return '?';
    
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return '?';
    
    const words = trimmedName.split(/\s+/);
    
    if (words.length === 1) {
      // Single word: take first character (or two if available)
      return trimmedName.slice(0, 1).toUpperCase();
    }
    
    // Multiple words: take first character of first two words
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };
  
  const initials = getInitials(displayName);

  return (
    <div
      className={`
        flex-shrink-0 rounded-full bg-indigo-600 
        flex items-center justify-center 
        text-white font-semibold
        ${sizeStyles[size]}
        ${className}
      `}
      title={displayName}
      aria-label={`Avatar for ${displayName}`}
    >
      {initials}
    </div>
  );
}

