'use client'

import { deleteShape } from '@/lib/data/firestore-adapter'
import { usePresence } from '@/lib/hooks/usePresence'
import { useCanvasStore } from '@/lib/store/canvas-store'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
    stageRef?: any
}

export default function CanvasStage({ width, height, canvasId, stageRef }: CanvasStageProps) {
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

    const { cursorsRef, sendCursor } = usePresence(canvasId)

    // --- 1. Measure container size ---
    useEffect(() => {
        const updateSize = () => {
            const rect = containerRef.current?.getBoundingClientRect()
            if (rect && rect.width > 0 && rect.height > 0) {
                setContainerSize({
                    width: Math.floor(rect.width),
                    height: Math.floor(rect.height),
                })
            } else {
                setContainerSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                })
            }
        }

        requestAnimationFrame(updateSize)
        const observer = new ResizeObserver(() => requestAnimationFrame(updateSize))
        if (containerRef.current) observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    // --- 2. Keyboard shortcuts (move, delete, create) ---
    useEffect(() => {
        containerRef.current?.focus()
    }, [])

    const handleKeyDown = async (ev: React.KeyboardEvent<HTMLDivElement>) => {
        const baseStep = ev.shiftKey ? 10 : 1
        const step = baseStep / Math.max(0.0001, viewport.scale)

        if (ev.key === 'g' || ev.key === 'G') {
            // grid toggle will be handled by page toolbar; no-op placeholder for future state
        } else if (ev.key === 'ArrowLeft') {
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
                const ids = [...selectedIds]
                removeSelectedNodes()
                if (canvasId) {
                    for (const id of ids) {
                        deleteShape(canvasId, id).catch(() => { })
                    }
                }
                ev.preventDefault()
            }
        }
    }

    // --- 3. Zooming ---
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

    // --- 4. Click-and-drag panning ---
    const lastPosRef = useRef<{ x: number; y: number } | null>(null)

    const handleMouseDown = (e: any) => {
        const stage = e.target.getStage()
        if (!stage) return
        // Only pan if clicking on empty area
        if (e.target === stage) {
            setMode('panning')
            const pointer = stage.getPointerPosition()
            if (pointer) {
                lastPosRef.current = { x: pointer.x, y: pointer.y }
            }
        }
    }

    const handleMouseMove = (e: any) => {
        const stage = e.target.getStage()
        if (!stage) return
        const pointer = stage.getPointerPosition()
        if (pointer) {
            const worldX = (pointer.x - viewport.position.x) / viewport.scale
            const worldY = (pointer.y - viewport.position.y) / viewport.scale
            sendCursor(worldX, worldY)
        }

        if (mode === 'panning' && pointer && lastPosRef.current) {
            const dx = pointer.x - lastPosRef.current.x
            const dy = pointer.y - lastPosRef.current.y
            lastPosRef.current = { x: pointer.x, y: pointer.y }
            setPosition({ x: viewport.position.x + dx, y: viewport.position.y + dy })
        }
    }

    const handleMouseUp = () => {
        if (mode === 'panning') setMode('idle')
        lastPosRef.current = null
    }

    // --- 5. Stage size ---
    const stageWidth = containerSize.width || window.innerWidth
    const stageHeight = containerSize.height || window.innerHeight

    // --- 6. Remote cursors ---
    const [remoteCursors, setRemoteCursors] = useState<any[]>([])
    useEffect(() => {
        const updateCursors = () => {
            setRemoteCursors(Object.values(cursorsRef.current))
        }
        const interval = setInterval(updateCursors, 100)
        return () => clearInterval(interval)
    }, [cursorsRef])

    // --- 7. Inline Text Editing ---
    const [editingTextId, setEditingTextId] = useState<string | null>(null)
    const { nodes, updateNode } = useCanvasStore()
    const activeNode = editingTextId ? nodes.find((n: any) => n.id === editingTextId) : undefined
    const isTextNode = (n: any): n is { id: string; type: 'text'; text: string } => !!n && n.type === 'text'
    const activeTextNode = isTextNode(activeNode) ? activeNode : undefined
    const initialText = activeTextNode?.text ?? ''
    const handleEditText = useCallback((id: string) => {
        // eslint-disable-next-line no-console
        console.log('CanvasStage.handleEditText called with:', id)
        setEditingTextId(id)
    }, [])
    const handleSaveText = async (text: string) => {
        if (!canvasId || !editingTextId) return
        try {
            if (isTextNode(activeNode)) {
                updateNode(editingTextId, { text } as any)
            }
            const { updateShape } = await import('@/lib/data/firestore-adapter')
            await updateShape(canvasId, editingTextId, { text } as any)
        } catch (e) {
            console.error('updateShape(text) failed', e)
        }
    }

    // --- 8. Render Stage ---
    return (
        <div
            ref={containerRef}
            data-testid="canvas-stage-container"
            className="w-full h-full bg-gray-100"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <Stage id="canvas-stage" ref={stageRef}
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
                listening={mode !== 'panning'}
                style={useMemo(() => ({
                    background: '#fafafa',
                    cursor: mode === 'panning' ? 'grabbing' : 'default',
                }), [mode])}
            >
                {useMemo(() => (
                    <Layer data-testid="canvas-base-layer">
                        <ShapeLayer onEditText={handleEditText} />
                        <SelectionLayer />
                        <TransformHandles />
                    </Layer>
                ), [handleEditText])}
                <CursorLayer cursors={remoteCursors} />
            </Stage>

            {/* Diagnostic: log modal state */}
            {/* eslint-disable-next-line no-console */}
            {(() => { return null })()}
            <TextEditModal
                isOpen={!!editingTextId}
                initialText={initialText}
                onClose={() => setEditingTextId(null)}
                onSave={handleSaveText}
            />
        </div>
    )
}