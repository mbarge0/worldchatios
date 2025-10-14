import PresenceBar from '@/components/layout/PresenceBar'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('PresenceBar', () => {
    it('renders initials avatars with titles', () => {
        const users = [
            { userId: 'a', displayName: 'Alice', online: true, idle: false },
            { userId: 'b', displayName: 'Bob', online: false, idle: true },
        ]
        render(<PresenceBar users={users} />)
        expect(screen.getByLabelText('Presence avatars')).toBeInTheDocument()
        // Avatar uses title/displayName
        expect(screen.getByTitle('Alice')).toBeInTheDocument()
        expect(screen.getByTitle('Bob')).toBeInTheDocument()
    })
})


