'use client'

import { useShapesSync } from '@/lib/hooks/useShapesSync'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useMemo, useRef } from 'react'

const CanvasStage = dynamic(() => import('@/components/canvas/CanvasStage'), { ssr: false })

export default function Canvas({ stageRef: externalStageRef }: { stageRef?: any } = {}) {
    const { canvasId } = useParams<{ canvasId: string }>()
    useShapesSync(canvasId)
    const stageCanvasId = useMemo(() => canvasId, [canvasId])
    const internalRef = useRef<any>(null)
    const refToUse = externalStageRef || internalRef
    return (
        <div data-testid="canvas-root" className="w-full h-full">
            <CanvasStage canvasId={stageCanvasId} stageRef={refToUse} />
        </div>
    )
}


