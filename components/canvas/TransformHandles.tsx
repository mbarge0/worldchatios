'use client'

import { useCanvasStore } from '@/lib/store/canvas-store'
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

    const dragStartRef = useRef<{ x: number; y: number } | null>(null)
    const handleDragStart = (e: any) => {
        dragStartRef.current = { x: e.target.x(), y: e.target.y() }
    }
    const handleDragMove = (e: any) => {
        if (!dragStartRef.current || !bbox) return
        const dx = e.target.x() - dragStartRef.current.x
        const dy = e.target.y() - dragStartRef.current.y
        updateSelectedNodes((node) => ({ ...node, x: node.x + dx, y: node.y + dy }))
        dragStartRef.current = { x: e.target.x(), y: e.target.y() }
    }
    const handleDragEnd = () => {
        dragStartRef.current = null
    }

    const handleCornerDragMove = (corner: 'tl' | 'tr' | 'bl' | 'br') => (e: any) => {
        if (!bbox) return
        const newX = e.target.x()
        const newY = e.target.y()
        let newWidth = bbox.width
        let newHeight = bbox.height
        let originX = bbox.x
        let originY = bbox.y
        if (corner === 'tl') {
            newWidth = bbox.width + (bbox.x - newX)
            newHeight = bbox.height + (bbox.y - newY)
            originX = newX
            originY = newY
        } else if (corner === 'tr') {
            newWidth = newX - bbox.x
            newHeight = bbox.height + (bbox.y - newY)
            originY = newY
        } else if (corner === 'bl') {
            newWidth = bbox.width + (bbox.x - newX)
            newHeight = newY - bbox.y
            originX = newX
        } else if (corner === 'br') {
            newWidth = newX - bbox.x
            newHeight = newY - bbox.y
        }
        const sx = newWidth / bbox.width
        const sy = newHeight / bbox.height
        updateSelectedNodes((node) => ({
            ...node,
            x: originX + (node.x - bbox.x) * sx,
            y: originY + (node.y - bbox.y) * sy,
            width: node.width * sx,
            height: node.height * sy,
        }))
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
            <Rect x={-handleSize / 2} y={-handleSize / 2} width={handleSize} height={handleSize} fill="#3B82F6" draggable onDragMove={handleCornerDragMove('tl')} />
            <Rect x={bbox.width - handleSize / 2} y={-handleSize / 2} width={handleSize} height={handleSize} fill="#3B82F6" draggable onDragMove={handleCornerDragMove('tr')} />
            <Rect x={-handleSize / 2} y={bbox.height - handleSize / 2} width={handleSize} height={handleSize} fill="#3B82F6" draggable onDragMove={handleCornerDragMove('bl')} />
            <Rect x={bbox.width - handleSize / 2} y={bbox.height - handleSize / 2} width={handleSize} height={handleSize} fill="#3B82F6" draggable onDragMove={handleCornerDragMove('br')} />
            {/* Rotate handle */}
            <Circle x={bbox.width / 2} y={-rHandleOffset} radius={6} fill="#10B981" draggable onDragMove={handleRotateDragMove} />
        </Group>
    )
}


