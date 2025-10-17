'use client'

import Button from '@/components/ui/Button'
import { AlignCenter, AlignHorizontalDistributeCenter, AlignLeft, AlignRight, AlignVerticalDistributeCenter, AlignVerticalJustifyCenter, Download, Grid, Layers, MessageSquare, Square, Type } from 'lucide-react'
import { useState } from 'react'

type ToolbarProps = {
    onAddRect?: () => void
    onAddText?: () => void
    onDuplicate?: () => void
    onDelete?: () => void
    onAlign?: (op: 'left' | 'centerX' | 'right' | 'top' | 'middleY' | 'bottom' | 'distributeH' | 'distributeV') => void
    onZIndex?: (op: 'front' | 'back' | 'forward' | 'backward') => void
    onExport?: (op: 'png1x' | 'png2x' | 'png4x' | 'svg') => void
    onExportSelection?: (op: 'png1x' | 'png2x' | 'png4x' | 'svg') => void
    onSaveVersion?: () => void
    onRestoreVersion?: () => void
    onToggleGrid?: () => void
    onToggleChat?: () => void
    className?: string
    orientation?: 'horizontal' | 'vertical'
}

export default function Toolbar({ onAddRect, onAddText, onDuplicate, onDelete, onAlign, onZIndex, onExport, onExportSelection, onToggleGrid, onToggleChat, onSaveVersion, onRestoreVersion, className = '', orientation = 'vertical' }: ToolbarProps) {
    const [showAlign, setShowAlign] = useState<boolean>(false)
    const divider = <div className={`${orientation === 'vertical' ? 'h-px w-6 self-center' : 'w-px h-6'} bg-slate-200 mx-1`} />
    return (
        <div className={`relative flex ${orientation === 'vertical' ? 'flex-col' : 'items-center'} gap-2 bg-[var(--brand-dark)]/90 text-[var(--brand-white)] backdrop-blur rounded-xl shadow border border-[var(--brand-gold)]/30 ${orientation === 'vertical' ? 'px-1 py-2' : 'px-2 py-1'} ${className}`} role="toolbar" aria-label="Canvas toolbar">
            <Button variant="secondary" onClick={onToggleChat} title="Toggle Chat (Ctrl+`)" className="!bg-[var(--brand-gold)] !text-[var(--brand-dark)]"><MessageSquare className="w-4 h-4" /></Button>
            <Button variant="secondary" onClick={onAddRect} title="Rectangle (R)"><Square className="w-4 h-4" /><span className="hidden sm:inline ml-1">+ Rect</span></Button>
            <Button variant="secondary" onClick={onAddText} title="Text (T)"><Type className="w-4 h-4" /><span className="hidden sm:inline ml-1">+ Text</span></Button>
            {divider}
            <Button variant="secondary" onClick={onDuplicate} title="Duplicate (Cmd/Ctrl+D)">Dup</Button>
            <Button variant="secondary" onClick={onDelete} title="Delete (Del)">Del</Button>
            {divider}
            <Button variant="secondary" onClick={onToggleGrid} title="Grid (G)"><Grid className="w-4 h-4" /></Button>
            {divider}
            {/* Grouped Alignment menu */}
            <div className="relative">
                <Button variant="secondary" onClick={() => setShowAlign((v) => !v)} title="Alignment menu">Align ▾</Button>
                {showAlign && (
                    <div className={`absolute z-20 mt-1 ${orientation === 'vertical' ? 'left-full top-0 ml-1' : 'top-full left-0'} bg-white text-slate-900 rounded-md shadow border p-1 w-40`} role="menu" aria-label="Alignment options">
                        <button className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-slate-100" onClick={() => { setShowAlign(false); onAlign?.('left') }}><AlignLeft className="w-4 h-4" /> Left</button>
                        <button className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-slate-100" onClick={() => { setShowAlign(false); onAlign?.('centerX') }}><AlignCenter className="w-4 h-4" /> Center (H)</button>
                        <button className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-slate-100" onClick={() => { setShowAlign(false); onAlign?.('right') }}><AlignRight className="w-4 h-4" /> Right</button>
                        <div className="my-1 h-px bg-slate-200" />
                        <button className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-slate-100" onClick={() => { setShowAlign(false); onAlign?.('top') }}><AlignVerticalJustifyCenter className="w-4 h-4 rotate-180" /> Top</button>
                        <button className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-slate-100" onClick={() => { setShowAlign(false); onAlign?.('middleY') }}><AlignVerticalJustifyCenter className="w-4 h-4" /> Middle (V)</button>
                        <button className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-slate-100" onClick={() => { setShowAlign(false); onAlign?.('bottom') }}><AlignVerticalJustifyCenter className="w-4 h-4 rotate-180" style={{ transform: 'rotate(0.5turn)' as any }} /> Bottom</button>
                        <div className="my-1 h-px bg-slate-200" />
                        <button className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-slate-100" onClick={() => { setShowAlign(false); onAlign?.('distributeH') }}><AlignHorizontalDistributeCenter className="w-4 h-4" /> Distribute H</button>
                        <button className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-slate-100" onClick={() => { setShowAlign(false); onAlign?.('distributeV') }}><AlignVerticalDistributeCenter className="w-4 h-4" /> Distribute V</button>
                    </div>
                )}
            </div>
            {divider}
            <Button variant="secondary" onClick={() => onZIndex?.('forward')} title="Bring Forward"><Layers className="w-4 h-4" /></Button>
            <Button variant="secondary" onClick={() => onZIndex?.('backward')} title="Send Backward"><Layers className="w-4 h-4 rotate-180" /></Button>
            {divider}
            <Button variant="secondary" onClick={() => onExport?.('png2x')} title="Export PNG (2x)"><Download className="w-4 h-4" /></Button>
            <Button variant="secondary" onClick={() => onExportSelection?.('png2x')} title="Export Selection PNG (2x)">Sel</Button>
            <Button variant="secondary" onClick={onSaveVersion} title="Save Version">SV</Button>
            <Button variant="secondary" onClick={onRestoreVersion} title="Restore Latest">RL</Button>
        </div>
    )
}


