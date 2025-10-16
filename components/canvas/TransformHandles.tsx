'use client'

import { useShapeWriter } from '@/lib/hooks/useShapeWriter'
import { useCanvasStore } from '@/lib/store/canvas-store'
import { useParams } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { Group, Rect } from 'react-konva'

export default function TransformHandles() {
    const { nodes, selectedIds, updateSelectedNodes, startTransformSession, updateTransformSession, endTransformSession } = useCanvasStore()
    const [guide, setGuide] = useState<{ vx?: number; hy?: number } | null>(null)

    const selectedNodes = useMemo(() => nodes.filter((n) => selectedIds.includes(n.id)), [nodes, selectedIds])
    const bbox = useMemo(() => {
        if (selectedNodes.length === 0) return null
        const minX = Math.min(...selectedNodes.map((n) => n.x))
        const minY = Math.min(...selectedNodes.map((n) => n.y))
        const maxX = Math.max(...selectedNodes.map((n) => n.x + n.width))
        const maxY = Math.max(...selectedNodes.map((n) => n.y + n.height))
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    }, [selectedNodes])

    const { canvasId } = useParams<{ canvasId: string }>()
    const { beginTransform, debouncedUpdate, commitTransform } = useShapeWriter(canvasId)

    const dragStartRef = useRef<{ x: number; y: number } | null>(null)
    const originalBBoxRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
    const originalNodesRef = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({})
    const activeCornerRef = useRef<'tl' | 'tr' | 'bl' | 'br' | null>(null)
    const rafPendingRef = useRef(false)
    const handleDragStart = (e: any) => {
        if (selectedNodes.length === 1) {
            startTransformSession(selectedNodes[0].id)
            beginTransform(selectedNodes[0].id, selectedNodes[0])
        }
        dragStartRef.current = { x: e.target.x(), y: e.target.y() }
    }
    const handleDragMove = (e: any) => {
        if (!dragStartRef.current || !bbox) return
        const dx = e.target.x() - dragStartRef.current.x
        const dy = e.target.y() - dragStartRef.current.y
        // Snap to 8px grid with 6px magnet
        const snap = (v: number) => Math.round(v / 8) * 8
        const mx = 6
        updateSelectedNodes((node) => {
            const nextX = node.x + dx
            const nextY = node.y + dy
            const sx = Math.abs(nextX - snap(nextX)) <= mx ? snap(nextX) : nextX
            const sy = Math.abs(nextY - snap(nextY)) <= mx ? snap(nextY) : nextY
            return { ...node, x: sx, y: sy }
        })
        // Simple smart guides for single selection
        if (selectedNodes.length === 1) {
            const moving = selectedNodes[0]
            const nextX = moving.x + dx
            const nextY = moving.y + dy
            const cx = nextX + moving.width / 2
            const cy = nextY + moving.height / 2
            let vx: number | undefined
            let hy: number | undefined
            for (const n of nodes) {
                if (n.id === moving.id) continue
                const nx = n.x
                const ny = n.y
                const ncx = nx + n.width / 2
                const ncy = ny + n.height / 2
                const edgesX = [nx, nx + n.width, ncx]
                const edgesY = [ny, ny + n.height, ncy]
                for (const ex of edgesX) if (Math.abs(ex - cx) <= mx) vx = ex
                for (const ey of edgesY) if (Math.abs(ey - cy) <= mx) hy = ey
            }
            if (vx || hy) setGuide({ vx, hy })
            else if (guide) setGuide(null)
        }
        updateTransformSession()
        if (selectedNodes.length === 1) debouncedUpdate(selectedNodes[0].id, { x: selectedNodes[0].x + dx, y: selectedNodes[0].y + dy })
        dragStartRef.current = { x: e.target.x(), y: e.target.y() }
    }
    const handleDragEnd = () => {
        if (selectedNodes.length === 1) commitTransform(selectedNodes[0].id, selectedNodes[0])
        endTransformSession()
        dragStartRef.current = null
        setGuide(null)
    }

    const MIN_SIZE = 10

    const handleCornerDragStart = (corner: 'tl' | 'tr' | 'bl' | 'br') => (e: any) => {
        if (!bbox) return
        activeCornerRef.current = corner
        originalBBoxRef.current = { ...bbox }
        const snapshot: Record<string, { x: number; y: number; width: number; height: number }> = {}
        for (const n of selectedNodes) {
            snapshot[n.id] = { x: n.x, y: n.y, width: n.width, height: n.height }
        }
        originalNodesRef.current = snapshot
        if (selectedNodes.length === 1) {
            startTransformSession(selectedNodes[0].id)
            beginTransform(selectedNodes[0].id, selectedNodes[0])
        }
    }

    const handleCornerDragMove = (_corner: 'tl' | 'tr' | 'bl' | 'br') => (e: any) => {
        const corner = activeCornerRef.current
        const obb = originalBBoxRef.current
        if (!corner || !obb) return

        // Use absolute position to avoid group-local drift
        const abs = e.target.getAbsolutePosition()
        let newWidth = obb.width
        let newHeight = obb.height
        let originX = obb.x
        let originY = obb.y

        if (corner === 'tl') {
            newWidth = obb.width + (obb.x - abs.x)
            newHeight = obb.height + (obb.y - abs.y)
            originX = abs.x
            originY = abs.y
        } else if (corner === 'tr') {
            newWidth = abs.x - obb.x
            newHeight = obb.height + (obb.y - abs.y)
            originY = abs.y
        } else if (corner === 'bl') {
            newWidth = obb.width + (obb.x - abs.x)
            newHeight = abs.y - obb.y
            originX = abs.x
        } else if (corner === 'br') {
            newWidth = abs.x - obb.x
            newHeight = abs.y - obb.y
        }

        // Enforce minimum size to prevent flipping/shaking
        newWidth = Math.max(newWidth, MIN_SIZE)
        newHeight = Math.max(newHeight, MIN_SIZE)

        const sx = newWidth / obb.width
        const sy = newHeight / obb.height

        const snapshot = originalNodesRef.current

        const apply = () => {
            updateSelectedNodes((node) => {
                const base = snapshot[node.id]
                if (!base) return node
                // Simple center-based scaling without rotation
                const baseCx = base.x + base.width / 2
                const baseCy = base.y + base.height / 2
                const newCenterX = obb.x + (baseCx - obb.x) * sx
                const newCenterY = obb.y + (baseCy - obb.y) * sy
                const newW = Math.max(base.width * sx, MIN_SIZE)
                const newH = Math.max(base.height * sy, MIN_SIZE)
                const next = {
                    ...node,
                    x: newCenterX - newW / 2,
                    y: newCenterY - newH / 2,
                    width: newW,
                    height: newH,
                }
                if (selectedNodes.length === 1) {
                    updateTransformSession()
                    debouncedUpdate(selectedNodes[0].id, { x: next.x, y: next.y, width: next.width, height: next.height })
                }
                return next
            })
        }

        // rAF batching to reduce jitter
        if (!rafPendingRef.current) {
            rafPendingRef.current = true
            requestAnimationFrame(() => {
                apply()
                rafPendingRef.current = false
            })
        }
    }

    const handleCornerDragEnd = () => {
        if (selectedNodes.length === 1) commitTransform(selectedNodes[0].id, selectedNodes[0])
        endTransformSession()
        activeCornerRef.current = null
        originalBBoxRef.current = null
        originalNodesRef.current = {}
    }

    // Rotation disabled

    if (!bbox) return null

    const handleSize = 8
    const rHandleOffset = 24

    return (
        <Group draggable onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} x={bbox.x} y={bbox.y}>
            {/* Smart guides within bbox space */}
            {guide?.vx != null && (
                <Rect x={(guide.vx - bbox.x) | 0} y={-24} width={1} height={bbox.height + 48} fill="#A855F7" opacity={0.9} />
            )}
            {guide?.hy != null && (
                <Rect x={-24} y={(guide.hy - bbox.y) | 0} width={bbox.width + 48} height={1} fill="#A855F7" opacity={0.9} />
            )}
            <Rect
                data-testid="selection-bbox"
                x={0}
                y={0}
                width={bbox.width}
                height={bbox.height}
                stroke="#3B82F6"
                dash={[6, 4]}
                strokeWidth={1}
            />
            {/* Corner handles */}
            <Rect x={-handleSize / 2} y={-handleSize / 2} width={handleSize} height={handleSize} fill="#3B82F6" draggable onDragStart={handleCornerDragStart('tl')} onDragMove={handleCornerDragMove('tl')} onDragEnd={handleCornerDragEnd} />
            <Rect x={bbox.width - handleSize / 2} y={-handleSize / 2} width={handleSize} height={handleSize} fill="#3B82F6" draggable onDragStart={handleCornerDragStart('tr')} onDragMove={handleCornerDragMove('tr')} onDragEnd={handleCornerDragEnd} />
            <Rect x={-handleSize / 2} y={bbox.height - handleSize / 2} width={handleSize} height={handleSize} fill="#3B82F6" draggable onDragStart={handleCornerDragStart('bl')} onDragMove={handleCornerDragMove('bl')} onDragEnd={handleCornerDragEnd} />
            <Rect x={bbox.width - handleSize / 2} y={bbox.height - handleSize / 2} width={handleSize} height={handleSize} fill="#3B82F6" draggable onDragStart={handleCornerDragStart('br')} onDragMove={handleCornerDragMove('br')} onDragEnd={handleCornerDragEnd} />
            {/* Rotate handle removed (rotation disabled) */}
        </Group>
    )
}


