'use client'

import Button from '@/components/ui/Button'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import { useRouter } from 'next/navigation'

export default function AuthHeader() {
    const { user, signOut } = useFirebaseAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await signOut()
            router.replace('/login')
        } catch (e) {
            // no-op: could add toast
            console.error('signOut failed', e)
        }
    }

    if (!user) return null
    return (
        <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-slate-500">{user.email}</span>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
        </div>
    )
}


