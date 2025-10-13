import { useCanvasStore } from '@/lib/store/canvas-store'
import { describe, expect, it } from 'vitest'

describe('canvas store', () => {
    it('updates viewport scale and position', () => {
        const { setScale, setPosition } = useCanvasStore.getState()
        setScale(2)
        setPosition({ x: 10, y: 20 })
        const { viewport } = useCanvasStore.getState()
        expect(viewport.scale).toBe(2)
        expect(viewport.position).toEqual({ x: 10, y: 20 })
    })

    it('manages selection add/remove/clear', () => {
        const { setSelection, addToSelection, removeFromSelection, clearSelection } = useCanvasStore.getState()
        setSelection(['a'])
        addToSelection('b')
        expect(useCanvasStore.getState().selectedIds).toEqual(['a', 'b'])
        removeFromSelection('a')
        expect(useCanvasStore.getState().selectedIds).toEqual(['b'])
        clearSelection()
        expect(useCanvasStore.getState().selectedIds).toEqual([])
    })

    it('nudges and removes selected nodes', () => {
        const store = useCanvasStore.getState()
        store.setSelection(['n1'])
        store.nudgeSelected(5, -3)
        const n1 = useCanvasStore.getState().nodes.find((n) => n.id === 'n1')!
        expect(n1.x).toBe(105)
        expect(n1.y).toBe(97)
        store.removeSelectedNodes()
        expect(useCanvasStore.getState().nodes.find((n) => n.id === 'n1')).toBeUndefined()
        expect(useCanvasStore.getState().selectedIds).toEqual([])
    })
})


