'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { useChatStore } from '@/lib/store/chat-store';
import { useCallback, useEffect, useState } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Channel {
    id: string;
    name: string;
    description: string | null;
    is_private: boolean;
    created_by: string | null;
    created_at: string;
}

export interface CreateChannelInput {
    name: string;
    description?: string;
    is_private?: boolean;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateChannelName(name: string): ValidationResult {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return { isValid: false, error: 'Channel name is required' };
    }

    if (trimmed.length < 1 || trimmed.length > 50) {
        return { isValid: false, error: 'Channel name must be 1-50 characters' };
    }

    const validPattern = /^[a-zA-Z0-9-_]+$/;
    if (!validPattern.test(trimmed)) {
        return {
            isValid: false,
            error: 'Channel name can only contain letters, numbers, hyphens, and underscores'
        };
    }

    return { isValid: true };
}

// ============================================================================
// HOOK
// ============================================================================

export function useChannels() {
    const { user } = useAuth();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Use Zustand for active channel state
    const activeChannelId = useChatStore((state) => state.currentChannelId);
    const setCurrentChannel = useChatStore((state) => state.setCurrentChannel);

    // ============================================================================
    // FETCH CHANNELS
    // ============================================================================

    const fetchChannels = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('channels')
                .select('*')
                .eq('is_private', false)
                .order('name', { ascending: true });

            if (fetchError) throw fetchError;

            setChannels(data || []);

            // Set #general as default active channel if present
            if (data && data.length > 0 && !activeChannelId) {
                const general = data.find(ch => ch.name === 'general');
                if (general) {
                    setCurrentChannel(general.id);
                } else {
                    // If no general, set first channel as active
                    setCurrentChannel(data[0].id);
                }
            }
        } catch (err) {
            const error = err as Error;
            console.error('Error fetching channels:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [activeChannelId, setCurrentChannel]);

    // Fetch channels on mount
    useEffect(() => {
        if (user) {
            fetchChannels();
        }
    }, [user, fetchChannels]);

    // ============================================================================
    // CREATE CHANNEL
    // ============================================================================

    const createChannel = async (
        name: string,
        description: string = '',
        isPrivate: boolean = false
    ): Promise<Channel> => {
        try {
            if (!user) throw new Error('User must be authenticated');

            // Validate channel name
            const validation = validateChannelName(name);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Normalize name to lowercase
            const normalizedName = name.toLowerCase().trim();

            // Insert channel
            const { data: newChannel, error: insertError } = await supabase
                .from('channels')
                .insert({
                    name: normalizedName,
                    description: description.trim() || null,
                    is_private: isPrivate,
                    created_by: user.id
                })
                .select()
                .single();

            if (insertError) {
                // Handle duplicate name error
                if (insertError.code === '23505') {
                    throw new Error('A channel with this name already exists');
                }
                throw insertError;
            }

            // Auto-join creator as member
            const { error: memberError } = await supabase
                .from('channel_members')
                .insert({
                    channel_id: newChannel.id,
                    user_id: user.id
                });

            if (memberError) {
                console.error('Failed to auto-join channel:', memberError);
                // Don't throw - channel exists, just log warning
            }

            // Add to local state (maintain alphabetical order)
            setChannels(prev => [...prev, newChannel].sort((a, b) => a.name.localeCompare(b.name)));

            // Set as active channel
            setCurrentChannel(newChannel.id);

            return newChannel;
        } catch (err) {
            const error = err as Error;
            console.error('Error creating channel:', error);
            throw error;
        }
    };

    // ============================================================================
    // SWITCH CHANNEL
    // ============================================================================

    const switchChannel = (channelId: string) => {
        setCurrentChannel(channelId);
        // Future: Fetch messages for this channel (Module 4)
        // Future: Mark channel as read (Module 8)
    };

    // ============================================================================
    // RETURN VALUES
    // ============================================================================

    return {
        channels,
        activeChannelId,
        loading,
        error,
        fetchChannels,
        createChannel,
        switchChannel,
    };
}

