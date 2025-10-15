'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal component props interface
 */
export interface ModalProps {
  /** Controls whether the modal is visible */
  isOpen: boolean;
  /** Callback function called when the modal should close */
  onClose: () => void;
  /** Optional title displayed at the top of the modal */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
  /** Whether to show the close button (X) in the top-right corner */
  showCloseButton?: boolean;
}

/**
 * Reusable Modal component with portal rendering
 * 
 * Features:
 * - Renders using React Portal at document.body
 * - Click backdrop to close
 * - Press Escape key to close
 * - Optional close button
 * - Smooth fade-in/fade-out transitions
 * - Proper z-index layering (z-50)
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <Modal 
 *   isOpen={isOpen} 
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 * >
 *   <p>Are you sure?</p>
 * </Modal>
 * ```
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true,
}: ModalProps) {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Don't render anything if modal is closed
  if (!isOpen) {
    return null;
  }

  // Handle backdrop click (only close if clicking the backdrop itself)
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Modal content
  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] pointer-events-auto flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`
          relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 
          animate-in zoom-in-95 duration-200
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
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
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal using Portal (at document.body)
  // Only render on client-side to avoid SSR issues
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

