'use client'

import Button from '@/components/ui/Button'

type ToolbarProps = {
    onAddRect?: () => void
    onAddText?: () => void
    className?: string
}

export default function Toolbar({ onAddRect, onAddText, className = '' }: ToolbarProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Button variant="primary" onClick={onAddRect}>+ Rect</Button>
            <Button variant="secondary" onClick={onAddText}>+ Text</Button>
        </div>
    )
}


