'use client';

import React from 'react';
import type { Message } from '@/lib/store/chat-store';

interface MessageItemProps {
  message: Message;
  userDisplayName: string;
  isOwnMessage: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * MessageItem component
 * Displays a single message with user info, content, timestamp, and actions
 */
const MessageItem: React.FC<MessageItemProps> = ({
  message,
  userDisplayName,
  isOwnMessage,
  onEdit,
  onDelete
}) => {
  // Check if message has been edited
  const isEdited = message.updated_at !== message.created_at;
  
  /**
   * Format timestamp to human-readable string
   * - "just now" for < 1 minute
   * - "5m ago" for < 1 hour
   * - "Apr 10, 3:45 PM" for older
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ago`;
    }
    
    // Format as "Apr 10, 3:45 PM"
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div className="group flex items-start gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
      {/* User Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
        {userDisplayName ? userDisplayName[0].toUpperCase() : '?'}
      </div>
      
      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header: Username + Timestamp + Edited indicator */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-gray-900 text-sm">
            {userDisplayName || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-500">
            {formatTimestamp(message.created_at)}
          </span>
          {isEdited && (
            <span className="text-xs text-gray-400 italic">(edited)</span>
          )}
        </div>
        
        {/* Message Content */}
        <p className="text-gray-800 text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        
        {/* Status Indicators */}
        {message.status === 'sending' && (
          <p className="text-xs text-gray-500 mt-1 italic">Sending...</p>
        )}
        {message.status === 'failed' && (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-red-600">Failed to send.</p>
            <button
              onClick={onEdit}
              className="text-xs text-indigo-600 hover:text-indigo-800 underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>
      
      {/* Action Buttons (Edit/Delete) */}
      {isOwnMessage && message.status === 'sent' && onEdit && onDelete && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="px-2 py-1 text-xs text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded transition-colors"
            title="Edit message"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
            title="Delete message"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(MessageItem, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.updated_at === nextProps.message.updated_at &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.isOwnMessage === nextProps.isOwnMessage
  );
});

