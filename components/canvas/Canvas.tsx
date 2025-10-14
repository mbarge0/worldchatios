'use client'

import dynamic from 'next/dynamic'

const CanvasStage = dynamic(() => import('@/components/canvas/CanvasStage'), { ssr: false })

export default function Canvas() {
    return (
        <div data-testid="canvas-root" className="w-full h-full">
            <CanvasStage />
        </div>
    )
}


