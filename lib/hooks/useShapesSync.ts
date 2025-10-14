"use client"

import { listShapes, onShapesSnapshot } from '@/lib/data/firestore-adapter'
import { useCanvasStore } from '@/lib/store/canvas-store'
import type { ShapeDoc } from '@/types/database'
import { useEffect, useMemo, useRef } from 'react'

export type EchoFilter = {
    // Track IDs recently written locally to avoid echo applying
    recentlyUpdated: Set<string>
    windowMs: number
}

export function useShapesSync(canvasId: string | undefined) {
    const { setNodes } = useCanvasStore()
    const echoRef = useRef<EchoFilter>({ recentlyUpdated: new Set<string>(), windowMs: 150 })
    const timeoutsRef = useRef<Map<string, any>>(new Map())
    const pendingRef = useRef<ShapeDoc[] | null>(null)
    const rafIdRef = useRef<number | null>(null)

    const applyShapesToStore = (shapes: ShapeDoc[]) => {
        const nodes = shapes.map((s) => {
            const base = {
                id: s.id,
                type: s.type,
                x: s.x,
                y: s.y,
                width: s.width,
                height: s.height,
                rotation: s.rotation,
                zIndex: s.zIndex,
                fill: s.fill,
                stroke: s.stroke,
                opacity: s.opacity,
            } as any
            if (s.type === 'text') {
                return {
                    ...base,
                    text: s.text,
                    fontSize: s.fontSize,
                    fontFamily: s.fontFamily,
                    fontWeight: s.fontWeight,
                    textAlign: s.textAlign,
                    lineHeight: s.lineHeight,
                }
            }
            return base
        })
        setNodes(nodes as any)
    }

    useEffect(() => {
        if (!canvasId) return
        // initial load
        listShapes(canvasId).then(applyShapesToStore).catch(console.error)
        // realtime subscription
        let unsub = onShapesSnapshot(canvasId, (shapes) => {
            // Batch store updates to next animation frame
            pendingRef.current = shapes
            if (rafIdRef.current == null) {
                rafIdRef.current = requestAnimationFrame(() => {
                    if (pendingRef.current) applyShapesToStore(pendingRef.current)
                    pendingRef.current = null
                    rafIdRef.current = null
                })
            }
        })

        const onVis = () => {
            if (document.hidden) {
                unsub()
            } else {
                unsub = onShapesSnapshot(canvasId, (shapes) => {
                    pendingRef.current = shapes
                    if (rafIdRef.current == null) {
                        rafIdRef.current = requestAnimationFrame(() => {
                            if (pendingRef.current) applyShapesToStore(pendingRef.current)
                            pendingRef.current = null
                            rafIdRef.current = null
                        })
                    }
                })
            }
        }
        document.addEventListener('visibilitychange', onVis)
        return () => {
            document.removeEventListener('visibilitychange', onVis)
            unsub()
            const rafId = rafIdRef.current
            if (rafId != null) cancelAnimationFrame(rafId)
        }
    }, [canvasId])

    const tagLocalUpdate = (shapeId: string) => {
        const echo = echoRef.current
        echo.recentlyUpdated.add(shapeId)
        const existing = timeoutsRef.current.get(shapeId)
        if (existing) clearTimeout(existing)
        const t = setTimeout(() => {
            echo.recentlyUpdated.delete(shapeId)
            timeoutsRef.current.delete(shapeId)
        }, echo.windowMs)
        timeoutsRef.current.set(shapeId, t)
    }

    return useMemo(() => ({ tagLocalUpdate }), [])
}
