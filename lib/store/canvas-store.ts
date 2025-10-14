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
    updateNode: (id: string, updates: Partial<CanvasNode>) => void
    updateSelectedNodes: (updater: (node: CanvasNode) => CanvasNode) => void
    removeSelectedNodes: () => void
    nudgeSelected: (dx: number, dy: number) => void
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
        { id: 'n1', x: 100, y: 100, width: 160, height: 100, rotation: 0 },
        { id: 'n2', x: 340, y: 160, width: 140, height: 140, rotation: 0 },
    ],

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
}))

export type CanvasNode = {
    id: string
    x: number
    y: number
    width: number
    height: number
    rotation: number
}


