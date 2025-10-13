'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { FormEvent, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const { login } = useAuth()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Basic email validation
        if (!email || !email.includes('@')) {
            setMessage({ type: 'error', text: 'Please enter a valid email address' })
            return
        }

        setLoading(true)
        setMessage(null)

        const { error } = await login(email)

        if (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to send magic link' })
        } else {
            setMessage({ type: 'success', text: 'Check your email for the magic link!' })
            setEmail('') // Clear email on success
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                error={message?.type === 'error' ? undefined : undefined}
            />

            {message && (
                <div
                    className={`p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                    role="alert"
                >
                    {message.text}
                </div>
            )}

            <Button
                type="submit"
                variant="primary"
                disabled={loading}
                loading={loading}
                className="w-full"
            >
                {loading ? 'Sending magic link...' : 'Send magic link'}
            </Button>

            <p className="text-sm text-gray-600 text-center">
                We&apos;ll email you a magic link for a password-free sign in.
            </p>
        </form>
    )
}

