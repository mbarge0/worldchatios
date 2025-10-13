'use client';

import { Channel } from '@/lib/hooks/useChannels';
import ChannelItem from './ChannelItem';

interface ChannelListProps {
    channels: Channel[];
    activeChannelId: string | null;
    onChannelClick: (channelId: string) => void;
}

export default function ChannelList({ channels, activeChannelId, onChannelClick }: ChannelListProps) {
    if (channels.length === 0) {
        return (
            <div className="px-4 py-2 text-gray-500 text-sm">
                No channels available
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {channels.map(channel => (
                <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    onClick={onChannelClick}
                />
            ))}
        </div>
    );
}

