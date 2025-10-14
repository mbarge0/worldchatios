'use client'

import { useCanvasStore } from '@/lib/store/canvas-store'
import { useEffect, useRef, useState } from 'react'
import { Layer, Stage } from 'react-konva'
import SelectionLayer from './SelectionLayer'
import ShapeLayer from './ShapeLayer'
import TransformHandles from './TransformHandles'

type CanvasStageProps = {
    width?: number
    height?: number
}

export default function CanvasStage({ width, height }: CanvasStageProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
        width: width ?? 0,
        height: height ?? 0,
    })

    const {
        viewport,
        setScale,
        setPosition,
        setMode,
        mode,
        clearSelection,
        removeSelectedNodes,
        nudgeSelected,
        selectedIds,
    } = useCanvasStore()

    // --- 1. Measure size (with safe fallback + animation frame) ---
    useEffect(() => {
        const updateSize = () => {
            const rect = containerRef.current?.getBoundingClientRect()
            if (rect && rect.width > 0 && rect.height > 0) {
                setContainerSize({
                    width: Math.floor(rect.width),
                    height: Math.floor(rect.height),
                })
            } else {
                // fallback to viewport
                setContainerSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                })
            }
        }

        // run once after layout settles
        requestAnimationFrame(updateSize)

        // watch for resize
        const observer = new ResizeObserver(() => requestAnimationFrame(updateSize))
        if (containerRef.current) observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    // --- 2. Keyboard handling ---
    useEffect(() => {
        containerRef.current?.focus()
    }, [])

    const handleKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
        const baseStep = ev.shiftKey ? 10 : 1
        const step = baseStep / Math.max(0.0001, viewport.scale)
        if (ev.key === 'ArrowLeft') {
            nudgeSelected(-step, 0)
            ev.preventDefault()
        } else if (ev.key === 'ArrowRight') {
            nudgeSelected(step, 0)
            ev.preventDefault()
        } else if (ev.key === 'ArrowUp') {
            nudgeSelected(0, -step)
            ev.preventDefault()
        } else if (ev.key === 'ArrowDown') {
            nudgeSelected(0, step)
            ev.preventDefault()
        } else if (ev.key === 'Escape') {
            clearSelection()
        } else if (ev.key === 'Backspace' || ev.key === 'Delete') {
            if (selectedIds.length > 0) {
                removeSelectedNodes()
                ev.preventDefault()
            }
        }
    }

    // --- 3. Zooming and Panning ---
    const handleWheel = (e: any) => {
        e.evt.preventDefault()
        const stage = e.target.getStage()
        if (!stage) return

        const oldScale = viewport.scale
        const pointer = stage.getPointerPosition()
        if (!pointer) return

        const scaleBy = 1.05
        const direction = e.evt.deltaY > 0 ? -1 : 1
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

        const mousePointTo = {
            x: (pointer.x - viewport.position.x) / oldScale,
            y: (pointer.y - viewport.position.y) / oldScale,
        }

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        }

        setScale(newScale)
        setPosition(newPos)
    }

    const isSpaceDownRef = useRef(false)
    useEffect(() => {
        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.code === 'Space') isSpaceDownRef.current = true
        }
        const onKeyUp = (ev: KeyboardEvent) => {
            if (ev.code === 'Space') {
                isSpaceDownRef.current = false
                if (mode === 'panning') setMode('idle')
            }
        }
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [mode, setMode])

    const lastPosRef = useRef<{ x: number; y: number } | null>(null)
    const handleMouseDown = (e: any) => {
        if (!isSpaceDownRef.current) return
        setMode('panning')
        const pointer = e.target.getStage()?.getPointerPosition()
        if (!pointer) return
        lastPosRef.current = { x: pointer.x, y: pointer.y }
    }
    const handleMouseMove = (e: any) => {
        if (mode !== 'panning') return
        const pointer = e.target.getStage()?.getPointerPosition()
        if (!pointer || !lastPosRef.current) return
        const dx = pointer.x - lastPosRef.current.x
        const dy = pointer.y - lastPosRef.current.y
        lastPosRef.current = { x: pointer.x, y: pointer.y }
        setPosition({ x: viewport.position.x + dx, y: viewport.position.y + dy })
    }
    const handleMouseUp = () => {
        if (mode === 'panning') setMode('idle')
        lastPosRef.current = null
    }

    // --- 4. Safe computed stage size ---
    const stageWidth = containerSize.width || window.innerWidth
    const stageHeight = containerSize.height || window.innerHeight

    // --- 5. Render Stage unconditionally (no gating) ---
    return (
        <div
            ref={containerRef}
            data-testid="canvas-stage-container"
            className="w-full h-full bg-gray-100"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <Stage
                data-testid="canvas-stage"
                width={stageWidth}
                height={stageHeight}
                scaleX={viewport.scale}
                scaleY={viewport.scale}
                x={viewport.position.x}
                y={viewport.position.y}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ background: '#fafafa' }}
            >
                <Layer data-testid="canvas-base-layer">
                    <ShapeLayer />
                    <SelectionLayer />
                    <TransformHandles />
                </Layer>
            </Stage>
        </div>
    )
}