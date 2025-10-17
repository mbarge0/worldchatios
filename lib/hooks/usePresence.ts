"use client"

import { rtdb } from '@/lib/firebase'
import { deriveDisplayName } from '@/lib/hooks/displayName'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import { onDisconnect, onValue, ref, set, update } from 'firebase/database'
import { useEffect, useMemo, useRef, useState } from 'react'

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

export type Participant = {
    userId: string
    displayName: string
    color: string
    online: boolean
    ts: number
}

export function usePresence(canvasId: string | undefined) {
    const { user } = useFirebaseAuth()
    const uid = user?.uid || 'dev'
    const displayName = deriveDisplayName(user?.email || 'dev@local.test')
    const color = randomColorForUser(uid)
    // Unique per-tab/session key so same user in two windows appears twice
    const sessionIdRef = useRef<string>(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)
    const sessionKey = `${uid}:${sessionIdRef.current}`

    const lastSentRef = useRef(0)
    const cursorsRef = useRef<Record<string, RemoteCursor>>({})
    const participantsRef = useRef<Record<string, Participant>>({})
    const [version, setVersion] = useState(0)

    // Treat transient permission-denied errors (e.g., during logout) as benign
    const isTransientPermissionError = (e: any) => {
        const msg = (e && (e.message || e.code || String(e))) as string
        return typeof msg === 'string' && /permission[-_ ]denied/i.test(msg)
    }

    useEffect(() => {
        if (!canvasId || typeof canvasId !== 'string' || canvasId.length === 0) return
        const presenceRef = ref(rtdb, `presence/${canvasId}/${sessionKey}`)
        // initial presence
        // eslint-disable-next-line no-console
        console.log('[usePresence] Initialized presence for canvasId:', canvasId)
        set(presenceRef, {
            online: true,
            displayName,
            color,
            ts: Date.now(),
            userId: uid,
            sessionId: sessionIdRef.current,
        }).catch((e) => {
            if (!isTransientPermissionError(e)) console.error(e)
        })
        // ensure cleanup
        onDisconnect(presenceRef)
            .remove()
            .catch((e) => {
                if (!isTransientPermissionError(e)) console.error(e)
            })

        // heartbeat to keep presence fresh
        const heartbeat = setInterval(() => {
            update(presenceRef, { ts: Date.now(), online: true }).catch((e) => {
                if (!isTransientPermissionError(e)) {
                    // swallow transient permission errors, log others
                    console.error(e)
                }
            })
        }, 15000)
        return () => {
            // rely on onDisconnect.remove(); avoid transient offline flicker
            clearInterval(heartbeat)
        }
    }, [canvasId, uid, displayName, color, sessionKey])

    useEffect(() => {
        if (!canvasId || typeof canvasId !== 'string' || canvasId.length === 0) return
        const allRef = ref(rtdb, `presence/${canvasId}`)
        let unsub = onValue(allRef, (snap) => {
            const val = snap.val() || {}
            const nextCursors: Record<string, RemoteCursor> = {}
            const nextParticipants: Record<string, Participant> = {}
            Object.entries<any>(val).forEach(([id, data]) => {
                const cursor = data.cursor || { x: 0, y: 0, ts: 0 }
                if (id !== sessionKey) {
                    nextCursors[id] = {
                        userId: id, // session key ensures uniqueness per tab
                        displayName: data.displayName,
                        color: data.color,
                        x: cursor.x,
                        y: cursor.y,
                        ts: cursor.ts || 0,
                    }
                }
                nextParticipants[id] = {
                    userId: id,
                    displayName: data.displayName,
                    color: data.color,
                    online: data.online !== false,
                    ts: data.ts || 0,
                }
            })
            cursorsRef.current = nextCursors
            participantsRef.current = nextParticipants
            setVersion((v) => v + 1)
        })

        const handleVisibility = () => {
            if (document.hidden) {
                // Pause listener by unsubscribing when hidden
                unsub()
            } else {
                // Resume listener when visible
                unsub = onValue(allRef, (snap) => {
                    const val = snap.val() || {}
                    const nextCursors: Record<string, RemoteCursor> = {}
                    const nextParticipants: Record<string, Participant> = {}
                    Object.entries<any>(val).forEach(([id, data]) => {
                        const cursor = data.cursor || { x: 0, y: 0, ts: 0 }
                        if (id !== sessionKey) {
                            nextCursors[id] = {
                                userId: id,
                                displayName: data.displayName,
                                color: data.color,
                                x: cursor.x,
                                y: cursor.y,
                                ts: cursor.ts || 0,
                            }
                        }
                        nextParticipants[id] = {
                            userId: id,
                            displayName: data.displayName,
                            color: data.color,
                            online: data.online !== false,
                            ts: data.ts || 0,
                        }
                    })
                    cursorsRef.current = nextCursors
                    participantsRef.current = nextParticipants
                    setVersion((v) => v + 1)
                })
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)
        return () => {
            unsub()
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [canvasId, sessionKey])

    const sendCursor = (x: number, y: number) => {
        const now = Date.now()
        if (document.hidden) return
        if (now - lastSentRef.current < 50) return // ~20 Hz
        lastSentRef.current = now
        if (!canvasId || typeof canvasId !== 'string' || canvasId.length === 0) return
        const cursorRef = ref(rtdb, `presence/${canvasId}/${sessionKey}`)
        update(cursorRef, { cursor: { x, y, ts: now } }).catch((e) => {
            if (!isTransientPermissionError(e)) console.error(e)
        })
    }

    return useMemo(() => ({ cursorsRef, participantsRef, sendCursor, color, version }), [cursorsRef, participantsRef, sendCursor, color, version])
}
