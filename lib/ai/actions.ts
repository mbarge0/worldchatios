import { createShape as fsCreateShape, updateShape as fsUpdateShape, listShapes } from '@/lib/data/firestore-adapter'
import type { CanvasNode } from '@/lib/store/canvas-store'
import { v4 as uuidv4 } from 'uuid'

// Basic types
export type AlignOp = 'left' | 'centerX' | 'right' | 'top' | 'middleY' | 'bottom' | 'distributeH' | 'distributeV'
export type ZIndexOp = 'front' | 'back' | 'forward' | 'backward'

export async function createShape(canvasId: string, shape: any): Promise<void> {
    if (!canvasId) throw new Error('[createShape] Missing canvasId')
    if (!shape || typeof shape !== 'object') {
        // eslint-disable-next-line no-console
        console.warn('[createShape] Missing or invalid shape object, creating default circle.')
        shape = { id: uuidv4(), type: 'circle', x: 100, y: 100, width: 100, height: 100, rotation: 0, zIndex: Date.now(), fill: '#cfa968', opacity: 1, updatedAt: Date.now() }
    }
    if (!shape.id) shape.id = uuidv4()
    await fsCreateShape(canvasId, shape)
}

export async function createText(canvasId: string, shape: any): Promise<void> {
    if (!canvasId) throw new Error('[createText] Missing canvasId')
    if (!shape || typeof shape !== 'object') {
        // eslint-disable-next-line no-console
        console.warn('[createText] Missing or invalid shape object, creating default text box.')
        shape = { id: uuidv4(), type: 'text', x: 150, y: 150, width: 200, height: 40, rotation: 0, zIndex: Date.now(), text: 'New Text', fontSize: 18, fontFamily: 'Inter, system-ui, sans-serif', fill: '#072d51', opacity: 1, updatedAt: Date.now() }
    }
    if (!shape.id) shape.id = uuidv4()
    await fsCreateShape(canvasId, shape)
}

export async function moveShape(canvasId: string, shapeId: string, x: number, y: number): Promise<void> {
    await fsUpdateShape(canvasId, shapeId, { x, y } as any)
}

export async function resizeShape(canvasId: string, shapeId: string, width: number, height: number): Promise<void> {
    await fsUpdateShape(canvasId, shapeId, { width, height } as any)
}

export async function rotateShape(canvasId: string, shapeId: string, rotation: number): Promise<void> {
    await fsUpdateShape(canvasId, shapeId, { rotation } as any)
}

// Alignment math — pure calculation returning updated nodes
export function alignNodes(nodes: CanvasNode[], selectedIds: string[], op: AlignOp): CanvasNode[] {
    if (selectedIds.length < 2) return nodes
    const selected = nodes.filter((n) => selectedIds.includes(n.id))
    const minX = Math.min(...selected.map((n) => n.x))
    const maxX = Math.max(...selected.map((n) => n.x + n.width))
    const minY = Math.min(...selected.map((n) => n.y))
    const maxY = Math.max(...selected.map((n) => n.y + n.height))
    const centerX = (minX + maxX) / 2
    const middleY = (minY + maxY) / 2

    let updated: CanvasNode[] = nodes.map((n) => {
        if (!selectedIds.includes(n.id)) return n
        if (op === 'left') return { ...n, x: minX }
        if (op === 'right') return { ...n, x: maxX - n.width }
        if (op === 'centerX') return { ...n, x: centerX - n.width / 2 }
        if (op === 'top') return { ...n, y: minY }
        if (op === 'bottom') return { ...n, y: maxY - n.height }
        if (op === 'middleY') return { ...n, y: middleY - n.height / 2 }
        return n
    })

    if (op === 'distributeH') {
        const sorted = [...selected].sort((a, b) => a.x - b.x)
        const totalWidth = sorted.reduce((acc, n) => acc + n.width, 0)
        const space = (maxX - minX - totalWidth) / (sorted.length - 1)
        let cursor = minX
        const positions: Record<string, number> = {}
        sorted.forEach((n) => { positions[n.id] = cursor; cursor += n.width + space })
        updated = updated.map((n) => selectedIds.includes(n.id) ? { ...n, x: positions[n.id] } : n)
    } else if (op === 'distributeV') {
        const sorted = [...selected].sort((a, b) => a.y - b.y)
        const totalHeight = sorted.reduce((acc, n) => acc + n.height, 0)
        const space = (maxY - minY - totalHeight) / (sorted.length - 1)
        let cursor = minY
        const positions: Record<string, number> = {}
        sorted.forEach((n) => { positions[n.id] = cursor; cursor += n.height + space })
        updated = updated.map((n) => selectedIds.includes(n.id) ? { ...n, y: positions[n.id] } : n)
    }
    return updated
}

export async function alignShapes(canvasId: string, nodes: CanvasNode[], selectedIds: string[], op: AlignOp): Promise<CanvasNode[]> {
    const updated = alignNodes(nodes, selectedIds, op)
    for (const n of updated) {
        if (selectedIds.includes(n.id)) await fsUpdateShape(canvasId, n.id, { x: (n as any).x, y: (n as any).y } as any)
    }
    return updated
}

export function zIndexNodes(nodes: CanvasNode[], selectedIds: string[], op: ZIndexOp): CanvasNode[] {
    const current = nodes.filter((n) => selectedIds.includes(n.id))
    const others = nodes.filter((n) => !selectedIds.includes(n.id))
    const sorted = [...others].sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
    const minZ = sorted.length ? (sorted[0] as any).zIndex || 0 : 0
    const maxZ = sorted.length ? (sorted[sorted.length - 1] as any).zIndex || 0 : 0
    const updates: Record<string, number> = {}
    if (op === 'front') {
        let z = maxZ + 1
        for (const n of current) updates[n.id] = z++
    } else if (op === 'back') {
        let z = minZ - current.length
        for (const n of current) updates[n.id] = z++
    } else {
        const step = op === 'forward' ? 1 : -1
        for (const n of current) updates[n.id] = ((n as any).zIndex || 0) + step
    }
    return nodes.map((n: any) => updates[n.id] != null ? { ...n, zIndex: updates[n.id] } : n)
}

export async function zIndexUpdate(canvasId: string, nodes: CanvasNode[], selectedIds: string[], op: ZIndexOp): Promise<CanvasNode[]> {
    const updated = zIndexNodes(nodes, selectedIds, op)
    for (const n of updated) {
        if (selectedIds.includes(n.id)) await fsUpdateShape(canvasId, n.id, { zIndex: (n as any).zIndex } as any)
    }
    return updated
}

export function exportCanvas(stage: any, scale: 1 | 2 | 4 = 2): string {
    return stage?.toDataURL({ pixelRatio: scale }) || ''
}

export function exportSelection(stage: any, rect: { x: number; y: number; width: number; height: number }, scale: 1 | 2 | 4 = 2): string {
    return stage?.toDataURL({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, pixelRatio: scale }) || ''
}

export function normalizeZIndex(nodes: CanvasNode[]): CanvasNode[] {
    const sorted = [...nodes].sort((a: any, b: any) => ((a.zIndex || 0) - (b.zIndex || 0)))
    const mapped: Record<string, number> = {}
    let z = 1
    for (const n of sorted as any[]) mapped[n.id] = z++
    return nodes.map((n: any) => ({ ...n, zIndex: mapped[n.id] }))
}

export async function persistZIndexNormalization(canvasId: string, nodes: CanvasNode[]): Promise<void> {
    const normalized = normalizeZIndex(nodes)
    for (const n of normalized as any[]) {
        await fsUpdateShape(canvasId, n.id, { zIndex: n.zIndex } as any)
    }
}

// Introspection helpers for the AI agent
export async function getCanvasState(canvasId: string): Promise<any[]> {
    // Returns current shapes for the given canvas
    return await listShapes(canvasId)
}


