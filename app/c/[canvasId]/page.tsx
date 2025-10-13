'use client'

import AuthGuard from '@/components/layout/AuthGuard'

type PageProps = { params: { canvasId: string } }

export default function CanvasRoute({ params }: PageProps) {
    const { canvasId } = params
    return (
        <AuthGuard>
            <div data-testid="canvas-shell" className="min-h-screen flex flex-col">
                <header data-testid="canvas-header" className="flex items-center justify-between border-b px-6 py-3">
                    <h1 className="text-xl font-semibold">Canvas</h1>
                    <span className="text-xs text-gray-500">ID: {canvasId}</span>
                </header>
                <main data-testid="canvas-main" className="flex-1 bg-white">
                    <div className="p-6 text-sm text-gray-600">Shell ready for Konva stage</div>
                </main>
            </div>
        </AuthGuard>
    )
}


