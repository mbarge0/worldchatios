'use client'

import Avatar from '@/components/ui/Avatar'

export type PresenceUser = {
    userId: string
    displayName: string
    online: boolean
    idle?: boolean
    color?: string
}

type PresenceBarProps = {
    users: PresenceUser[]
    className?: string
}

export default function PresenceBar({ users, className }: PresenceBarProps) {
    return (
        <div className={["hidden md:flex items-center gap-2", className || ''].join(' ')} aria-label="Presence avatars">
            {users.map((u) => (
                <div key={u.userId} className="flex items-center" title={u.displayName} aria-label={u.displayName}>
                    <div className={u.online ? (u.idle ? 'opacity-70' : 'opacity-100') : 'opacity-40'}>
                        <Avatar displayName={u.displayName} size="sm" bgColor={u.color} />
                    </div>
                </div>
            ))}
        </div>
    )
}


