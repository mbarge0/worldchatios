'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
    const router = useRouter()
    const {
        loading,
        user,
        sendMagicLink,
        completeMagicLink,
        signInWithEmailPassword,
        signUpWithEmailPassword,
        signOut
    } = useFirebaseAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mode, setMode] = useState<'magic' | 'password'>('magic')
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // ✅ Complete magic link if redirected back from email
    useEffect(() => {
        completeMagicLink()
    }, [completeMagicLink])

    // ✅ Redirect authenticated users to canvas automatically
    useEffect(() => {
        if (!loading && user) {
            router.replace('/c/default') // Or your actual workspace route
        }
    }, [loading, user, router])

    const onSendMagic = async () => {
        setSubmitting(true)
        setError(null)
        setMessage(null)
        const { error } = await sendMagicLink(email)
        if (error) setError(error.message)
        else setMessage('Magic link sent. Check your email to complete sign-in.')
        setSubmitting(false)
    }

    const onPasswordSignIn = async () => {
        setSubmitting(true)
        setError(null)
        const { error } = await signInWithEmailPassword(email, password)
        if (error) setError(error.message)
        setSubmitting(false)
    }

    const onPasswordSignUp = async () => {
        setSubmitting(true)
        setError(null)
        const { error } = await signUpWithEmailPassword(email, password)
        if (error) setError(error.message)
        setSubmitting(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">CollabCanvas</h1>
                    <p className="text-sm text-slate-600">Design together, in real time.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-medium mb-4">Sign in</h2>

                    {user ? (
                        <div className="space-y-4">
                            <p>You are signed in as {user.email}</p>
                            <Button variant="secondary" onClick={signOut}>Sign out</Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-2">
                                <Button
                                    variant={mode === 'magic' ? 'primary' : 'secondary'}
                                    onClick={() => setMode('magic')}
                                >
                                    Magic Link
                                </Button>
                                <Button
                                    variant={mode === 'password' ? 'primary' : 'secondary'}
                                    onClick={() => setMode('password')}
                                >
                                    Email & Password
                                </Button>
                            </div>

                            <div className="space-y-4 mt-4">
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                {mode === 'password' && (
                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                )}

                                {message && <p className="text-sm text-emerald-700">{message}</p>}
                                {error && <p className="text-sm text-rose-600">{error}</p>}

                                {mode === 'magic' ? (
                                    <Button onClick={onSendMagic} loading={submitting} disabled={!email}>
                                        Send Magic Link
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={onPasswordSignIn}
                                            loading={submitting}
                                            disabled={!email || !password}
                                        >
                                            Sign In
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={onPasswordSignUp}
                                            loading={submitting}
                                            disabled={!email || !password}
                                        >
                                            Sign Up
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <p className="text-center text-xs text-slate-500">By continuing, you agree to our terms.</p>
            </div>
        </div>
    )
}