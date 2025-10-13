'use client';

import { validateChannelName } from '@/lib/hooks/useChannels';
import { useState } from 'react';

interface ChannelCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, description: string, isPrivate: boolean) => Promise<void>;
}

export default function ChannelCreateModal({ isOpen, onClose, onCreate }: ChannelCreateModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate name
        const validation = validateChannelName(name);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid channel name');
            return;
        }

        setLoading(true);

        try {
            await onCreate(name.trim().toLowerCase(), description.trim(), isPrivate);
            // Reset form
            setName('');
            setDescription('');
            setIsPrivate(false);
            onClose();
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'Failed to create channel');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setName('');
            setDescription('');
            setIsPrivate(false);
            setError('');
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Create Channel
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {/* Channel Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Channel Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., engineering"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                maxLength={50}
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Lowercase, alphanumeric, hyphens, and underscores only
                            </p>
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this channel about?"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows={3}
                                maxLength={200}
                                disabled={loading}
                            />
                        </div>

                        {/* Privacy Toggle */}
                        <div className="mb-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    disabled={loading}
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    Make this channel private
                                </span>
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

