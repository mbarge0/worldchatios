'use client'

import { createShape, deleteShape } from '@/lib/data/firestore-adapter'
import { usePresence } from '@/lib/hooks/usePresence'
import { useCanvasStore } from '@/lib/store/canvas-store'
import { useEffect, useRef, useState } from 'react'
import { Layer, Stage } from 'react-konva'
import CursorLayer from './CursorLayer'
import SelectionLayer from './SelectionLayer'
import ShapeLayer from './ShapeLayer'
import TextEditModal from './TextEditModal'
import TransformHandles from './TransformHandles'

type CanvasStageProps = {
    width?: number
    height?: number
    canvasId?: string
}

export default function CanvasStage({ width, height, canvasId }: CanvasStageProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
        width: width ?? 0,
        height: height ?? 0,
    })

    const {
        viewport,
        setScale,
        setPosition,
        setMode,
        mode,
        clearSelection,
        removeSelectedNodes,
        nudgeSelected,
        selectedIds,
    } = useCanvasStore()

    // presence hook
    const { cursorsRef, sendCursor } = usePresence(canvasId)

    // --- 1. Measure size (with safe fallback + animation frame) ---
    useEffect(() => {
        const updateSize = () => {
            const rect = containerRef.current?.getBoundingClientRect()
            if (rect && rect.width > 0 && rect.height > 0) {
                setContainerSize({
                    width: Math.floor(rect.width),
                    height: Math.floor(rect.height),
                })
            } else {
                // fallback to viewport
                setContainerSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                })
            }
        }

        // run once after layout settles
        requestAnimationFrame(updateSize)

        // watch for resize
        const observer = new ResizeObserver(() => requestAnimationFrame(updateSize))
        if (containerRef.current) observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    // --- 2. Keyboard handling ---
    useEffect(() => {
        containerRef.current?.focus()
    }, [])

    const handleKeyDown = async (ev: React.KeyboardEvent<HTMLDivElement>) => {
        const baseStep = ev.shiftKey ? 10 : 1
        const step = baseStep / Math.max(0.0001, viewport.scale)
        if (ev.key === 'ArrowLeft') {
            nudgeSelected(-step, 0)
            ev.preventDefault()
        } else if (ev.key === 'ArrowRight') {
            nudgeSelected(step, 0)
            ev.preventDefault()
        } else if (ev.key === 'ArrowUp') {
            nudgeSelected(0, -step)
            ev.preventDefault()
        } else if (ev.key === 'ArrowDown') {
            nudgeSelected(0, step)
            ev.preventDefault()
        } else if (ev.key === 'Escape') {
            clearSelection()
        } else if (ev.key === 'Backspace' || ev.key === 'Delete') {
            if (selectedIds.length > 0) {
                // Optimistic remove + persist deletions
                const ids = [...selectedIds]
                removeSelectedNodes()
                if (canvasId) {
                    for (const id of ids) {
                        deleteShape(canvasId, id).catch(() => { })
                    }
                }
                ev.preventDefault()
            }
        } else if (ev.key.toLowerCase() === 't') {
            // Create a new text shape centered in viewport
            if (!canvasId) return
            const id = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2)
            const centerX = (stageWidth / 2 - viewport.position.x) / viewport.scale
            const centerY = (stageHeight / 2 - viewport.position.y) / viewport.scale
            const payload: any = {
                id,
                type: 'text',
                x: centerX,
                y: centerY,
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
            try {
                await createShape(canvasId, payload)
            } catch (e) {
                console.error('createShape(text) failed', e)
            }
        } else if (ev.key.toLowerCase() === 'r') {
            // Create a new rectangle shape centered in viewport
            if (!canvasId) return
            const id =
                typeof crypto !== 'undefined' && (crypto as any).randomUUID
                    ? (crypto as any).randomUUID()
                    : Math.random().toString(36).slice(2)
            const centerX = (stageWidth / 2 - viewport.position.x) / viewport.scale
            const centerY = (stageHeight / 2 - viewport.position.y) / viewport.scale
            const payload: any = {
                id,
                type: 'rect',
                x: centerX - 50,
                y: centerY - 30,
                width: 100,
                height: 60,
                rotation: 0,
                zIndex: Date.now(),
                fill: '#60a5fa', // Tailwind blue-400
                stroke: '#1d4ed8', // Tailwind blue-700
                opacity: 1,
                updatedAt: Date.now(),
            }
            try {
                await createShape(canvasId, payload)
            } catch (e) {
                console.error('createShape(rect) failed', e)
            }
        } else if (ev.key === 'Enter') {
            // Enter opens editor when single selected text node
            if (selectedIds.length === 1) {
                const id = selectedIds[0]
                const n = (useCanvasStore.getState().nodes as any[]).find((m) => m.id === id)
                if (n && n.type === 'text') {
                    setEditingTextId(id)
                    ev.preventDefault()
                }
            }
        }
    }

    // --- 3. Zooming and Panning ---
    const handleWheel = (e: any) => {
        e.evt.preventDefault()
        const stage = e.target.getStage()
        if (!stage) return

        const oldScale = viewport.scale
        const pointer = stage.getPointerPosition()
        if (!pointer) return

        const scaleBy = 1.05
        const direction = e.evt.deltaY > 0 ? -1 : 1
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

        const mousePointTo = {
            x: (pointer.x - viewport.position.x) / oldScale,
            y: (pointer.y - viewport.position.y) / oldScale,
        }

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        }

        setScale(newScale)
        setPosition(newPos)
    }

    const isSpaceDownRef = useRef(false)
    useEffect(() => {
        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.code === 'Space') isSpaceDownRef.current = true
        }
        const onKeyUp = (ev: KeyboardEvent) => {
            if (ev.code === 'Space') {
                isSpaceDownRef.current = false
                if (mode === 'panning') setMode('idle')
            }
        }
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [mode, setMode])

    const lastPosRef = useRef<{ x: number; y: number } | null>(null)
    const handleMouseDown = (e: any) => {
        if (!isSpaceDownRef.current) return
        setMode('panning')
        const pointer = e.target.getStage()?.getPointerPosition()
        if (!pointer) return
        lastPosRef.current = { x: pointer.x, y: pointer.y }
    }
    const handleMouseMove = (e: any) => {
        const stage = e.target.getStage()
        if (!stage) return
        const pointer = stage.getPointerPosition()
        if (pointer) {
            // convert to world coords (inverse of viewport transform)
            const worldX = (pointer.x - viewport.position.x) / viewport.scale
            const worldY = (pointer.y - viewport.position.y) / viewport.scale
            sendCursor(worldX, worldY)
        }
        if (mode !== 'panning') return
        if (!pointer || !lastPosRef.current) return
        const dx = pointer.x - lastPosRef.current.x
        const dy = pointer.y - lastPosRef.current.y
        lastPosRef.current = { x: pointer.x, y: pointer.y }
        setPosition({ x: viewport.position.x + dx, y: viewport.position.y + dy })
    }
    const handleMouseUp = () => {
        if (mode === 'panning') setMode('idle')
        lastPosRef.current = null
    }

    // --- 4. Safe computed stage size ---
    const stageWidth = containerSize.width || window.innerWidth
    const stageHeight = containerSize.height || window.innerHeight

    const remoteCursors = Object.values(cursorsRef.current)

    // --- 6. Inline Text Editing Modal ---
    const [editingTextId, setEditingTextId] = useState<string | null>(null)
    const { nodes, updateNode } = useCanvasStore()
    const activeText = editingTextId ? (nodes.find((n: any) => n.id === editingTextId) as any) : null
    const initialText = activeText?.text ?? ''
    const handleEditText = (id: string) => setEditingTextId(id)
    const handleSaveText = async (text: string) => {
        if (!canvasId || !editingTextId) return
        try {
            // Optimistic local update
            updateNode(editingTextId, { text } as any)
            await createShape // no-op to keep import
        } catch { }
        // Persist via adapter update
        try {
            const { updateShape } = await import('@/lib/data/firestore-adapter')
            await updateShape(canvasId, editingTextId, { text } as any)
        } catch (e) {
            console.error('updateShape(text) failed', e)
        }
    }

    // --- 5. FPS meter (optional via NEXT_PUBLIC_SHOW_FPS=1) ---
    const [fps, setFps] = useState<number | null>(null)
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_SHOW_FPS !== '1') return
        let last = performance.now()
        let frames = 0
        let rafId: number
        let timerId: any
        const loop = () => {
            frames++
            rafId = requestAnimationFrame(loop)
        }
        const tick = () => {
            const now = performance.now()
            const delta = now - last
            const currentFps = (frames * 1000) / Math.max(1, delta)
            setFps(Math.round(currentFps))
            frames = 0
            last = now
            timerId = setTimeout(tick, 500)
        }
        rafId = requestAnimationFrame(loop)
        timerId = setTimeout(tick, 500)
        return () => {
            cancelAnimationFrame(rafId)
            clearTimeout(timerId)
        }
    }, [])

    // --- 6. Render Stage ---
    return (
        <div
            ref={containerRef}
            data-testid="canvas-stage-container"
            className="w-full h-full bg-gray-100"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <Stage
                data-testid="canvas-stage"
                width={stageWidth}
                height={stageHeight}
                scaleX={viewport.scale}
                scaleY={viewport.scale}
                x={viewport.position.x}
                y={viewport.position.y}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ background: '#fafafa' }}
            >
                <Layer data-testid="canvas-base-layer">
                    <ShapeLayer onEditText={handleEditText} />
                    <SelectionLayer />
                    <TransformHandles />
                </Layer>
                {/* Render remote cursors in world space; they inherit stage transform */}
                <CursorLayer cursors={remoteCursors} />
            </Stage>
            <TextEditModal
                isOpen={!!editingTextId}
                initialText={initialText}
                onClose={() => setEditingTextId(null)}
                onSave={handleSaveText}
            />
            {fps !== null && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{fps} fps</div>
            )}
        </div>
    )
}