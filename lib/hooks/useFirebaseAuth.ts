'use client'

import { getAuthClient } from '@/lib/firebase/client'
import {
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    isSignInWithEmailLink,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    setPersistence,
    signInWithEmailAndPassword,
    signInWithEmailLink,
    type User as FirebaseUser,
} from 'firebase/auth'
import { useCallback, useEffect, useState } from 'react'

export interface UseFirebaseAuthReturn {
    user: FirebaseUser | null
    loading: boolean
    signInWithEmailPassword: (email: string, password: string) => Promise<{ error: Error | null }>
    signUpWithEmailPassword: (email: string, password: string) => Promise<{ error: Error | null }>
    sendMagicLink: (email: string) => Promise<{ error: Error | null }>
    completeMagicLink: () => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
}

const MAGIC_EMAIL_KEY = 'cc_magic_email'

export function useFirebaseAuth(): UseFirebaseAuthReturn {
    // 🧪 DEV OVERRIDE — optional shortcut for local testing
    if (process.env.NODE_ENV === 'development') {
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
        const autoDev = params.get('auto') === 'dev'

        if (autoDev) {
            console.log('🧪 Dev auto-login active: using mock user dev@local.test')
            return {
                user: { email: 'dev@local.test' } as any,
                loading: false,
                signInWithEmailPassword: async () => ({ error: null }),
                signUpWithEmailPassword: async () => ({ error: null }),
                sendMagicLink: async () => ({ error: null }),
                completeMagicLink: async () => ({ error: null }),
                signOut: async () => {
                    console.log('🧪 Dev mode: signOut() called (no-op)')
                },
            }
        }
    }

    const auth = getAuthClient()
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [loading, setLoading] = useState(true)

    // ✅ Persist session across reloads (so you stay logged in)
    useEffect(() => {
        setPersistence(auth, browserLocalPersistence).catch((e) =>
            console.error('Failed to set persistence:', e)
        )
    }, [auth])

    // --- Track auth state ---
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (fbUser) => {
            setUser(fbUser)
            setLoading(false)
        })
        return () => unsub()
    }, [auth])

    // --- Email/Password Sign-In ---
    const signInWithEmailPasswordAction = useCallback(
        async (email: string, password: string) => {
            try {
                await signInWithEmailAndPassword(auth, email, password)
                return { error: null }
            } catch (e) {
                console.error('Sign-in error:', e)
                return { error: e as Error }
            }
        },
        [auth]
    )

    // --- Email/Password Sign-Up ---
    const signUpWithEmailPasswordAction = useCallback(
        async (email: string, password: string) => {
            try {
                await createUserWithEmailAndPassword(auth, email, password)
                return { error: null }
            } catch (e) {
                console.error('Sign-up error:', e)
                return { error: e as Error }
            }
        },
        [auth]
    )

    // --- Send Magic Link ---
    const sendMagicLinkAction = useCallback(
        async (email: string) => {
            try {
                const redirectUrl =
                    process.env.NODE_ENV === 'development'
                        ? 'http://localhost:3000/login'
                        : `${process.env.NEXT_PUBLIC_APP_URL}/login`

                const actionCodeSettings = {
                    url: redirectUrl,
                    handleCodeInApp: true,
                }

                console.log('Sending magic link with settings:', actionCodeSettings)
                await sendSignInLinkToEmail(auth, email, actionCodeSettings)

                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(MAGIC_EMAIL_KEY, email)
                }

                console.log('Magic link successfully sent to:', email)
                return { error: null }
            } catch (e) {
                console.error('Error sending magic link:', e)
                return { error: e as Error }
            }
        },
        [auth]
    )

    // --- Complete Magic Link ---
    const completeMagicLinkAction = useCallback(async () => {
        try {
            if (typeof window === 'undefined') return { error: null }

            const href = window.location.href
            if (!isSignInWithEmailLink(auth, href)) return { error: null }

            let email = window.localStorage.getItem(MAGIC_EMAIL_KEY) || auth.currentUser?.email || ''
            if (!email) {
                email = window.prompt('Please confirm your email to complete sign-in') || ''
            }

            if (!email) {
                return { error: new Error('Email is required to complete magic link sign-in') }
            }

            await signInWithEmailLink(auth, email, href)
            window.localStorage.removeItem(MAGIC_EMAIL_KEY)
            console.log('Magic link sign-in complete for:', email)
            return { error: null }
        } catch (e) {
            console.error('Error completing magic link:', e)
            return { error: e as Error }
        }
    }, [auth])

    // --- Sign Out ---
    const signOut = useCallback(async () => {
        await firebaseSignOut(auth)
        console.log('User signed out')
    }, [auth])

    return {
        user,
        loading,
        signInWithEmailPassword: signInWithEmailPasswordAction,
        signUpWithEmailPassword: signUpWithEmailPasswordAction,
        sendMagicLink: sendMagicLinkAction,
        completeMagicLink: completeMagicLinkAction,
        signOut,
    }
}