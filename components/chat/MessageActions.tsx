'use client';

import React from 'react';

interface MessageActionsProps {
  messageId?: string; // Optional, for future use
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * MessageActions component
 * Edit and delete buttons shown on hover for own messages
 */
const MessageActions: React.FC<MessageActionsProps> = ({
  onEdit,
  onDelete
}) => {
  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-shrink-0">
      <button
        onClick={onEdit}
        className="px-2 py-1 text-xs text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded transition-colors"
        title="Edit message"
        aria-label="Edit message"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        className="px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
        title="Delete message"
        aria-label="Delete message"
      >
        Delete
      </button>
    </div>
  );
};

export default MessageActions;

