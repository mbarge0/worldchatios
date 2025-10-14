import CanvasPage from '@/app/c/[canvasId]/page'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
    useParams: () => ({ canvasId: 'test' }),
    useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/components/canvas/Canvas', () => ({
    __esModule: true,
    default: () => <div data-testid="MockCanvas" />,
}))

vi.mock('@/components/layout/AuthGuard', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/lib/hooks/useFirebaseAuth', () => ({
    useFirebaseAuth: () => ({ user: { email: 'test@example.com' }, loading: false, signOut: vi.fn() }),
}))

vi.mock('@/lib/hooks/usePresence', () => ({
    usePresence: () => ({
        participantsRef: {
            current: {
                a: { userId: 'a', displayName: 'Alice', color: '#f00', online: true, ts: 1 },
                b: { userId: 'b', displayName: 'Bob', color: '#0f0', online: true, ts: 2 },
            },
        },
        version: 1,
    }),
}))

describe('Canvas header presence avatars', () => {
    it('renders avatars for participants', () => {
        render(<CanvasPage />)
        // Avatar component renders initials; multiple nodes can share same title
        expect(screen.getAllByTitle('Alice').length).toBeGreaterThan(0)
        expect(screen.getAllByTitle('Bob').length).toBeGreaterThan(0)
    })
})


