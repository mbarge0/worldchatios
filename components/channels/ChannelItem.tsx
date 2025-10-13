'use client';

import { Channel } from '@/lib/hooks/useChannels';

interface ChannelItemProps {
    channel: Channel;
    isActive: boolean;
    onClick: (channelId: string) => void;
}

export default function ChannelItem({ channel, isActive, onClick }: ChannelItemProps) {
    return (
        <button
            onClick={() => onClick(channel.id)}
            className={`
        w-full text-left px-4 py-2 rounded-lg transition-colors
        ${isActive
                    ? 'bg-indigo-50 text-indigo-900 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }
      `}
            type="button"
        >
            <span className="flex items-center">
                <span className="text-gray-500 mr-1">#</span>
                <span>{channel.name}</span>
            </span>
        </button>
    );
}

