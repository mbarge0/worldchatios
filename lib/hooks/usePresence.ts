"use client"

import { rtdb } from '@/lib/firebase'
import { deriveDisplayName } from '@/lib/hooks/displayName'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import { onDisconnect, onValue, ref, set, update } from 'firebase/database'
import { useEffect, useMemo, useRef } from 'react'

function randomColorForUser(userId: string | undefined) {
    if (!userId) return '#8884d8'
    let hash = 0
    for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) | 0
    const r = (hash & 0xff0000) >> 16
    const g = (hash & 0x00ff00) >> 8
    const b = hash & 0x0000ff
    return `rgb(${(r % 128) + 64}, ${(g % 128) + 64}, ${(b % 128) + 64})`
}

export type RemoteCursor = {
    userId: string
    displayName: string
    color: string
    x: number
    y: number
    ts: number
}

export function usePresence(canvasId: string | undefined) {
    const { user } = useFirebaseAuth()
    const uid = user?.uid || 'dev'
    const displayName = deriveDisplayName(user?.email || 'dev@local.test')
    const color = randomColorForUser(uid)

    const lastSentRef = useRef(0)
    const cursorsRef = useRef<Record<string, RemoteCursor>>({})

    useEffect(() => {
        if (!canvasId) return
        const presenceRef = ref(rtdb, `presence/${canvasId}/${uid}`)
        // initial presence
        set(presenceRef, {
            online: true,
            displayName,
            color,
            ts: Date.now(),
        }).catch(console.error)
        // ensure cleanup
        onDisconnect(presenceRef)
            .remove()
            .catch(console.error)
        return () => {
            // best-effort offline (onDisconnect will handle abrupt closes)
            set(presenceRef, { online: false, displayName, color, ts: Date.now() }).catch(() => { })
        }
    }, [canvasId, uid, displayName, color])

    useEffect(() => {
        if (!canvasId) return
        const allRef = ref(rtdb, `presence/${canvasId}`)
        let unsub = onValue(allRef, (snap) => {
            const val = snap.val() || {}
            const next: Record<string, RemoteCursor> = {}
            Object.entries<any>(val).forEach(([id, data]) => {
                if (id === uid) return
                const cursor = data.cursor || { x: 0, y: 0, ts: 0 }
                next[id] = {
                    userId: id,
                    displayName: data.displayName,
                    color: data.color,
                    x: cursor.x,
                    y: cursor.y,
                    ts: cursor.ts || 0,
                }
            })
            cursorsRef.current = next
        })

        const handleVisibility = () => {
            if (document.hidden) {
                // Pause listener by unsubscribing when hidden
                unsub()
            } else {
                // Resume listener when visible
                unsub = onValue(allRef, (snap) => {
                    const val = snap.val() || {}
                    const next: Record<string, RemoteCursor> = {}
                    Object.entries<any>(val).forEach(([id, data]) => {
                        if (id === uid) return
                        const cursor = data.cursor || { x: 0, y: 0, ts: 0 }
                        next[id] = {
                            userId: id,
                            displayName: data.displayName,
                            color: data.color,
                            x: cursor.x,
                            y: cursor.y,
                            ts: cursor.ts || 0,
                        }
                    })
                    cursorsRef.current = next
                })
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)
        return () => unsub()
    }, [canvasId, uid])

    const sendCursor = (x: number, y: number) => {
        const now = Date.now()
        if (document.hidden) return
        if (now - lastSentRef.current < 50) return // ~20 Hz
        lastSentRef.current = now
        if (!canvasId) return
        const cursorRef = ref(rtdb, `presence/${canvasId}/${uid}`)
        update(cursorRef, { cursor: { x, y, ts: now } }).catch(console.error)
    }

    return useMemo(() => ({ cursorsRef, sendCursor, color }), [cursorsRef, sendCursor, color])
}
