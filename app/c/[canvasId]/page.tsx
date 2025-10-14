'use client'

import AuthGuard from '@/components/layout/AuthGuard'
import Avatar from '@/components/ui/Avatar'
import Toolbar from '@/components/ui/Toolbar'
import { createShape } from '@/lib/data/firestore-adapter'
import { usePresence } from '@/lib/hooks/usePresence'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const Canvas = dynamic(() => import('@/components/canvas/Canvas'), { ssr: false })

export default function CanvasPage() {
    const { canvasId } = useParams<{ canvasId: string }>()
    const { participantsRef, version } = usePresence(canvasId)

    const participants = Object.values(participantsRef.current || {}).sort((a, b) => a.displayName.localeCompare(b.displayName))

    const handleAddText = async () => {
        if (!canvasId) return
        const id = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2)
        const payload: any = {
            id,
            type: 'text',
            x: 100,
            y: 100,
            width: 200,
            height: 40,
            rotation: 0,
            zIndex: Date.now(),
            text: 'New Text',
            fontSize: 20,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 'normal',
            textAlign: 'left',
            lineHeight: 1.2,
            fill: '#111827',
            opacity: 1,
            updatedAt: Date.now(),
        }
        try { await createShape(canvasId, payload) } catch (e) { console.error('createShape(text) failed', e) }
    }

    const handleAddRect = async () => {
        if (!canvasId) return
        const id = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2)
        const payload: any = {
            id,
            type: 'rect',
            x: 120,
            y: 120,
            width: 140,
            height: 100,
            rotation: 0,
            zIndex: Date.now(),
            fill: '#60a5fa',
            stroke: '#1d4ed8',
            opacity: 1,
            updatedAt: Date.now(),
        }
        try { await createShape(canvasId, payload) } catch (e) { console.error('createShape(rect) failed', e) }
    }

    return (
        <AuthGuard>
            <div data-testid="canvas-shell" className="min-h-screen flex flex-col">
                <header data-testid="canvas-header" className="flex items-center justify-between border-b px-6 py-3">
                    <h1 className="text-xl font-semibold">Canvas</h1>
                    <div className="flex items-center gap-4">
                        <Toolbar onAddRect={handleAddRect} onAddText={handleAddText} />
                        <div className="hidden md:flex items-center gap-2" aria-label="Presence avatars">
                            {participants.map((p) => (
                                <div key={p.userId} className="flex items-center gap-2" title={p.displayName}>
                                    <Avatar displayName={p.displayName} size="sm" />
                                </div>
                            ))}
                        </div>
                        <span className="text-xs text-gray-500">ID: {canvasId}</span>
                    </div>
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