'use client';

import React, { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * MessageInput component
 * Text input for composing messages with validation and Enter key support
 */
const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type a message...'
}) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Validate message content
  const trimmedContent = content.trim();
  const isValid = trimmedContent.length > 0 && trimmedContent.length <= 2000;
  const characterCount = trimmedContent.length;
  
  /**
   * Handle sending message
   */
  const handleSend = async () => {
    if (!isValid || sending || disabled) return;
    
    setError(null);
    setSending(true);
    
    try {
      await onSend(trimmedContent);
      setContent(''); // Clear input on success
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Failed to send message:', err);
      // Keep content so user can retry
    } finally {
      setSending(false);
    }
  };
  
  /**
   * Handle Enter key (Send) and Shift+Enter (New line)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  /**
   * Auto-resize textarea as content grows
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setError(null); // Clear error on change
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };
  
  // Focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);
  
  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-2">
        {/* Error Message */}
        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        
        {/* Input Area */}
        <div className="flex gap-2 items-end">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              rows={1}
              maxLength={2000}
              disabled={disabled || sending}
              style={{ minHeight: '44px', maxHeight: '200px' }}
            />
            
            {/* Character Count */}
            <div className="absolute bottom-1 right-2 text-xs text-gray-400 pointer-events-none">
              {characterCount > 1800 && (
                <span className={characterCount > 2000 ? 'text-red-500' : 'text-orange-500'}>
                  {characterCount}/2000
                </span>
              )}
            </div>
          </div>
          
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!isValid || disabled || sending}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 flex-shrink-0"
            title={
              sending ? 'Sending...' : 
              !isValid ? 'Enter a message (1-2000 characters)' : 
              'Send message (Enter)'
            }
          >
            {sending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Sending</span>
              </>
            ) : (
              <>
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                  />
                </svg>
                <span>Send</span>
              </>
            )}
          </button>
        </div>
        
        {/* Helper Text */}
        <div className="flex justify-between items-center text-xs text-gray-500 px-1">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {characterCount > 0 && characterCount <= 1800 && (
            <span className="text-gray-400">{characterCount}/2000</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;

