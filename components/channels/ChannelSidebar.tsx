'use client';

import { Channel } from '@/lib/hooks/useChannels';
import ChannelList from './ChannelList';

interface ChannelSidebarProps {
    channels: Channel[];
    activeChannelId: string | null;
    onChannelClick: (channelId: string) => void;
    onCreateClick: () => void;
    loading: boolean;
}

export default function ChannelSidebar({
    channels,
    activeChannelId,
    onChannelClick,
    onCreateClick,
    loading
}: ChannelSidebarProps) {
    return (
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Channels</h2>
                    <button
                        onClick={onCreateClick}
                        className="text-indigo-600 hover:text-indigo-700 text-2xl leading-none font-light"
                        title="Create Channel"
                        type="button"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Channel List */}
            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <ChannelList
                        channels={channels}
                        activeChannelId={activeChannelId}
                        onChannelClick={onChannelClick}
                    />
                )}
            </div>
        </div>
    );
}

