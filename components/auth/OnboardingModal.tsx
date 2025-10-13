'use client'

import { supabase } from '@/lib/supabase/client'
import { FormEvent, useState } from 'react'

const GENERAL_CHANNEL_ID = '00000000-0000-0000-0000-000000000001'

interface OnboardingModalProps {
    userId: string
    onComplete: () => void
}

export function OnboardingModal({ userId, onComplete }: OnboardingModalProps) {
    const [displayName, setDisplayName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const validateDisplayName = (name: string): string | null => {
        if (!name || name.trim().length === 0) {
            return 'Display name is required'
        }
        if (name.length > 50) {
            return 'Display name must be 50 characters or less'
        }
        // Allow alphanumeric, underscore, hyphen, and spaces
        if (!/^[a-zA-Z0-9_\- ]+$/.test(name)) {
            return 'Display name can only contain letters, numbers, spaces, hyphens, and underscores'
        }
        return null
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')

        // Validate display name
        const validationError = validateDisplayName(displayName)
        if (validationError) {
            setError(validationError)
            return
        }

        setLoading(true)

        try {
            // Step 1: Save display name to users table
            const { error: updateError } = await supabase
                .from('users')
                .update({ display_name: displayName.trim() })
                .eq('id', userId)

            if (updateError) {
                throw new Error(`Failed to save display name: ${updateError.message}`)
            }

            // Step 2: Auto-join user to #general channel
            const { error: joinError } = await supabase
                .from('channel_members')
                .insert({
                    channel_id: GENERAL_CHANNEL_ID,
                    user_id: userId,
                })

            // Ignore duplicate key error (user already a member)
            if (joinError && joinError.code !== '23505') {
                console.error('Auto-join to #general failed:', joinError)
                // Don't throw - onboarding can continue even if auto-join fails
            }

            // Success! Close modal
            onComplete()
        } catch (err) {
            console.error('Onboarding error:', err)
            setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Modal Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Welcome to Slack Lite! 👋
                        </h2>
                        <p className="text-gray-600">
                            Let&apos;s get you set up. What should we call you?
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                                Display Name
                            </label>
                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                required
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                placeholder="Enter your name"
                                maxLength={50}
                                autoFocus
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                This is how you&apos;ll appear to others. Max 50 characters.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm border border-red-200" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Setting up your account...
                                </>
                            ) : (
                                'Continue to Slack Lite'
                            )}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Good to know:</strong> You&apos;ll automatically be added to the #general channel
                            where you can start chatting with others.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

