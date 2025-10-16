'use client'

import { useCanvasStore } from '@/lib/store/canvas-store'
import { useRef, useState } from 'react'
import { Rect } from 'react-konva'

export default function SelectionLayer() {
    const { viewport, nodes, setMode, mode, setSelection, selectedIds } = useCanvasStore()
    const dragRef = useRef<{ x: number; y: number } | null>(null)
    const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

    const toWorld = (p: { x: number; y: number }) => ({
        x: (p.x - viewport.position.x) / viewport.scale,
        y: (p.y - viewport.position.y) / viewport.scale,
    })

    const handleMouseDown = (e: any) => {
        // Only start marquee when not panning and primary button
        if (mode === 'panning') return
        if (e.evt.button !== 0) return
        const stage = e.target.getStage()
        const pointer = stage?.getPointerPosition()
        if (!pointer) return
        const start = toWorld(pointer)
        // Clicking empty canvas clears selection unless Shift is held
        if (!e.target || e.target === stage) {
            if (!e.evt.shiftKey) setSelection([])
        }
        dragRef.current = start
        setMode('marquee')
        setMarquee({ x: start.x, y: start.y, w: 0, h: 0 })
    }

    const handleMouseMove = (e: any) => {
        if (mode !== 'marquee' || !dragRef.current) return
        const stage = e.target.getStage()
        const pointer = stage?.getPointerPosition()
        if (!pointer) return
        const pos = toWorld(pointer)
        const x = Math.min(dragRef.current.x, pos.x)
        const y = Math.min(dragRef.current.y, pos.y)
        const w = Math.abs(pos.x - dragRef.current.x)
        const h = Math.abs(pos.y - dragRef.current.y)
        setMarquee({ x, y, w, h })
    }

    const intersects = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    }

    const handleMouseUp = (e: any) => {
        if (mode !== 'marquee') return
        const isShift = !!e.evt.shiftKey
        const current = marquee
        setMode('idle')
        dragRef.current = null
        setMarquee(null)
        if (!current) return
        const selected = nodes
            .filter((n) => intersects(current, { x: n.x, y: n.y, w: n.width, h: n.height }))
            .map((n) => n.id)
        const union = isShift ? Array.from(new Set([...(selectedIds || []), ...selected])) : selected
        setSelection(union)
    }

    return (
        <>
            {/* Full-screen transparent rect to capture marquee interactions */}
            <Rect
                x={-100000}
                y={-100000}
                width={200000}
                height={200000}
                fillEnabled={false}
                listening={true}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
            {marquee && (
                <Rect
                    data-testid="marquee"
                    x={marquee.x}
                    y={marquee.y}
                    width={marquee.w}
                    height={marquee.h}
                    stroke="#3B82F6"
                    dash={[6, 4]}
                    strokeWidth={1}
                    fill="rgba(59,130,246,0.08)"
                />
            )}
        </>
    )
}


