'use client'

import AuthGuard from '@/components/layout/AuthGuard'

export default function CanvasRoute() {
    return (
        <AuthGuard>
            <div className="p-6">
                <h1 className="text-xl font-semibold">Canvas</h1>
                <p className="text-sm text-gray-600">Protected route placeholder.</p>
            </div>
        </AuthGuard>
    )
}


