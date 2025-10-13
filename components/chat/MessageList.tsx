'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Message } from '@/lib/store/chat-store';
import MessageItem from './MessageItem';
import MessageEditModal from './MessageEditModal';
import ConfirmDialog from './ConfirmDialog';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

/**
 * MessageList component
 * Displays a scrollable list of messages with auto-scroll behavior
 */
const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  currentUserId,
  onEditMessage,
  onDeleteMessage
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const prevMessagesLengthRef = useRef(messages.length);
  
  // Modal state
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  
  /**
   * Auto-scroll to bottom when new messages arrive
   * Only scrolls if user is near the bottom (within 100px)
   */
  useEffect(() => {
    // Only scroll if new messages were added (not on initial load)
    const newMessagesAdded = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    
    if (autoScroll && newMessagesAdded && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, autoScroll]);
  
  /**
   * Detect if user has scrolled up (disable auto-scroll)
   * Re-enable auto-scroll when user scrolls back to bottom
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const threshold = 100; // pixels from bottom
    const distanceFromBottom = 
      target.scrollHeight - target.scrollTop - target.clientHeight;
    
    const isNearBottom = distanceFromBottom < threshold;
    setAutoScroll(isNearBottom);
  };
  
  // Loading state
  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <div className="mb-4 text-gray-400">
            <svg 
              className="mx-auto h-12 w-12" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-2">No messages yet</p>
          <p className="text-sm text-gray-500">
            Be the first to start the conversation!
          </p>
        </div>
      </div>
    );
  }
  
  // Messages list
  return (
    <div 
      className="flex-1 overflow-y-auto bg-white"
      onScroll={handleScroll}
    >
      <div className="flex flex-col py-4">
        {messages.map((message) => {
          const isOwnMessage = message.user_id === currentUserId;
          
          return (
            <MessageItem
              key={message.id}
              message={message}
              userDisplayName={message.user_display_name || 'Unknown User'}
              isOwnMessage={isOwnMessage}
              onEdit={() => {
                if (onEditMessage) {
                  setEditingMessage(message);
                }
              }}
              onDelete={() => {
                if (onDeleteMessage) {
                  setDeletingMessageId(message.id);
                }
              }}
            />
          );
        })}
        
        {/* Scroll anchor */}
        <div ref={scrollRef} />
      </div>
      
      {/* Edit Message Modal */}
      <MessageEditModal
        isOpen={editingMessage !== null}
        onClose={() => setEditingMessage(null)}
        message={editingMessage}
        onSave={async (messageId, newContent) => {
          if (onEditMessage) {
            await onEditMessage(messageId, newContent);
            setEditingMessage(null);
          }
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingMessageId !== null}
        onClose={() => setDeletingMessageId(null)}
        onConfirm={() => {
          if (onDeleteMessage && deletingMessageId) {
            onDeleteMessage(deletingMessageId);
            setDeletingMessageId(null);
          }
        }}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default MessageList;

