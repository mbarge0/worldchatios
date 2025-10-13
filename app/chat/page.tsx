'use client'

import { OnboardingModal } from '@/components/auth/OnboardingModal'
import ChannelCreateModal from '@/components/channels/ChannelCreateModal'
import ChannelSidebar from '@/components/channels/ChannelSidebar'
import MessageArea from '@/components/chat/MessageArea'
import ChatLayout from '@/components/layout/ChatLayout'
import { useAuth } from '@/lib/hooks/useAuth'
import { useChannels } from '@/lib/hooks/useChannels'
import { useMessages } from '@/lib/hooks/useMessages'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ChatPage() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const [needsOnboarding, setNeedsOnboarding] = useState(false)
    const [checkingOnboarding, setCheckingOnboarding] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Channel management
    const {
        channels,
        activeChannelId,
        loading: channelsLoading,
        error: channelsError,
        switchChannel,
        createChannel
    } = useChannels()

    // Message management
    const {
        messages,
        loading: messagesLoading,
        sendMessage,
        editMessage,
        deleteMessage
    } = useMessages()

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
        }
    }, [user, loading, router])

    // Check if user needs onboarding
    useEffect(() => {
        if (!user) return

        const checkOnboarding = async () => {
            setCheckingOnboarding(true)

            const { data, error } = await supabase
                .from('users')
                .select('display_name')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Onboarding check failed:', error)
                setCheckingOnboarding(false)
                return
            }

            setNeedsOnboarding(!data?.display_name)
            setCheckingOnboarding(false)
        }

        checkOnboarding()
    }, [user])

    const handleLogout = async () => {
        await logout()
        router.push('/')
    }

    // Show loading state
    if (loading || checkingOnboarding) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // Don't render if not authenticated
    if (!user) {
        return null
    }

    const activeChannel = channels.find(c => c.id === activeChannelId);

    return (
        <>
            {/* Show onboarding modal if needed */}
            {needsOnboarding && (
                <OnboardingModal
                    userId={user.id}
                    onComplete={() => setNeedsOnboarding(false)}
                />
            )}

            {/* Create Channel Modal */}
            <ChannelCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={async (name, description, isPrivate) => {
                    await createChannel(name, description, isPrivate);
                    setIsCreateModalOpen(false);
                }}
            />

            {/* Main Chat Layout */}
            <ChatLayout
                header={
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Slack Lite</h1>
                            <p className="text-sm text-gray-600">Welcome, {user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                }
                sidebar={
                    <ChannelSidebar
                        channels={channels}
                        activeChannelId={activeChannelId}
                        onChannelClick={switchChannel}
                        onCreateClick={() => setIsCreateModalOpen(true)}
                        loading={channelsLoading}
                    />
                }
                messageArea={
                    channelsError ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-red-600 p-4">
                                <p className="font-semibold mb-2">Error loading channels</p>
                                <p className="text-sm">{channelsError}</p>
                            </div>
                        </div>
                    ) : activeChannelId && activeChannel && user ? (
                        <MessageArea
                            messages={messages}
                            loading={messagesLoading}
                            currentUserId={user.id}
                            currentChannelName={activeChannel.name}
                            onSend={sendMessage}
                            onEditMessage={editMessage}
                            onDeleteMessage={deleteMessage}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                                <p className="text-lg">Select a channel to get started</p>
                            </div>
                        </div>
                    )
                }
            />
        </>
    )
}

