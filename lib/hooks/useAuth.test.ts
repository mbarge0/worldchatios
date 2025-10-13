import type { Session, User } from '@supabase/supabase-js'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from './useAuth'

// Mock the Supabase client
vi.mock('@/lib/supabase/client', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
            signInWithOtp: vi.fn(),
            signOut: vi.fn(),
        },
    },
}))

import { supabase } from '@/lib/supabase/client'

const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
}

const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
    expires_at: Date.now() / 1000 + 3600,
}

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('initializes with loading state', () => {
        const mockUnsubscribe = vi.fn()
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: null },
            error: null,
        })
        vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        } as ReturnType<typeof supabase.auth.onAuthStateChange>)

        const { result } = renderHook(() => useAuth())

        expect(result.current.loading).toBe(true)
        expect(result.current.user).toBe(null)
    })

    it('loads user from existing session', async () => {
        const mockUnsubscribe = vi.fn()
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: mockSession },
            error: null,
        })
        vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        } as ReturnType<typeof supabase.auth.onAuthStateChange>)

        const { result } = renderHook(() => useAuth())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.user).toEqual(mockUser)
    })

    it('handles login with email successfully', async () => {
        const mockUnsubscribe = vi.fn()
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: null },
            error: null,
        })
        vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        } as ReturnType<typeof supabase.auth.onAuthStateChange>)
        vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
            data: {},
            error: null,
        })

        const { result } = renderHook(() => useAuth())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        let loginResult: { error: Error | null } | undefined
        await act(async () => {
            loginResult = await result.current.login('test@example.com')
        })

        expect(loginResult?.error).toBe(null)
        expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
            email: 'test@example.com',
            options: {
                emailRedirectTo: expect.stringContaining('/auth/callback'),
            },
        })
    })

    it('handles login error', async () => {
        const mockUnsubscribe = vi.fn()
        const mockError = new Error('Login failed')
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: null },
            error: null,
        })
        vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        } as ReturnType<typeof supabase.auth.onAuthStateChange>)
        vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
            data: {} as never,
            error: mockError as never,
        })

        const { result } = renderHook(() => useAuth())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        let loginResult: { error: Error | null } | undefined
        await act(async () => {
            loginResult = await result.current.login('test@example.com')
        })

        expect(loginResult?.error).toBe(mockError)
    })

    it('handles logout', async () => {
        const mockUnsubscribe = vi.fn()
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: mockSession },
            error: null,
        })
        vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        } as ReturnType<typeof supabase.auth.onAuthStateChange>)
        vi.mocked(supabase.auth.signOut).mockResolvedValue({
            error: null,
        })

        const { result } = renderHook(() => useAuth())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        await act(async () => {
            await result.current.logout()
        })

        expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('listens for auth state changes', async () => {
        let authChangeCallback: ((event: string, session: Session | null) => void) | null = null
        const mockUnsubscribe = vi.fn()

        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: null },
            error: null,
        })
        vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
            authChangeCallback = callback
            return {
                data: { subscription: { unsubscribe: mockUnsubscribe } },
            } as ReturnType<typeof supabase.auth.onAuthStateChange>
        })

        const { result } = renderHook(() => useAuth())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.user).toBe(null)

        // Simulate auth state change
        if (authChangeCallback) {
            act(() => {
                authChangeCallback('SIGNED_IN', mockSession)
            })
        }

        await waitFor(() => {
            expect(result.current.user).toEqual(mockUser)
        })
    })

    it('unsubscribes from auth changes on unmount', async () => {
        const mockUnsubscribe = vi.fn()
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: null },
            error: null,
        })
        vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        } as ReturnType<typeof supabase.auth.onAuthStateChange>)

        const { unmount } = renderHook(() => useAuth())

        await waitFor(() => {
            expect(supabase.auth.onAuthStateChange).toHaveBeenCalled()
        })

        unmount()

        expect(mockUnsubscribe).toHaveBeenCalled()
    })
})

