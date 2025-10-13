'use client';

import React, { useEffect } from 'react';

/**
 * Toast component props interface
 */
export interface ToastProps {
  /** Toast message content */
  message: string;
  /** Toast type/variant */
  type?: 'success' | 'error' | 'info';
  /** Whether the toast is visible */
  isOpen: boolean;
  /** Callback when toast should close */
  onClose: () => void;
  /** Auto-dismiss duration in milliseconds (default: 3000) */
  duration?: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Toast notification component with auto-dismiss
 * 
 * Features:
 * - Three types: success (green), error (red), info (blue)
 * - Auto-dismisses after specified duration (default 3s)
 * - Manual close button
 * - Slide-in animation
 * - Fixed position (top-right corner)
 * - High z-index to appear above modals
 * 
 * @example
 * ```tsx
 * const [showToast, setShowToast] = useState(false);
 * 
 * <Toast 
 *   message="Message sent successfully!"
 *   type="success"
 *   isOpen={showToast}
 *   onClose={() => setShowToast(false)}
 * />
 * ```
 */
export default function Toast({
  message,
  type = 'info',
  isOpen,
  onClose,
  duration = 3000,
  className = '',
}: ToastProps) {
  // Auto-dismiss after duration
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);
  
  // Don't render if not open
  if (!isOpen) {
    return null;
  }
  
  // Type-specific styles
  const typeStyles = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };
  
  // Type-specific icons
  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-[60] max-w-sm w-full
        animate-in slide-in-from-top-5 duration-300
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`
          flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg
          ${typeStyles[type]}
        `}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        
        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

