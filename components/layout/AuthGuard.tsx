'use client'

import Spinner from '@/components/ui/Spinner'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
    children: React.ReactNode
}

export default function AuthGuard({ children }: Props) {
    const { user, loading } = useFirebaseAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login')
        }
    }, [loading, user, router])

    if (loading || !user) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    return <>{children}</>
}


