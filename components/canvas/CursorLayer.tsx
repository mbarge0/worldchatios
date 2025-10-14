'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Circle, Group, Layer, Text } from 'react-konva'

export type RemoteCursor = {
    userId: string
    displayName?: string
    color?: string
    x: number
    y: number
    ts?: number
}

type CursorLayerProps = {
    cursors: RemoteCursor[]
}

export default function CursorLayer({ cursors }: CursorLayerProps) {
    // Track animated positions per user
    const currentPosRef = useRef<Map<string, { x: number; y: number }>>(new Map())
    const targetPosRef = useRef<Map<string, { x: number; y: number }>>(new Map())
    const [tick, setTick] = useState(0)

    // Initialize & update target positions
    useEffect(() => {
        for (const c of cursors) {
            if (!targetPosRef.current.has(c.userId)) {
                targetPosRef.current.set(c.userId, { x: c.x, y: c.y })
            } else {
                const t = targetPosRef.current.get(c.userId)!
                t.x = c.x
                t.y = c.y
            }
            if (!currentPosRef.current.has(c.userId)) {
                currentPosRef.current.set(c.userId, { x: c.x, y: c.y })
            }
        }

        // Remove stale users
        for (const key of Array.from(currentPosRef.current.keys())) {
            if (!cursors.find((c) => c.userId === key)) {
                currentPosRef.current.delete(key)
                targetPosRef.current.delete(key)
            }
        }
    }, [cursors])

    // Animation smoothing loop
    useEffect(() => {
        let rafId = 0
        const smoothing = 0.25
        const step = () => {
            let changed = false
            currentPosRef.current.forEach((pos, key) => {
                const target = targetPosRef.current.get(key)
                if (!target) return
                const dx = target.x - pos.x
                const dy = target.y - pos.y
                if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
                    pos.x = target.x
                    pos.y = target.y
                } else {
                    pos.x += dx * smoothing
                    pos.y += dy * smoothing
                }
                changed = true
            })
            if (changed) setTick((t) => t + 1)
            rafId = requestAnimationFrame(step)
        }
        rafId = requestAnimationFrame(step)
        return () => cancelAnimationFrame(rafId)
    }, [])

    // Animated cursor positions
    const animatedCursors = useMemo(() => {
        return cursors.map((c) => {
            const p = currentPosRef.current.get(c.userId) || { x: c.x, y: c.y }
            return { ...c, x: p.x, y: p.y }
        })
    }, [cursors, tick])

    if (!animatedCursors.length) return null

    return (
        <Layer listening={false} data-testid="presence-layer">
            {animatedCursors.map((c) => {
                const color = c.color || '#22c55e' // fallback: green-500
                const name = c.displayName || 'User'
                const ageMs = c.ts ? Date.now() - c.ts : 0
                const opacity = Math.max(0, Math.min(1, 1 - ageMs / 10000)) // fade over 10s
                if (opacity <= 0) return null

                return (
                    <Group key={c.userId} x={c.x} y={c.y} opacity={opacity}>
                        {/* Cursor Dot */}
                        <Circle radius={5} fill={color} stroke="white" strokeWidth={1.5} />
                        {/* Name Label */}
                        <Text
                            text={name}
                            fontSize={12}
                            fontFamily="Inter, system-ui, sans-serif"
                            fill={color}
                            x={8}
                            y={-6}
                        />
                    </Group>
                )
            })}
        </Layer>
    )
}