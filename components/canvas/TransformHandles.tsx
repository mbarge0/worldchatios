'use client'

import { useShapeWriter } from '@/lib/hooks/useShapeWriter'
import { useCanvasStore } from '@/lib/store/canvas-store'
import { useParams } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { Circle, Group, Rect } from 'react-konva'

export default function TransformHandles() {
    const { nodes, selectedIds, updateSelectedNodes } = useCanvasStore()

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
    const originalNodesRef = useRef<Record<string, { x: number; y: number; width: number; height: number; rotation: number }>>({})
    const activeCornerRef = useRef<'tl' | 'tr' | 'bl' | 'br' | null>(null)
    const rafPendingRef = useRef(false)
    const handleDragStart = (e: any) => {
        if (selectedNodes.length === 1) beginTransform(selectedNodes[0].id)
        dragStartRef.current = { x: e.target.x(), y: e.target.y() }
    }
    const handleDragMove = (e: any) => {
        if (!dragStartRef.current || !bbox) return
        const dx = e.target.x() - dragStartRef.current.x
        const dy = e.target.y() - dragStartRef.current.y
        updateSelectedNodes((node) => ({ ...node, x: node.x + dx, y: node.y + dy }))
        if (selectedNodes.length === 1) debouncedUpdate(selectedNodes[0].id, { x: selectedNodes[0].x + dx, y: selectedNodes[0].y + dy })
        dragStartRef.current = { x: e.target.x(), y: e.target.y() }
    }
    const handleDragEnd = () => {
        if (selectedNodes.length === 1) commitTransform(selectedNodes[0].id, selectedNodes[0])
        dragStartRef.current = null
    }

    const MIN_SIZE = 10

    const handleCornerDragStart = (corner: 'tl' | 'tr' | 'bl' | 'br') => (e: any) => {
        if (!bbox) return
        activeCornerRef.current = corner
        originalBBoxRef.current = { ...bbox }
        const snapshot: Record<string, { x: number; y: number; width: number; height: number; rotation: number }> = {}
        for (const n of selectedNodes) {
            snapshot[n.id] = { x: n.x, y: n.y, width: n.width, height: n.height, rotation: n.rotation }
        }
        originalNodesRef.current = snapshot
        if (selectedNodes.length === 1) beginTransform(selectedNodes[0].id)
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
        const cx = obb.x + obb.width / 2
        const cy = obb.y + obb.height / 2

        const apply = () => {
            updateSelectedNodes((node) => {
                const base = snapshot[node.id]
                if (!base) return node
                // Rotation-aware anchoring via center scaling
                const baseCx = base.x + base.width / 2
                const baseCy = base.y + base.height / 2
                const dx = baseCx - cx
                const dy = baseCy - cy
                const newCenterX = cx + dx * sx
                const newCenterY = cy + dy * sy
                const newW = Math.max(base.width * sx, MIN_SIZE)
                const newH = Math.max(base.height * sy, MIN_SIZE)
                const next = {
                    ...node,
                    x: newCenterX - newW / 2,
                    y: newCenterY - newH / 2,
                    width: newW,
                    height: newH,
                    rotation: base.rotation,
                }
                if (selectedNodes.length === 1) {
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
        activeCornerRef.current = null
        originalBBoxRef.current = null
        originalNodesRef.current = {}
    }

    const [rotation, setRotation] = useState(0)
    const handleRotateDragMove = (e: any) => {
        if (!bbox) return
        const cx = bbox.x + bbox.width / 2
        const cy = bbox.y + bbox.height / 2
        const px = e.target.x()
        const py = e.target.y()
        const angle = (Math.atan2(py - cy, px - cx) * 180) / Math.PI
        setRotation(angle)
        updateSelectedNodes((node) => ({ ...node, rotation: angle }))
        if (selectedNodes.length === 1) debouncedUpdate(selectedNodes[0].id, { rotation: angle })
    }

    if (!bbox) return null

    const handleSize = 8
    const rHandleOffset = 24

    return (
        <Group draggable onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} x={bbox.x} y={bbox.y}>
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
            {/* Rotate handle */}
            <Circle x={bbox.width / 2} y={-rHandleOffset} radius={6} fill="#10B981" draggable onDragMove={handleRotateDragMove} />
        </Group>
    )
}


