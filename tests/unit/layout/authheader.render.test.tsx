import AuthHeader from '@/components/layout/AuthHeader'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }))

vi.mock('@/lib/hooks/useFirebaseAuth', () => ({
  useFirebaseAuth: () => ({ user: { email: 'u@example.com' }, signOut: vi.fn().mockResolvedValue(undefined) }),
}))

describe('AuthHeader', () => {
  it('renders logout button when user is present', () => {
    render(<AuthHeader />)
    expect(screen.getByText('Logout')).toBeInTheDocument()
    expect(screen.getByText('u@example.com')).toBeInTheDocument()
  })
})


