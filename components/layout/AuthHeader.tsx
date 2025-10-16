'use client'

import Button from '@/components/ui/Button'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthHeader() {
    const { user, signOut } = useFirebaseAuth()
    const router = useRouter()
    const [online, setOnline] = useState<boolean>(true)

    const handleLogout = async () => {
        try {
            await signOut()
            router.replace('/login')
        } catch (e) {
            // no-op: could add toast
            console.error('signOut failed', e)
        }
    }

    useEffect(() => {
        const update = () => setOnline(typeof navigator === 'undefined' ? true : navigator.onLine)
        update()
        window.addEventListener('online', update)
        window.addEventListener('offline', update)
        return () => {
            window.removeEventListener('online', update)
            window.removeEventListener('offline', update)
        }
    }, [])

    if (!user) return null
    return (
        <div className="flex items-center gap-3">
            <div aria-label="Connection status" className="hidden md:flex items-center text-xs select-none">
                <span className={"inline-flex items-center gap-1 px-2 py-1 rounded-full border " + (online ? 'border-emerald-200 text-emerald-700' : 'border-amber-200 text-amber-700')}>
                    <span className={"inline-block w-2 h-2 rounded-full " + (online ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse')}></span>
                    {online ? 'Connected' : 'Reconnecting…'}
                </span>
            </div>
            <span className="hidden md:inline text-xs text-slate-500">{user.email}</span>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
        </div>
    )
}


