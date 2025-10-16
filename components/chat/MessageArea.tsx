'use client';

import type { Message } from '@/lib/store/chat-store';
import React from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

interface MessageAreaProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string;
  currentChannelName?: string;
  onSend: (content: string) => Promise<void>;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  assistantLabel?: string;
  onUndoLastAction?: () => void;
}

/**
 * MessageArea component
 * Container for message list and input, displays messages for current channel
 */
const MessageArea: React.FC<MessageAreaProps> = ({
  messages,
  loading,
  currentUserId,
  currentChannelName,
  onSend,
  onEditMessage,
  onDeleteMessage,
  assistantLabel = 'Assistant',
  onUndoLastAction,
}) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header (optional) */}
      {currentChannelName && (
        <div className="flex-shrink-0 border-b border-gray-200 px-6 py-3 bg-white flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            #{currentChannelName}
          </h2>
          {onUndoLastAction && (
            <button
              type="button"
              className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
              onClick={onUndoLastAction}
              aria-label="Undo last AI action"
            >
              Undo last AI action
            </button>
          )}
        </div>
      )}

      {/* Message List (scrollable) */}
      <MessageList
        messages={messages}
        loading={loading}
        currentUserId={currentUserId}
        onEditMessage={onEditMessage}
        onDeleteMessage={onDeleteMessage}
      />

      {/* Message Input (fixed at bottom) */}
      <MessageInput
        onSend={onSend}
        disabled={loading}
        placeholder={
          currentChannelName
            ? `Message #${currentChannelName}`
            : 'Type a message...'
        }
      />
    </div>
  );
};

export default MessageArea;

