"use client"

import { clearShapeLock, refreshShapeLock, setShapeLock, updateShape } from '@/lib/data/firestore-adapter'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import { useCallback, useEffect, useMemo, useRef } from 'react'

export function useShapeWriter(canvasId: string | undefined, ttlMs = 5000, debounceMs = 75) {
    const { user } = useFirebaseAuth()
    const uid = user?.uid || 'dev'

    const lockTimersRef = useRef<Map<string, any>>(new Map())
    const debounceTimersRef = useRef<Map<string, any>>(new Map())

    const beginTransform = useCallback(async (shapeId: string) => {
        if (!canvasId) return
        try {
            await setShapeLock(canvasId, shapeId, uid)
        } catch (e) {
            console.error('setShapeLock failed', e)
        }
        // auto-refresh lock while active
        const t = setInterval(() => {
            if (!canvasId) return
            refreshShapeLock(canvasId, shapeId, uid).catch(() => { })
        }, Math.max(1000, Math.floor(ttlMs * 0.6)))
        lockTimersRef.current.set(shapeId, t)
    }, [canvasId, ttlMs, uid])

    const commitTransform = useCallback(async (shapeId: string, updates: any) => {
        if (!canvasId) return
        try {
            await updateShape(canvasId, shapeId, updates)
        } catch (e) {
            console.error('final updateShape failed', e)
        }
        // clear lock timer and lock
        const t = lockTimersRef.current.get(shapeId)
        if (t) clearInterval(t)
        lockTimersRef.current.delete(shapeId)
        clearShapeLock(canvasId, shapeId).catch(() => { })
    }, [canvasId])

    const debouncedUpdate = useCallback((shapeId: string, updates: any) => {
        if (!canvasId) return
        const existing = debounceTimersRef.current.get(shapeId)
        if (existing) clearTimeout(existing)
        const t = setTimeout(() => {
            updateShape(canvasId, shapeId, updates).catch(() => { })
            debounceTimersRef.current.delete(shapeId)
        }, debounceMs)
        debounceTimersRef.current.set(shapeId, t)
    }, [canvasId, debounceMs])

    useEffect(() => () => {
        // cleanup on unmount
        for (const t of lockTimersRef.current.values()) clearInterval(t)
        lockTimersRef.current.clear()
        for (const t of debounceTimersRef.current.values()) clearTimeout(t)
        debounceTimersRef.current.clear()
    }, [])

    return useMemo(() => ({ beginTransform, debouncedUpdate, commitTransform }), [beginTransform, debouncedUpdate, commitTransform])
}
