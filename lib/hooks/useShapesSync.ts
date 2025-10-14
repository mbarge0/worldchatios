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

    const applyShapesToStore = (shapes: ShapeDoc[]) => {
        const nodes = shapes.map((s) => ({ id: s.id, x: s.x, y: s.y, width: s.width, height: s.height, rotation: s.rotation }))
        setNodes(nodes)
    }

    useEffect(() => {
        if (!canvasId) return
        // initial load
        listShapes(canvasId).then(applyShapesToStore).catch(console.error)
        // realtime subscription
        const unsub = onShapesSnapshot(canvasId, (shapes) => {
            // echo prevention placeholder: could compare updatedAt with locally tagged times
            applyShapesToStore(shapes)
        })
        return () => unsub()
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
