'use client'

import { useCanvasStore } from '@/lib/store/canvas-store'
import { Rect } from 'react-konva'

export default function ShapeLayer() {
    const { nodes, selectedIds, setSelection, addToSelection } = useCanvasStore()

    const handleClick = (e: any, id: string) => {
        const isShift = !!e.evt.shiftKey
        if (isShift) {
            addToSelection(id)
        } else {
            setSelection([id])
        }
        e.cancelBubble = true
    }

    return (
        <>
            {nodes.map((n) => {
                const isSelected = selectedIds.includes(n.id)
                return (
                    <Rect
                        key={n.id}
                        data-testid={`shape-${n.id}`}
                        x={n.x}
                        y={n.y}
                        width={n.width}
                        height={n.height}
                        rotation={n.rotation}
                        cornerRadius={4}
                        fill="#E5E7EB"
                        stroke={isSelected ? '#3B82F6' : '#94A3B8'}
                        strokeWidth={isSelected ? 2 : 1}
                        onClick={(e) => handleClick(e, n.id)}
                    />
                )
            })}
        </>
    )
}


