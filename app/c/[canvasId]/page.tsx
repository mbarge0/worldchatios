'use client'

import AuthGuard from '@/components/layout/AuthGuard'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const Canvas = dynamic(() => import('@/components/canvas/Canvas'), { ssr: false })

export default function CanvasPage() {
    const { canvasId } = useParams<{ canvasId: string }>()

    return (
        <AuthGuard>
            <div data-testid="canvas-shell" className="min-h-screen flex flex-col">
                <header data-testid="canvas-header" className="flex items-center justify-between border-b px-6 py-3">
                    <h1 className="text-xl font-semibold">Canvas</h1>
                    <span className="text-xs text-gray-500">ID: {canvasId}</span>
                </header>
                <main data-testid="canvas-main" className="flex-1 bg-white min-h-0">
                    <div className="h-full" data-testid="canvas-stage-wrapper">
                        <Canvas />
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}