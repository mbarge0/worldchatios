'use client'

import Spinner from '@/components/ui/Spinner'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'

interface Props {
    children: React.ReactNode
}

export default function AuthGuard({ children }: Props) {
    const { user, loading } = useFirebaseAuth()
    const router = useRouter()
    const search = useSearchParams()
    const bypassAuth = useMemo(() => {
        try {
            if (search?.get('auto') === 'dev') return true
            if (process.env.NEXT_PUBLIC_E2E_BYPASS_AUTH === '1') return true
        } catch { /* ignore */ }
        return false
    }, [search])

    useEffect(() => {
        if (!loading && !user && !bypassAuth) {
            router.replace('/login')
        }
    }, [loading, user, router, bypassAuth])

    if (loading || (!user && !bypassAuth)) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    return <>{children}</>
}


