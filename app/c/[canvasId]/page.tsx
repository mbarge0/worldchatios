'use client'

import AuthGuard from '@/components/layout/AuthGuard'
import AuthHeader from '@/components/layout/AuthHeader'
import PresenceBar from '@/components/layout/PresenceBar'
import { createShape } from '@/lib/data/firestore-adapter'
import { usePresence } from '@/lib/hooks/usePresence'
import { Square, Type } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const Canvas = dynamic(() => import('@/components/canvas/Canvas'), { ssr: false })

export default function CanvasPage() {
    const { canvasId } = useParams<{ canvasId: string }>()
    const { participantsRef, version } = usePresence(canvasId)

    const participants = Object.values(participantsRef.current || {}).sort((a, b) => a.displayName.localeCompare(b.displayName))
    const presenceUsers = participants.map((p) => ({
        userId: p.userId,
        displayName: p.displayName,
        online: p.online,
        idle: (Date.now() - (p.ts || 0)) > 2 * 60 * 1000,
        color: p.color,
    }))

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
            <div data-testid="canvas-shell" className="min-h-screen flex flex-col bg-slate-50">
                <header data-testid="canvas-header" className="grid grid-cols-[1fr_auto_1fr] items-center border-b bg-white/90 backdrop-blur px-6 h-[52px] lg:h-14 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                        <h1 className="text-xl font-semibold">CollabCanvas</h1>
                    </div>
                    <div className="flex items-center justify-center">
                        <PresenceBar users={presenceUsers} />
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <AuthHeader />
                        <span className="hidden md:inline text-xs text-gray-500">ID: {canvasId}</span>
                    </div>
                </header>
                <main
                    data-testid="canvas-main"
                    className="flex-1 relative overflow-hidden"
                >
                    {/* Left vertical toolbar */}
                    <div className="absolute left-4 top-4 z-10">
                        <div className="flex flex-col gap-2 bg-white/90 backdrop-blur rounded-xl shadow border p-2">
                            <button onClick={handleAddRect} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800">
                                <Square className="w-4 h-4" />
                                <span className="text-sm">Rectangle</span>
                            </button>
                            <button onClick={handleAddText} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800">
                                <Type className="w-4 h-4" />
                                <span className="text-sm">Text</span>
                            </button>
                        </div>
                    </div>

                    <div
                        className="absolute inset-0 bg-white"
                        data-testid="canvas-stage-wrapper"
                    >
                        <Canvas />
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}