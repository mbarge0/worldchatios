'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * ConfirmDialog component props interface
 */
export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Callback when user confirms the action */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Confirmation message/question */
  message: string;
  /** Optional text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Optional text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Whether the confirm action is loading */
  loading?: boolean;
}

/**
 * Confirmation dialog for destructive actions
 * 
 * Features:
 * - Clear title and message
 * - Danger (red) confirm button
 * - Secondary cancel button
 * - Loading state support
 * - Keyboard shortcuts (Enter to confirm, Escape to cancel)
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   isOpen={isDeleting}
 *   onClose={() => setIsDeleting(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Message"
 *   message="Are you sure you want to delete this message? This action cannot be undone."
 * />
 * ```
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}: ConfirmDialogProps) {
  // Handle confirm action
  const handleConfirm = () => {
    onConfirm();
    // Don't auto-close - let parent component decide when to close
    // (after async operation completes)
  };
  
  // Handle Enter key to confirm
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen && !loading) {
        e.preventDefault();
        handleConfirm();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, loading]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Message */}
        <p className="text-sm text-gray-700">
          {message}
        </p>
        
        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={loading}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
        
        {/* Help text */}
        <p className="text-xs text-gray-500 text-center">
          Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to confirm, 
          <kbd className="ml-1 px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Esc</kbd> to cancel
        </p>
      </div>
    </Modal>
  );
}

