import Toolbar from '@/components/ui/Toolbar'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('Toolbar', () => {
    it('renders + Rect and + Text buttons and triggers handlers', () => {
        const onAddRect = vi.fn()
        const onAddText = vi.fn()
        render(<Toolbar onAddRect={onAddRect} onAddText={onAddText} />)
        const rectBtn = screen.getByText('+ Rect')
        const textBtn = screen.getByText('+ Text')
        expect(rectBtn).toBeInTheDocument()
        expect(textBtn).toBeInTheDocument()
        fireEvent.click(rectBtn)
        fireEvent.click(textBtn)
        expect(onAddRect).toHaveBeenCalledTimes(1)
        expect(onAddText).toHaveBeenCalledTimes(1)
    })
})


