'use client'

import { useCanvasStore } from '@/lib/store/canvas-store'
import { Rect, Text } from 'react-konva'

type ShapeLayerProps = {
    onEditText?: (id: string) => void
}

export default function ShapeLayer({ onEditText }: ShapeLayerProps) {
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

    // 👇 Diagnostic: See if onEditText is live when ShapeLayer first renders
    //console.log('ShapeLayer render, onEditText:', !!onEditText)

    return (
        <>
            {nodes.map((n: any) => {
                const isSelected = selectedIds.includes(n.id)

                if (n.type === 'text') {
                    return (
                        <Text
                            key={n.id}
                            data-testid={`shape-${n.id}`}
                            x={n.x}
                            y={n.y}
                            width={n.width}
                            height={n.height}
                            rotation={0}
                            text={n.text ?? ''}
                            fontSize={n.fontSize ?? 18}
                            fontFamily={n.fontFamily ?? 'Inter, system-ui, sans-serif'}
                            fontStyle={n.fontWeight ?? 'normal'}
                            align={n.textAlign ?? 'left'}
                            lineHeight={n.lineHeight ?? 1.2}
                            fill={n.fill ?? '#111827'}
                            opacity={n.opacity ?? 1}
                            onClick={(e) => {
                                console.log('🖱️ Konva text onClick fired for', n.id)
                                handleClick(e, n.id)
                            }}
                            // 👇 Replace your old onDblClick line with this diagnostic
                            onDblClick={(e) => {
                                console.log('🔥 Konva double-click event fired for', n.id);
                                //e.cancelBubble = true;
                                onEditText?.(n.id);
                            }}
                        />
                    )
                }

                return (
                    <Rect
                        key={n.id}
                        data-testid={`shape-${n.id}`}
                        x={n.x}
                        y={n.y}
                        width={n.width}
                        height={n.height}
                        rotation={0}
                        cornerRadius={8}
                        fill={n.fill ?? '#E5E7EB'}
                        stroke={isSelected ? '#3B82F6' : n.stroke ?? '#94A3B8'}
                        opacity={n.opacity ?? 1}
                        strokeWidth={isSelected ? 2 : 1}
                        shadowColor={'#000000'}
                        shadowBlur={8}
                        shadowOpacity={0.08}
                        shadowOffset={{ x: 0, y: 2 }}
                        onClick={(e) => handleClick(e, n.id)}
                    />
                )
            })}
        </>
    )
}