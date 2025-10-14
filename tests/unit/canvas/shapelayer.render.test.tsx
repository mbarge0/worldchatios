import ShapeLayer from '@/components/canvas/ShapeLayer'
import { useCanvasStore } from '@/lib/store/canvas-store'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-konva', () => {
    const Rect = (props: any) => <div data-testid={props['data-testid'] ?? 'Rect'}>{props.children}</div>
    const Text = (props: any) => <div data-testid={props['data-testid'] ?? 'Text'}>{props.children}</div>
    return { Rect, Text }
})

describe('ShapeLayer', () => {
    beforeEach(() => {
        useCanvasStore.setState({
            nodes: [
                { id: 'r1', type: 'rect', x: 0, y: 0, width: 100, height: 50, rotation: 0 },
                { id: 't1', type: 'text', x: 10, y: 10, width: 200, height: 40, rotation: 0, text: 'Hello' },
            ],
            selectedIds: [],
        } as any)
    })

    it('renders Rect and Text nodes', () => {
        render(<ShapeLayer />)
        expect(screen.getByTestId('shape-r1')).toBeInTheDocument()
        expect(screen.getByTestId('shape-t1')).toBeInTheDocument()
    })
})


