import CursorLayer from '@/components/canvas/CursorLayer'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('react-konva', () => {
    const Layer = (props: any) => <div data-testid={props['data-testid'] ?? 'Layer'}>{props.children}</div>
    const Label = (props: any) => <div data-testid={props['data-testid'] ?? 'Label'}>{props.children}</div>
    const Line = (props: any) => <div data-testid={props['data-testid'] ?? 'Line'}>{props.children}</div>
    const Tag = (props: any) => <div data-testid={props['data-testid'] ?? 'Tag'}>{props.children}</div>
    const Text = (props: any) => <div data-testid={props['data-testid'] ?? 'Text'}>{props.text}</div>
    return { Layer, Label, Line, Tag, Text }
})

describe('CursorLayer', () => {
    it('renders labels for provided cursors', () => {
        const cursors = [
            { userId: 'a', displayName: 'Alice', color: '#f00', x: 10, y: 20 },
            { userId: 'b', displayName: 'Bob', color: '#0f0', x: 30, y: 40 },
        ]
        render(<CursorLayer cursors={cursors} />)
        expect(screen.getAllByTestId('Label').length).toBeGreaterThanOrEqual(2)
        expect(screen.getAllByTestId('Text').map((el) => el.textContent)).toContain('Alice')
        expect(screen.getAllByTestId('Text').map((el) => el.textContent)).toContain('Bob')
    })
})


