import { describe, expect, it } from 'vitest'

// Simple math-only test to validate viewport-centered spawn calculation equivalence
// Mirrors logic used in app/c/[canvasId]/page.tsx for rect/text spawn

function viewToWorldCenter(windowW: number, windowH: number, stageX: number, stageY: number, scaleX: number, scaleY: number) {
    const cx = (windowW / 2 - stageX) / (scaleX || 1)
    const cy = (windowH / 2 - stageY) / (scaleY || 1)
    return { x: Math.round(cx), y: Math.round(cy) }
}

describe('Viewport-centered spawn math', () => {
    it('computes correct world center under zoom and pan', () => {
        const windowW = 1200, windowH = 800
        const stageX = -300, stageY = -200
        const scale = 2
        const { x, y } = viewToWorldCenter(windowW, windowH, stageX, stageY, scale, scale)
        // With stage offset -300,-200 and 2x zoom, the visible center should map accordingly
        // Expected derived manually
        expect(x).toBe(Math.round((600 + 300) / 2))
        expect(y).toBe(Math.round((400 + 200) / 2))
    })
})


