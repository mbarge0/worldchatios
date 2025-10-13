import { create } from 'zustand';

/**
 * Message interface matching database schema
 */
export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  message_type: 'user' | 'ai_summary';
  created_at: string;
  updated_at: string;
  status?: 'sending' | 'sent' | 'failed';
  user_display_name?: string;
}

/**
 * Chat Store interface
 * Manages global state for messaging, channels, and connection status
 */
interface ChatStore {
  // Current State
  currentChannelId: string | null;
  
  // Message Cache (per-channel)
  messageCache: Record<string, Message[]>;
  
  // Connection Status
  isConnected: boolean;
  isRealtimeConnected: boolean;
  
  // Actions
  setCurrentChannel: (id: string | null) => void;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  setMessages: (channelId: string, messages: Message[]) => void;
  clearCache: () => void;
  setConnected: (connected: boolean) => void;
  setRealtimeConnected: (connected: boolean) => void;
}

/**
 * Zustand store for chat state management
 * Provides message caching, channel state, and connection tracking
 */
export const useChatStore = create<ChatStore>((set) => ({
  // Initial State
  currentChannelId: null,
  messageCache: {},
  isConnected: true,
  isRealtimeConnected: false,
  
  // Set current active channel
  setCurrentChannel: (id) => set({ currentChannelId: id }),
  
  // Add a message to a channel's cache
  addMessage: (channelId, message) => set((state) => {
    const existingMessages = state.messageCache[channelId] || [];
    
    // Check for duplicates
    const isDuplicate = existingMessages.some(m => m.id === message.id);
    if (isDuplicate) {
      return state; // No change
    }
    
    return {
      messageCache: {
        ...state.messageCache,
        [channelId]: [...existingMessages, message]
      }
    };
  }),
  
  // Update a specific message in cache
  updateMessage: (channelId, messageId, updates) => set((state) => {
    const channelMessages = state.messageCache[channelId];
    if (!channelMessages) return state;
    
    return {
      messageCache: {
        ...state.messageCache,
        [channelId]: channelMessages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      }
    };
  }),
  
  // Delete a message from cache
  deleteMessage: (channelId, messageId) => set((state) => {
    const channelMessages = state.messageCache[channelId];
    if (!channelMessages) return state;
    
    return {
      messageCache: {
        ...state.messageCache,
        [channelId]: channelMessages.filter(msg => msg.id !== messageId)
      }
    };
  }),
  
  // Set all messages for a channel (replaces existing)
  setMessages: (channelId, messages) => set((state) => ({
    messageCache: {
      ...state.messageCache,
      [channelId]: messages
    }
  })),
  
  // Clear all cached messages
  clearCache: () => set({ 
    messageCache: {}, 
    currentChannelId: null 
  }),
  
  // Update connection status
  setConnected: (connected) => set({ isConnected: connected }),
  
  // Update realtime connection status
  setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected })
}));

