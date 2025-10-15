"use client"

import { clearShapeLock, refreshShapeLock, setShapeLock, updateShape } from '@/lib/data/firestore-adapter'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import * as Sentry from '@sentry/nextjs'
import { useCallback, useEffect, useMemo, useRef } from 'react'

export function useShapeWriter(canvasId: string | undefined, ttlMs = 5000, debounceMs = 75) {
    const { user } = useFirebaseAuth()
    const uid = user?.uid || 'dev'

    const lockTimersRef = useRef<Map<string, any>>(new Map())
    const debounceTimersRef = useRef<Map<string, any>>(new Map())

    // --- Simple offline op queue (A2) ---
    const opQueueRef = useRef<Array<{ shapeId: string; updates: any }>>([])

    const flushQueue = useCallback(() => {
        if (!canvasId) return
        const queue = opQueueRef.current
        opQueueRef.current = []
        for (const item of queue) {
            updateShape(canvasId, item.shapeId, item.updates).catch(() => { })
        }
    }, [canvasId])

    useEffect(() => {
        const onOnline = () => flushQueue()
        window.addEventListener('online', onOnline)
        return () => window.removeEventListener('online', onOnline)
    }, [flushQueue])

    // --- Recovery on mount: rollback mid-edit sessions (A2) ---
    useEffect(() => {
        if (!canvasId) return
        try {
            const prefix = `cc_tf_${canvasId}_`
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (!key || !key.startsWith(prefix)) continue
                const raw = localStorage.getItem(key)
                if (!raw) continue
                const parsed = JSON.parse(raw || '{}') as { original?: any }
                const shapeId = key.substring(prefix.length)
                if (parsed && parsed.original) {
                    updateShape(canvasId, shapeId, parsed.original).catch(() => { })
                    clearShapeLock(canvasId, shapeId).catch(() => { })
                }
                localStorage.removeItem(key)
            }
        } catch { }
    }, [canvasId])

    const beginTransform = useCallback(async (shapeId: string, original?: any) => {
        if (!canvasId) return
        try {
            await setShapeLock(canvasId, shapeId, uid)
            Sentry.addBreadcrumb({ category: 'shape-lock', level: 'info', message: 'lock:start', data: { canvasId, shapeId, uid } })
        } catch (e) {
            console.error('setShapeLock failed', e)
            Sentry.addBreadcrumb({ category: 'shape-lock', level: 'warning', message: 'lock:start:failed', data: { canvasId, shapeId, uid } })
        }
        // Persist original state for rollback on unexpected refresh
        try {
            if (original) {
                const key = `cc_tf_${canvasId}_${shapeId}`
                localStorage.setItem(key, JSON.stringify({ original, ts: Date.now(), uid }))
            }
        } catch { }
        // auto-refresh lock while active
        const t = setInterval(() => {
            if (!canvasId) return
            refreshShapeLock(canvasId, shapeId, uid).then(() => {
                Sentry.addBreadcrumb({ category: 'shape-lock', level: 'info', message: 'lock:refresh', data: { canvasId, shapeId, uid } })
            }).catch(() => {
                Sentry.addBreadcrumb({ category: 'shape-lock', level: 'warning', message: 'lock:refresh:failed', data: { canvasId, shapeId, uid } })
            })
        }, Math.max(1000, Math.floor(ttlMs * 0.6)))
        lockTimersRef.current.set(shapeId, t)
    }, [canvasId, ttlMs, uid])

    const commitTransform = useCallback(async (shapeId: string, updates: any) => {
        if (!canvasId) return
        try {
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                opQueueRef.current.push({ shapeId, updates })
            } else {
                await updateShape(canvasId, shapeId, updates)
            }
            Sentry.addBreadcrumb({ category: 'shape-update', level: 'info', message: 'update:commit', data: { canvasId, shapeId, uid } })
        } catch (e) {
            console.error('final updateShape failed', e)
            Sentry.addBreadcrumb({ category: 'shape-update', level: 'warning', message: 'update:commit:failed', data: { canvasId, shapeId, uid } })
        }
        // clear lock timer and lock
        const t = lockTimersRef.current.get(shapeId)
        if (t) clearInterval(t)
        lockTimersRef.current.delete(shapeId)
        clearShapeLock(canvasId, shapeId).then(() => {
            Sentry.addBreadcrumb({ category: 'shape-lock', level: 'info', message: 'lock:clear', data: { canvasId, shapeId, uid } })
        }).catch(() => {
            Sentry.addBreadcrumb({ category: 'shape-lock', level: 'warning', message: 'lock:clear:failed', data: { canvasId, shapeId, uid } })
        })
        // Clear rollback record on successful end
        try { localStorage.removeItem(`cc_tf_${canvasId}_${shapeId}`) } catch { }
    }, [canvasId])

    const debouncedUpdate = useCallback((shapeId: string, updates: any) => {
        if (!canvasId) return
        const existing = debounceTimersRef.current.get(shapeId)
        if (existing) clearTimeout(existing)
        const t = setTimeout(() => {
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                opQueueRef.current.push({ shapeId, updates })
            } else {
                updateShape(canvasId, shapeId, updates).catch(() => { })
            }
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
