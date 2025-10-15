import CursorLayer from '@/components/canvas/CursorLayer'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('react-konva', () => {
    const Layer = (props: any) => <div data-testid={props['data-testid'] ?? 'Layer'}>{props.children}</div>
    const Group = (props: any) => <div data-testid={props['data-testid'] ?? 'Group'}>{props.children}</div>
    const Circle = (_props: any) => <div data-testid={_props['data-testid'] ?? 'Circle'} />
    const Text = (props: any) => <div data-testid={props['data-testid'] ?? 'Text'}>{props.text}</div>
    return { Layer, Group, Circle, Text }
})

describe('CursorLayer', () => {
    it('renders names for provided cursors', () => {
        const cursors = [
            { userId: 'a', displayName: 'Alice', color: '#f00', x: 10, y: 20 },
            { userId: 'b', displayName: 'Bob', color: '#0f0', x: 30, y: 40 },
        ]
        render(<CursorLayer cursors={cursors} />)
        const texts = screen.getAllByTestId('Text').map((el) => el.textContent)
        expect(texts).toContain('Alice')
        expect(texts).toContain('Bob')
    })
})


