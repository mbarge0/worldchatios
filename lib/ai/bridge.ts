'use client'

import { createShape as fsCreateShape } from '@/lib/data/firestore-adapter'
import { useCanvasStore, type CanvasNode } from '@/lib/store/canvas-store'
import { v4 as uuidv4 } from 'uuid'

type SquareShape = {
    id: string
    type: 'rect'
    x: number
    y: number
    width: number
    height: number
    rotation: number
    zIndex: number
    fill?: string
    stroke?: string
    opacity?: number
    updatedAt: number
}

type TextNode = {
    id: string
    type: 'text'
    x: number
    y: number
    width: number
    height: number
    rotation: number
    zIndex: number
    text: string
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    fill?: string
    opacity?: number
    updatedAt: number
}

function randomColor(): string {
    const palette = ['#60a5fa', '#34d399', '#f472b6', '#f59e0b', '#a78bfa']
    return palette[Math.floor(Math.random() * palette.length)]
}

async function createSquare(canvasId: string, shape?: Partial<SquareShape>): Promise<void> {
    if (!canvasId) return
    const id = shape?.id || uuidv4()
    const now = Date.now()
    const payload: SquareShape = {
        id,
        type: 'rect',
        x: shape?.x ?? 100,
        y: shape?.y ?? 100,
        width: shape?.width ?? 100,
        height: shape?.height ?? 100,
        rotation: shape?.rotation ?? 0,
        zIndex: shape?.zIndex ?? now,
        fill: shape?.fill ?? randomColor(),
        stroke: shape?.stroke ?? '#1f2937',
        opacity: shape?.opacity ?? 1,
        updatedAt: now,
    }
    try {
        const setNodes = useCanvasStore.getState().setNodes
        const current = useCanvasStore.getState().nodes
        const next: CanvasNode = {
            id: payload.id,
            type: 'rect',
            x: payload.x,
            y: payload.y,
            width: payload.width,
            height: payload.height,
            rotation: 0,
            zIndex: payload.zIndex,
            fill: payload.fill,
            stroke: payload.stroke,
            opacity: payload.opacity,
        }
        setNodes([...(current as any[]), next])
        // eslint-disable-next-line no-console
        console.log('✅ Added square to canvas store')
        // eslint-disable-next-line no-console
        console.log('✅ Square rendered to canvas')
    } catch { }
    // eslint-disable-next-line no-console
    console.log('🎨 AI created a square on canvas', canvasId)
    await fsCreateShape(canvasId, payload as any)
}

async function createText(canvasId: string, shape?: Partial<TextNode>): Promise<void> {
    if (!canvasId) return
    const id = shape?.id || uuidv4()
    const now = Date.now()
    const payload: TextNode = {
        id,
        type: 'text',
        x: shape?.x ?? 120,
        y: shape?.y ?? 120,
        width: shape?.width ?? 200,
        height: shape?.height ?? 40,
        rotation: shape?.rotation ?? 0,
        zIndex: shape?.zIndex ?? now,
        text: shape?.text ?? 'Hello World',
        fontSize: shape?.fontSize ?? 18,
        fontFamily: shape?.fontFamily ?? 'Inter, system-ui, sans-serif',
        fontWeight: shape?.fontWeight ?? 'normal',
        fill: shape?.fill ?? '#111827',
        opacity: shape?.opacity ?? 1,
        updatedAt: now,
    }
    try {
        const setNodes = useCanvasStore.getState().setNodes
        const current = useCanvasStore.getState().nodes
        const next: CanvasNode = {
            id: payload.id,
            type: 'text',
            x: payload.x,
            y: payload.y,
            width: payload.width,
            height: payload.height,
            rotation: 0,
            zIndex: payload.zIndex,
            fill: payload.fill,
            opacity: payload.opacity,
            // @ts-expect-error augmenting for text node fields
            text: payload.text,
            // @ts-expect-error optional text props
            fontSize: payload.fontSize,
            // @ts-expect-error optional text props
            fontFamily: payload.fontFamily,
            // @ts-expect-error optional text props
            fontWeight: payload.fontWeight,
        } as any
        setNodes([...(current as any[]), next])
        // eslint-disable-next-line no-console
        console.log('✅ Added text to canvas store')
    } catch { }
    // eslint-disable-next-line no-console
    console.log('🎨 AI created a text node on canvas', canvasId)
    await fsCreateShape(canvasId, payload as any)
}

export function installCcTools(): void {
    if (typeof window === 'undefined') return
    const w = window as any
    w.ccTools = w.ccTools || {}
    if (!w.ccTools.createShape) w.ccTools.createShape = createSquare
    if (!w.ccTools.createText) w.ccTools.createText = createText
}


