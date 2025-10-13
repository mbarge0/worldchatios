'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { useChatStore, type Message } from '@/lib/store/chat-store';

/**
 * useMessages Hook
 * Manages message CRUD operations with optimistic updates and real-time subscription
 */
export function useMessages() {
  const { user } = useAuth();
  const currentChannelId = useChatStore((state) => state.currentChannelId);
  const messageCache = useChatStore((state) => state.messageCache);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const deleteMessageFromCache = useChatStore((state) => state.deleteMessage);
  const setMessages = useChatStore((state) => state.setMessages);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get messages for current channel (memoized to prevent re-renders)
  const messages = useMemo(() => {
    return currentChannelId ? messageCache[currentChannelId] || [] : [];
  }, [currentChannelId, messageCache]);
  
  // ============================================================================
  // FETCH MESSAGES
  // ============================================================================
  
  /**
   * Fetch last 50 messages for current channel
   */
  const fetchMessages = useCallback(async () => {
    if (!currentChannelId || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          users:user_id (
            display_name
          )
        `)
        .eq('channel_id', currentChannelId)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (fetchError) throw fetchError;
      
      // Transform messages to include user_display_name
      const transformedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        channel_id: msg.channel_id,
        user_id: msg.user_id || '', // Handle null user_id
        content: msg.content,
        message_type: msg.message_type as 'user' | 'ai_summary',
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        user_display_name: msg.users?.display_name || 'Unknown User'
      }));
      
      // Replace messages in cache for this channel
      setMessages(currentChannelId, transformedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [currentChannelId, user, setMessages]);
  
  // Auto-fetch messages when channel changes
  useEffect(() => {
    if (currentChannelId && user) {
      fetchMessages();
    }
  }, [currentChannelId, user, fetchMessages]);
  
  // ============================================================================
  // REAL-TIME SUBSCRIPTION
  // ============================================================================
  
  /**
   * Subscribe to real-time message updates for current channel
   * Handles INSERT, UPDATE, and DELETE events
   */
  useEffect(() => {
    if (!currentChannelId || !user) return;
    
    // Create real-time subscription
    const channel = supabase
      .channel(`messages:${currentChannelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${currentChannelId}`
        },
        async (payload) => {
          console.log('Real-time INSERT:', payload);
          
          // Fetch user display_name for the new message
          const { data: userData } = await supabase
            .from('users')
            .select('display_name')
            .eq('id', payload.new.user_id)
            .single();
          
          const newMessage: Message = {
            ...payload.new as Message,
            user_display_name: userData?.display_name || 'Unknown User'
          };
          
          // Check if this is our own optimistic message (deduplication)
          const existingMessage = messages.find(m => {
            // Check for temp ID that matches content and user
            return (
              m.user_id === newMessage.user_id &&
              m.content === newMessage.content &&
              m.status === 'sending' &&
              Math.abs(new Date(m.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 2000
            );
          });
          
          if (existingMessage) {
            // Update the optimistic message with real data
            updateMessage(currentChannelId, existingMessage.id, {
              id: newMessage.id,
              created_at: newMessage.created_at,
              updated_at: newMessage.updated_at,
              status: 'sent'
            });
          } else {
            // Add new message from another user
            addMessage(currentChannelId, newMessage);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${currentChannelId}`
        },
        (payload) => {
          console.log('Real-time UPDATE:', payload);
          
          // Update message in cache
          updateMessage(currentChannelId, payload.new.id as string, {
            content: payload.new.content as string,
            updated_at: payload.new.updated_at as string
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${currentChannelId}`
        },
        (payload) => {
          console.log('Real-time DELETE:', payload);
          
          // Remove message from cache
          deleteMessageFromCache(currentChannelId, payload.old.id as string);
        }
      )
      .subscribe((status) => {
        console.log(`Real-time subscription status: ${status}`);
      });
    
    // Cleanup: Unsubscribe when channel changes or component unmounts
    return () => {
      console.log(`Unsubscribing from messages:${currentChannelId}`);
      supabase.removeChannel(channel);
    };
  }, [currentChannelId, user, messages, addMessage, updateMessage, deleteMessageFromCache]);
  
  // ============================================================================
  // SEND MESSAGE
  // ============================================================================
  
  /**
   * Send a new message with optimistic update
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!currentChannelId || !user) {
      throw new Error('Must be logged in and have a channel selected');
    }
    
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length > 2000) {
      throw new Error('Message must be 1-2000 characters');
    }
    
    // Generate temporary ID for optimistic update
    const tempId = crypto.randomUUID();
    const optimisticMessage: Message = {
      id: tempId,
      channel_id: currentChannelId,
      user_id: user.id,
      content: trimmedContent,
      message_type: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'sending',
      user_display_name: 'You' // Will be replaced with real display_name from database
    };
    
    // Optimistic update: Add to cache immediately
    addMessage(currentChannelId, optimisticMessage);
    
    try {
      // Insert to database
      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({
          channel_id: currentChannelId,
          user_id: user.id,
          content: trimmedContent,
          message_type: 'user'
        })
        .select(`
          *,
          users:user_id (
            display_name
          )
        `)
        .single();
      
      if (insertError) throw insertError;
      
      // Replace temp message with real one
      const realMessage: Message = {
        id: data.id,
        channel_id: data.channel_id,
        user_id: data.user_id || user.id,
        content: data.content,
        message_type: data.message_type as 'user' | 'ai_summary',
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_display_name: data.users?.display_name || 'You',
        status: 'sent'
      };
      
      // Update the optimistic message with real data
      updateMessage(currentChannelId, tempId, realMessage);
    } catch (err) {
      console.error('Error sending message:', err);
      // Mark as failed
      updateMessage(currentChannelId, tempId, { status: 'failed' });
      throw err;
    }
  }, [currentChannelId, user, addMessage, updateMessage]);
  
  // ============================================================================
  // EDIT MESSAGE
  // ============================================================================
  
  /**
   * Edit an existing message
   */
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!currentChannelId || !user) {
      throw new Error('Must be logged in');
    }
    
    const trimmedContent = newContent.trim();
    if (!trimmedContent || trimmedContent.length > 2000) {
      throw new Error('Message must be 1-2000 characters');
    }
    
    // Find original message for rollback
    const originalMessage = messages.find(m => m.id === messageId);
    if (!originalMessage) {
      throw new Error('Message not found');
    }
    
    // Optimistic update
    updateMessage(currentChannelId, messageId, {
      content: trimmedContent,
      updated_at: new Date().toISOString()
    });
    
    try {
      const { error: updateError } = await supabase
        .from('messages')
        .update({
          content: trimmedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user.id); // Only allow editing own messages
      
      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error editing message:', err);
      // Rollback on failure
      updateMessage(currentChannelId, messageId, {
        content: originalMessage.content,
        updated_at: originalMessage.updated_at
      });
      throw err;
    }
  }, [currentChannelId, user, messages, updateMessage]);
  
  // ============================================================================
  // DELETE MESSAGE
  // ============================================================================
  
  /**
   * Delete a message (hard delete)
   */
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!currentChannelId || !user) {
      throw new Error('Must be logged in');
    }
    
    // Find original message for rollback
    const originalMessage = messages.find(m => m.id === messageId);
    if (!originalMessage) {
      throw new Error('Message not found');
    }
    
    // Optimistic removal
    deleteMessageFromCache(currentChannelId, messageId);
    
    try {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id); // Only allow deleting own messages
      
      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error deleting message:', err);
      // Rollback on failure
      addMessage(currentChannelId, originalMessage);
      throw err;
    }
  }, [currentChannelId, user, messages, deleteMessageFromCache, addMessage]);
  
  // ============================================================================
  // RETURN VALUES
  // ============================================================================
  
  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage
  };
}

