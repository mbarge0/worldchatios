'use client';

import React from 'react';
import type { Message } from '@/lib/store/chat-store';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface MessageAreaProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string;
  currentChannelName?: string;
  onSend: (content: string) => Promise<void>;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
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
  onDeleteMessage
}) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header (optional) */}
      {currentChannelName && (
        <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            #{currentChannelName}
          </h2>
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

