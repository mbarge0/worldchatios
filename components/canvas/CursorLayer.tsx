'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Label, Layer, Line, Tag, Text } from 'react-konva'

export type RemoteCursor = {
    userId: string
    displayName: string
    color: string
    x: number
    y: number
}

type CursorLayerProps = {
    cursors: RemoteCursor[]
}

export default function CursorLayer({ cursors }: CursorLayerProps) {
    // Map of animated positions keyed by userId
    const currentPosRef = useRef<Map<string, { x: number; y: number }>>(new Map())
    const targetPosRef = useRef<Map<string, { x: number; y: number }>>(new Map())
    const [tick, setTick] = useState(0)

    // Update target positions when props change; ensure current positions are initialized
    useEffect(() => {
        for (const c of cursors) {
            const t = targetPosRef.current.get(c.userId)
            if (!t) targetPosRef.current.set(c.userId, { x: c.x, y: c.y })
            else {
                t.x = c.x
                t.y = c.y
            }
            if (!currentPosRef.current.has(c.userId)) {
                currentPosRef.current.set(c.userId, { x: c.x, y: c.y })
            }
        }
        // Remove any users no longer present
        for (const key of Array.from(currentPosRef.current.keys())) {
            if (!cursors.find((c) => c.userId === key)) {
                currentPosRef.current.delete(key)
                targetPosRef.current.delete(key)
            }
        }
    }, [cursors])

    // Animation loop: linear interpolation towards target positions
    useEffect(() => {
        let rafId = 0
        const smoothing = 0.2 // fraction per frame at 60 FPS; adjust if needed
        const step = () => {
            let changed = false
            currentPosRef.current.forEach((pos, key) => {
                const target = targetPosRef.current.get(key)
                if (!target) return
                const dx = target.x - pos.x
                const dy = target.y - pos.y
                // If close enough, snap; else lerp
                if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
                    if (pos.x !== target.x || pos.y !== target.y) {
                        pos.x = target.x
                        pos.y = target.y
                        changed = true
                    }
                } else {
                    pos.x += dx * smoothing
                    pos.y += dy * smoothing
                    changed = true
                }
            })
            if (changed) setTick((t) => t + 1)
            rafId = requestAnimationFrame(step)
        }
        rafId = requestAnimationFrame(step)
        return () => cancelAnimationFrame(rafId)
    }, [])

    const animatedCursors = useMemo(() => {
        return cursors.map((c) => {
            const p = currentPosRef.current.get(c.userId) || { x: c.x, y: c.y }
            return { ...c, x: p.x, y: p.y }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cursors, tick])

    return (
        <Layer listening={false} data-testid="presence-layer">
            {animatedCursors.map((c) => (
                <Label key={`cursor-${c.userId}`} x={c.x} y={c.y} opacity={0.9}>
                    <Line points={[0, 0, 12, 12]} stroke={c.color} strokeWidth={2} />
                    <Tag
                        x={14}
                        y={4}
                        fill={c.color}
                        cornerRadius={6}
                        shadowColor="#00000040"
                        shadowBlur={2}
                        shadowOffset={{ x: 0, y: 1 }}
                        shadowOpacity={0.2}
                    />
                    <Text x={20} y={6} text={c.displayName} fontSize={12} fill="#ffffff" />
                </Label>
            ))}
        </Layer>
    )
}


