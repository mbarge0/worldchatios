import { useCanvasStore } from '@/lib/store/canvas-store'
import { describe, expect, it } from 'vitest'

describe('selection and transforms (store-level)', () => {
    it('updates selected nodes via updateSelectedNodes', () => {
        const store = useCanvasStore.getState()
        store.setSelection(['n1'])
        store.updateSelectedNodes((n) => ({ ...n, x: n.x + 20, y: n.y + 10 }))
        const n1 = useCanvasStore.getState().nodes.find((n) => n.id === 'n1')!
        expect(n1.x).toBe(120)
        expect(n1.y).toBe(110)
    })
})


