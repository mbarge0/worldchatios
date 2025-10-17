'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import Image from 'next/image'
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

    // Logging for verification of surgical fix
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log('✅ Hero image restored to login page')
    }, [])

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
        <div className="min-h-screen grid md:grid-cols-2 bg-slate-50">
            {/* Hero side (customized with brand colors and hero image) */}
            <div className="hidden md:flex relative items-center justify-center bg-[#072d51]">
                <Image
                    src="/hero.png"
                    alt="CollabCanvas hero"
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 0vw"
                    className="object-contain object-center opacity-95"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#072d51]/80 via-[#072d51]/50 to-transparent" />

                <div className="absolute left-10 bottom-10 text-[#cfa968] max-w-sm">
                    <h1 className="text-4xl font-bold leading-tight">Welcome Back</h1>
                    <p className="mt-2 text-sm text-[#cdd2c5] opacity-90">
                        Design collaboratively with low-latency realtime editing.
                    </p>
                </div>
            </div>

            {/* Auth card */}
            <div className="flex items-center justify-center p-8 bg-[var(--brand-white)]">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-dark)]">CollabCanvas</h1>
                        <p className="text-sm text-[var(--brand-light)]">Design together, in real time.</p>
                    </div>

                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
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
                        <p className="text-center text-xs text-[var(--text-muted)] mt-4">By continuing, you agree to our terms.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}