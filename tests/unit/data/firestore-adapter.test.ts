import { describe, expect, it } from 'vitest'

import * as adapter from '@/lib/data/firestore-adapter'

describe('firestore-adapter types', () => {
    it('exports CRUD functions', () => {
        expect(typeof adapter.createCanvas).toBe('function')
        expect(typeof adapter.getCanvas).toBe('function')
        expect(typeof adapter.updateCanvas).toBe('function')
        expect(typeof adapter.deleteCanvas).toBe('function')
        expect(typeof adapter.createShape).toBe('function')
        expect(typeof adapter.updateShape).toBe('function')
        expect(typeof adapter.deleteShape).toBe('function')
        expect(typeof adapter.listShapes).toBe('function')
        expect(typeof adapter.onShapesSnapshot).toBe('function')
    })
})
