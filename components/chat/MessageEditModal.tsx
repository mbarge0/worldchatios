'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Message } from '@/lib/store/chat-store';

/**
 * MessageEditModal component props interface
 */
export interface MessageEditModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** The message being edited */
  message: Message | null;
  /** Callback to save the edited message */
  onSave: (messageId: string, newContent: string) => Promise<void>;
}

/**
 * Modal for editing message content
 * 
 * Features:
 * - Auto-resizing textarea
 * - Character count (2000 max)
 * - Content validation (1-2000 chars, trimmed)
 * - Save/Cancel buttons
 * - Pre-fills with existing message content
 * 
 * @example
 * ```tsx
 * <MessageEditModal
 *   isOpen={isEditing}
 *   onClose={() => setIsEditing(false)}
 *   message={currentMessage}
 *   onSave={handleSave}
 * />
 * ```
 */
export default function MessageEditModal({
  isOpen,
  onClose,
  message,
  onSave,
}: MessageEditModalProps) {
  const [editedContent, setEditedContent] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Pre-fill textarea with message content when modal opens
  useEffect(() => {
    if (isOpen && message) {
      setEditedContent(message.content);
      setError('');
    }
  }, [isOpen, message]);
  
  // Validate and save
  const handleSave = async () => {
    if (!message) return;
    
    // Trim whitespace
    const trimmedContent = editedContent.trim();
    
    // Validate length
    if (trimmedContent.length === 0) {
      setError('Message cannot be empty');
      return;
    }
    
    if (trimmedContent.length > 2000) {
      setError('Message must be 2000 characters or less');
      return;
    }
    
    // Check if content actually changed
    if (trimmedContent === message.content.trim()) {
      onClose();
      return;
    }
    
    // Save
    setIsSaving(true);
    try {
      await onSave(message.id, trimmedContent);
      onClose();
    } catch (err) {
      setError('Failed to save message. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle Enter key (Shift+Enter for new line, Enter to save)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };
  
  const characterCount = editedContent.length;
  const isNearLimit = characterCount > 1800;
  const isOverLimit = characterCount > 2000;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Message"
      showCloseButton={true}
    >
      <div className="space-y-4">
        {/* Textarea */}
        <div>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`
              w-full px-3 py-2 border rounded-lg 
              focus:outline-none focus:ring-2 
              resize-none
              ${isOverLimit 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-indigo-500'
              }
            `}
            rows={4}
            maxLength={2000}
            placeholder="Edit your message..."
            autoFocus
          />
          
          {/* Character count */}
          {isNearLimit && (
            <p className={`text-xs mt-1 ${isOverLimit ? 'text-red-600' : 'text-orange-500'}`}>
              {characterCount} / 2000 characters
            </p>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}
        
        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || isOverLimit}
            loading={isSaving}
          >
            Save
          </Button>
        </div>
        
        {/* Help text */}
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Shift+Enter</kbd> for a new line, 
          <kbd className="ml-1 px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to save
        </p>
      </div>
    </Modal>
  );
}

