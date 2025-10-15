'use client'

import { useShapesSync } from '@/lib/hooks/useShapesSync'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

const CanvasStage = dynamic(() => import('@/components/canvas/CanvasStage'), { ssr: false })

export default function Canvas() {
    const { canvasId } = useParams<{ canvasId: string }>()
    useShapesSync(canvasId)
    const stageCanvasId = useMemo(() => canvasId, [canvasId])
    return (
        <div data-testid="canvas-root" className="w-full h-full">
            <CanvasStage canvasId={stageCanvasId} />
        </div>
    )
}


