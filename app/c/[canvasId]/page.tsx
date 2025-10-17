'use client'

import ChatDrawer from '@/components/chat/ChatDrawer'
import AuthGuard from '@/components/layout/AuthGuard'
import AuthHeader from '@/components/layout/AuthHeader'
import PresenceBar from '@/components/layout/PresenceBar'
import Toolbar from '@/components/ui/Toolbar'
import { exportCanvas as aiExportCanvas, exportSelection as aiExportSelection, alignShapes, normalizeZIndex, persistZIndexNormalization, zIndexUpdate } from '@/lib/ai/actions'
import { createShape, listShapes as fsListShapes, restoreVersionSnapshot, saveVersionSnapshot } from '@/lib/data/firestore-adapter'
import { usePresence } from '@/lib/hooks/usePresence'
import { useCanvasStore } from '@/lib/store/canvas-store'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const Canvas = dynamic(() => import('@/components/canvas/Canvas'), { ssr: false })

export default function CanvasPage() {
    const { canvasId } = useParams<{ canvasId: string }>()
    const { participantsRef, version } = usePresence(canvasId)
    const { selectedIds, nodes, removeSelectedNodes, setNodes } = useCanvasStore()
    const [showGrid, setShowGrid] = useState<boolean>(false)
    const [chatOpen, setChatOpen] = useState<boolean>(false)
    // Test-only hook to open/toggle chat programmatically (used by E2E)
    useEffect(() => {
        if (typeof window === 'undefined') return
        const w = window as any
        const toggle = () => setChatOpen((v: boolean) => !v)
        w.__ccToggleChat = toggle
        const onEvt = () => toggle()
        window.addEventListener('cc:toggle-chat', onEvt)
        return () => {
            try { delete w.__ccToggleChat } catch { /* ignore */ }
            window.removeEventListener('cc:toggle-chat', onEvt)
        }
    }, [])

    const participants = Object.values(participantsRef.current || {}).sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
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
        // Spawn at viewport center under current zoom
        const centerX = (window.innerWidth / 2 - (stageRef.current?.getStage?.()?.x() || 0)) / (stageRef.current?.getStage?.()?.scaleX() || 1)
        const centerY = (window.innerHeight / 2 - (stageRef.current?.getStage?.()?.y() || 0)) / (stageRef.current?.getStage?.()?.scaleY() || 1)
        const payload: any = {
            id,
            type: 'text',
            x: Math.round(centerX - 100),
            y: Math.round(centerY - 20),
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
        const centerX = (window.innerWidth / 2 - (stageRef.current?.getStage?.()?.x() || 0)) / (stageRef.current?.getStage?.()?.scaleX() || 1)
        const centerY = (window.innerHeight / 2 - (stageRef.current?.getStage?.()?.y() || 0)) / (stageRef.current?.getStage?.()?.scaleY() || 1)
        const payload: any = {
            id,
            type: 'rect',
            x: Math.round(centerX - 70),
            y: Math.round(centerY - 50),
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

    // --- Toolbar actions wiring ---
    const handleDuplicate = async () => {
        if (!canvasId) return
        if (selectedIds.length === 0) return
        const now = Date.now()
        const clones = selectedIds.map((id) => {
            const base: any = nodes.find((n: any) => n.id === id)
            if (!base) return null
            const id2 = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2)
            return { ...base, id: id2, x: base.x + 16, y: base.y + 16, zIndex: now + Math.random() }
        }).filter(Boolean) as any[]
        for (const c of clones) {
            await createShape(canvasId, { ...(c as any), updatedAt: Date.now() } as any)
        }
    }

    const handleDelete = async () => {
        if (!canvasId) return
        if (selectedIds.length === 0) return
        const ids = [...selectedIds]
        removeSelectedNodes()
        for (const id of ids) {
            try { await (await import('@/lib/data/firestore-adapter')).deleteShape(canvasId, id) } catch { }
        }
    }

    const handleZIndex = async (op: 'front' | 'back' | 'forward' | 'backward') => {
        if (!canvasId || selectedIds.length === 0) return
        const updated = await zIndexUpdate(canvasId, nodes as any, selectedIds, op)
        setNodes(updated as any)
    }

    const handleToggleGrid = () => setShowGrid((v: boolean) => !v)

    const handleAlign = async (op: 'left' | 'centerX' | 'right' | 'top' | 'middleY' | 'bottom' | 'distributeH' | 'distributeV') => {
        if (!canvasId || selectedIds.length < 2) return
        const updated = await alignShapes(canvasId, nodes as any, selectedIds, op)
        setNodes(updated as any)
    }

    // Export handlers
    const stageRef = useRef<any>(null)
    const download = (dataUrl: string, filename: string) => {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
    }
    const handleExport = (op: 'png1x' | 'png2x' | 'png4x' | 'svg') => {
        const stage = (stageRef as any).current?.getStage?.()
        if (!stage) return
        if (op.startsWith('png')) {
            const scale = op === 'png4x' ? 4 : op === 'png2x' ? 2 : 1
            const url = aiExportCanvas(stage, scale as 1 | 2 | 4)
            download(url, `canvas-${scale}x.png`)
        } else if (op === 'svg') {
            // Simple SVG for current nodes (rect/text only)
            const w = Math.floor(stage.width())
            const h = Math.floor(stage.height())
            const shapes = nodes.map((n: any) => {
                if (n.type === 'rect') {
                    return `<rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" fill="${n.fill || '#E5E7EB'}" stroke="${n.stroke || '#94A3B8'}" />`
                } else {
                    const fill = n.fill || '#111827'
                    const fs = n.fontSize || 18
                    return `<text x="${n.x}" y="${n.y + fs}" font-size="${fs}" font-family="${n.fontFamily || 'Inter,sans-serif'}" fill="${fill}">${(n.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`
                }
            }).join('\n')
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#ffffff"/>${shapes}</svg>`
            const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
            download(url, 'canvas.svg')
        }
    }
    const handleExportSelection = (op: 'png1x' | 'png2x' | 'png4x' | 'svg') => {
        const stage = (stageRef as any).current?.getStage?.()
        if (!stage) return
        if (selectedIds.length === 0) return
        const sel = nodes.filter((n: any) => selectedIds.includes(n.id)) as any[]
        const minX = Math.min(...sel.map((n) => n.x))
        const minY = Math.min(...sel.map((n) => n.y))
        const maxX = Math.max(...sel.map((n) => n.x + n.width))
        const maxY = Math.max(...sel.map((n) => n.y + n.height))
        const rect = { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
        const scale = op === 'png4x' ? 4 : op === 'png2x' ? 2 : 1
        const url = aiExportSelection(stage, rect, scale as 1 | 2 | 4)
        download(url, `selection-${scale}x.png`)
    }

    // Normalize zIndex utility (optional action via console or future menu)
    const normalizeZ = async () => {
        if (!canvasId) return
        const next = normalizeZIndex(nodes as any)
        setNodes(next as any)
        await persistZIndexNormalization(canvasId, next as any)
    }

    // Version history actions
    const handleSaveVersion = async () => {
        if (!canvasId) return
        const shapes = await fsListShapes(canvasId)
        await saveVersionSnapshot(canvasId, { shapes })
    }
    const handleRestoreVersion = async () => {
        if (!canvasId) return
        // For simplicity, restore most recent snapshot
        const versions = await (await import('@/lib/data/firestore-adapter')).listVersionSnapshots(canvasId)
        const latest = versions[0]
        if (latest) await restoreVersionSnapshot(canvasId, latest.id)
    }

    return (
        <AuthGuard>
            <div data-testid="canvas-shell" className="min-h-screen flex flex-col bg-slate-50">
                <header data-testid="canvas-header" className="grid grid-cols-[1fr_auto_1fr] items-center border-b bg-[var(--brand-dark)] text-[var(--brand-white)] backdrop-blur px-6 h-[52px] lg:h-14 shadow-sm border-[var(--brand-gold)]/30">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--brand-gold)]" />
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
                    {/* Left-docked toolbar (13B-1) */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex items-center pointer-events-auto">
                        <Toolbar
                            orientation="vertical"
                            onToggleChat={() => setChatOpen((v: boolean) => !v)}
                            onAddRect={handleAddRect}
                            onAddText={handleAddText}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                            onZIndex={handleZIndex}
                            onAlign={handleAlign}
                            onToggleGrid={handleToggleGrid}
                            onExport={handleExport}
                            onExportSelection={handleExportSelection}
                            onSaveVersion={handleSaveVersion}
                            onRestoreVersion={handleRestoreVersion}
                            className=""
                        />
                    </div>

                    <div className="absolute inset-0 bg-white z-0" data-testid="canvas-stage-wrapper">
                        {showGrid && (
                            <div aria-hidden className="pointer-events-none absolute inset-0"
                                style={{ backgroundImage: `linear-gradient(to right, rgba(229,231,235,0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(229,231,235,0.45) 1px, transparent 1px)`, backgroundSize: '8px 8px' }}
                            />
                        )}
                        <Canvas stageRef={stageRef} />
                    </div>
                    {/* Chat Drawer mount */}
                    <ChatDrawer canvasId={String(canvasId)} open={chatOpen} onClose={() => setChatOpen(false)} />
                </main>
            </div>
        </AuthGuard>
    )
}