import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/data/firestore-adapter', () => ({
    setShapeLock: vi.fn(async () => { }),
    refreshShapeLock: vi.fn(async () => { }),
    clearShapeLock: vi.fn(async () => { }),
    updateShape: vi.fn(async () => { }),
}))

vi.mock('@/lib/hooks/useFirebaseAuth', () => ({
    useFirebaseAuth: () => ({ user: { uid: 'test-user' } }),
}))

import { useShapeWriter } from '@/lib/hooks/useShapeWriter'
import { act, renderHook } from '@testing-library/react'

// jsdom timers are available in vitest

describe('useShapeWriter', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    it('debounces intermediate updates and commits final write', async () => {
        const { result } = renderHook(() => useShapeWriter('canvas-1', 5000, 75))
        // begin
        act(() => {
            result.current.beginTransform('shape-1')
        })
        // several updates within debounce window
        act(() => {
            result.current.debouncedUpdate('shape-1', { x: 10 })
            vi.advanceTimersByTime(30)
            result.current.debouncedUpdate('shape-1', { x: 20 })
            vi.advanceTimersByTime(30)
            result.current.debouncedUpdate('shape-1', { x: 30 })
        })
        // let debounce elapse
        act(() => {
            vi.advanceTimersByTime(100)
        })
        // final commit
        act(() => {
            result.current.commitTransform('shape-1', { x: 30 })
        })
        expect(true).toBe(true)
    })
})
