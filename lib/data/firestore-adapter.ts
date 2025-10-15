import { db } from '@/lib/firebase'
import type { CanvasDoc, ShapeDoc } from '@/types/database'
import { addDoc, collection, deleteDoc, deleteField, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, Timestamp, updateDoc } from 'firebase/firestore'

// Utilities
export function toMillis(ts: Timestamp | number | undefined): number {
    if (!ts) return Date.now()
    return ts instanceof Timestamp ? ts.toMillis() : ts
}

export function nowMillis(): number {
    return Date.now()
}

// Paths
function canvasesCol() {
    return collection(db, 'canvases')
}
function canvasDoc(canvasId: string) {
    return doc(db, 'canvases', canvasId)
}
function shapesCol(canvasId: string) {
    return collection(db, 'canvases', canvasId, 'shapes')
}
function shapeDoc(canvasId: string, shapeId: string) {
    return doc(db, 'canvases', canvasId, 'shapes', shapeId)
}

// Canvas CRUD
export async function createCanvas(partial: Partial<CanvasDoc>): Promise<string> {
    const payload = {
        title: partial.title ?? 'Untitled',
        createdAt: nowMillis(),
        updatedAt: nowMillis(),
    }
    const ref = await addDoc(canvasesCol(), payload)
    return ref.id
}

export async function getCanvas(canvasId: string): Promise<CanvasDoc | null> {
    const snap = await getDoc(canvasDoc(canvasId))
    if (!snap.exists()) return null
    return { id: snap.id, ...(snap.data() as Omit<CanvasDoc, 'id'>) }
}

export async function updateCanvas(canvasId: string, updates: Partial<CanvasDoc>): Promise<void> {
    await updateDoc(canvasDoc(canvasId), { ...updates, updatedAt: nowMillis() })
}

export async function deleteCanvas(canvasId: string): Promise<void> {
    await deleteDoc(canvasDoc(canvasId))
}

// Shapes CRUD
export async function createShape(canvasId: string, shape: ShapeDoc): Promise<void> {
    await setDoc(shapeDoc(canvasId, shape.id), { ...shape, updatedAt: nowMillis() })
}

export async function updateShape(canvasId: string, shapeId: string, updates: Partial<ShapeDoc>): Promise<void> {
    const ref = shapeDoc(canvasId, shapeId)
    try {
        await updateDoc(ref, { ...updates, updatedAt: nowMillis() })
    } catch (e: any) {
        const msg = (e && (e.message || e.code || String(e))) as string
        // If the document does not exist, create it instead
        if (typeof msg === 'string' && /not[-_ ]found|no document to update/i.test(msg)) {
            await setDoc(ref, { id: shapeId, ...(updates as any), updatedAt: nowMillis() } as ShapeDoc, { merge: true })
        } else {
            throw e
        }
    }
}

export async function deleteShape(canvasId: string, shapeId: string): Promise<void> {
    await deleteDoc(shapeDoc(canvasId, shapeId))
}

export async function listShapes(canvasId: string): Promise<ShapeDoc[]> {
    const q = query(shapesCol(canvasId), orderBy('zIndex'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ShapeDoc, 'id'>) }))
}

// Realtime listeners
export function onShapesSnapshot(
    canvasId: string,
    cb: (shapes: ShapeDoc[]) => void
) {
    const q = query(shapesCol(canvasId), orderBy('zIndex'))
    return onSnapshot(q, (snap) => {
        const shapes = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ShapeDoc, 'id'>) }))
        cb(shapes)
    })
}

// Lock helpers
export async function setShapeLock(canvasId: string, shapeId: string, userId: string): Promise<void> {
    await updateDoc(shapeDoc(canvasId, shapeId), { lockedBy: { userId, ts: nowMillis() }, updatedAt: nowMillis() })
}

export async function refreshShapeLock(canvasId: string, shapeId: string, userId: string): Promise<void> {
    await updateDoc(shapeDoc(canvasId, shapeId), { lockedBy: { userId, ts: nowMillis() }, updatedAt: nowMillis() })
}

export async function clearShapeLock(canvasId: string, shapeId: string): Promise<void> {
    await updateDoc(shapeDoc(canvasId, shapeId), { lockedBy: deleteField(), updatedAt: nowMillis() })
}
