import { create } from 'zustand'

type InteractionMode = 'idle' | 'panning' | 'marquee' | 'transform'

export type Viewport = {
    scale: number
    position: { x: number; y: number }
}

export type CanvasStoreState = {
    viewport: Viewport
    selectedIds: string[]
    mode: InteractionMode
    nodes: CanvasNode[]
    transformSession?: {
        shapeId: string | null
        startedAt: number | null
        lastUpdatedAt: number | null
    }
}

export type CanvasStoreActions = {
    setScale: (scale: number) => void
    setPosition: (position: { x: number; y: number }) => void
    setViewport: (viewport: Viewport) => void
    setMode: (mode: InteractionMode) => void
    clearSelection: () => void
    setSelection: (ids: string[]) => void
    addToSelection: (id: string) => void
    removeFromSelection: (id: string) => void
    setNodes: (nodes: CanvasNode[]) => void
    updateNode: (id: string, updates: Partial<CanvasNode>) => void
    updateSelectedNodes: (updater: (node: CanvasNode) => CanvasNode) => void
    removeSelectedNodes: () => void
    nudgeSelected: (dx: number, dy: number) => void
    startTransformSession: (shapeId: string) => void
    updateTransformSession: () => void
    endTransformSession: () => void
}

export type CanvasStore = CanvasStoreState & CanvasStoreActions

export const useCanvasStore = create<CanvasStore>((set, get) => ({
    viewport: {
        scale: 1,
        position: { x: 0, y: 0 },
    },
    selectedIds: [],
    mode: 'idle',
    nodes: [
        { id: 'n1', type: 'rect', x: 100, y: 100, width: 160, height: 100, rotation: 0 },
        { id: 'n2', type: 'rect', x: 340, y: 160, width: 140, height: 140, rotation: 0 },
    ],
    transformSession: { shapeId: null, startedAt: null, lastUpdatedAt: null },

    setScale: (scale) =>
        set((state) => ({ viewport: { ...state.viewport, scale } })),
    setPosition: (position) => set((state) => ({ viewport: { ...state.viewport, position } })),
    setViewport: (viewport) => set(() => ({ viewport })),
    setMode: (mode) => set(() => ({ mode })),
    clearSelection: () => set(() => ({ selectedIds: [] })),
    setSelection: (ids) => set(() => ({ selectedIds: Array.from(new Set(ids)) })),
    addToSelection: (id) =>
        set((state) => ({ selectedIds: state.selectedIds.includes(id) ? state.selectedIds : [...state.selectedIds, id] })),
    removeFromSelection: (id) => set((state) => ({ selectedIds: state.selectedIds.filter((sid) => sid !== id) })),
    setNodes: (nodes) => set(() => ({ nodes })),
    updateNode: (id, updates) =>
        set((state) => ({ nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)) })),
    updateSelectedNodes: (updater) =>
        set((state) => ({ nodes: state.nodes.map((n) => (state.selectedIds.includes(n.id) ? updater(n) : n)) })),
    removeSelectedNodes: () =>
        set((state) => ({ nodes: state.nodes.filter((n) => !state.selectedIds.includes(n.id)), selectedIds: [] })),
    nudgeSelected: (dx, dy) =>
        set((state) => ({
            nodes: state.nodes.map((n) => (state.selectedIds.includes(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n)),
        })),
    startTransformSession: (shapeId) => set(() => ({ transformSession: { shapeId, startedAt: Date.now(), lastUpdatedAt: Date.now() } })),
    updateTransformSession: () => set((state) => ({ transformSession: { ...(state.transformSession || { shapeId: null, startedAt: null, lastUpdatedAt: null }), lastUpdatedAt: Date.now() } })),
    endTransformSession: () => set(() => ({ transformSession: { shapeId: null, startedAt: null, lastUpdatedAt: null } })),
}))

export type CanvasNodeBase = {
    id: string
    type: 'rect' | 'text'
    x: number
    y: number
    width: number
    height: number
    rotation: number
    zIndex?: number
    fill?: string
    stroke?: string
    opacity?: number
}

export type RectNode = CanvasNodeBase & { type: 'rect' }
export type TextNode = CanvasNodeBase & {
    type: 'text'
    text: string
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    textAlign?: 'left' | 'center' | 'right'
    lineHeight?: number
}

export type CanvasNode = RectNode | TextNode


