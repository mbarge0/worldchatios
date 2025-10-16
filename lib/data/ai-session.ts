import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type AISessionDoc = {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    lastToolCalls?: Array<{ name: string; arguments: Record<string, any> }>
    updatedAt: number
}

function aiSessionDoc(canvasId: string, userId: string) {
    return doc(db, 'canvases', canvasId, 'aiSessions', userId)
}

export async function loadAISession(canvasId: string, userId: string): Promise<AISessionDoc | null> {
    const ref = aiSessionDoc(canvasId, userId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as AISessionDoc
}

export async function saveAISession(canvasId: string, userId: string, payload: Partial<AISessionDoc>): Promise<void> {
    const ref = aiSessionDoc(canvasId, userId)
    const data: AISessionDoc = {
        messages: payload.messages || [],
        lastToolCalls: payload.lastToolCalls || [],
        updatedAt: Date.now(),
    }
    await setDoc(ref, data, { merge: true })
}


