import CanvasStage from '@/components/canvas/CanvasStage'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-konva', () => {
    // Minimal mocks to allow render in jsdom
    const Stage = (props: any) => <div data-testid={props['data-testid'] ?? 'Stage'}>{props.children}</div>
    const Layer = (props: any) => <div data-testid={props['data-testid'] ?? 'Layer'}>{props.children}</div>
    const Rect = (props: any) => <div data-testid={props['data-testid'] ?? 'Rect'}>{props.children}</div>
    const Circle = (props: any) => <div data-testid={props['data-testid'] ?? 'Circle'}>{props.children}</div>
    const Group = (props: any) => <div data-testid={props['data-testid'] ?? 'Group'}>{props.children}</div>
    return { Stage, Layer, Rect, Circle, Group }
})

describe('CanvasStage', () => {
    beforeEach(() => {
        vi.spyOn(global as any, 'ResizeObserver').mockImplementation(function (this: any, cb: any) {
            this.observe = vi.fn()
            this.disconnect = vi.fn()
        } as any)
    })

    it('renders stage container and base layer', () => {
        render(<div style={{ width: 800, height: 600 }}><CanvasStage width={800} height={600} /></div>)
        expect(screen.getByTestId('canvas-stage-container')).toBeInTheDocument()
        expect(screen.getByTestId('canvas-base-layer')).toBeInTheDocument()
    })
})


