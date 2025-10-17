'use client'

import Button from '@/components/ui/Button'
import { Download, Grid, Layers, MessageSquare, Square, Type } from 'lucide-react'

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
}

export default function Toolbar({ onAddRect, onAddText, onDuplicate, onDelete, onAlign, onZIndex, onExport, onExportSelection, onToggleGrid, onToggleChat, onSaveVersion, onRestoreVersion, className = '' }: ToolbarProps) {
    return (
        <div className={`flex items-center gap-2 bg-[var(--brand-dark)]/90 text-[var(--brand-white)] backdrop-blur rounded-xl shadow border border-[var(--brand-gold)]/30 px-2 py-1 ${className}`} role="toolbar" aria-label="Canvas toolbar">
            <Button variant="secondary" onClick={onToggleChat} title="Toggle Chat (Ctrl+`)" className="!bg-[var(--brand-gold)] !text-[var(--brand-dark)]"><MessageSquare className="w-4 h-4" /></Button>
            <Button variant="secondary" onClick={onAddRect} title="Rectangle (R)"><Square className="w-4 h-4" /></Button>
            <Button variant="secondary" onClick={onAddText} title="Text (T)"><Type className="w-4 h-4" /></Button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Button variant="secondary" onClick={onDuplicate} title="Duplicate (Cmd/Ctrl+D)">Dup</Button>
            <Button variant="secondary" onClick={onDelete} title="Delete (Del)">Del</Button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Button variant="secondary" onClick={onToggleGrid} title="Grid (G)"><Grid className="w-4 h-4" /></Button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            {/* Alignment */}
            <Button variant="secondary" onClick={() => onAlign?.('left')} title="Align Left">AL</Button>
            <Button variant="secondary" onClick={() => onAlign?.('centerX')} title="Align Center (Horizontal)">AC</Button>
            <Button variant="secondary" onClick={() => onAlign?.('right')} title="Align Right">AR</Button>
            <Button variant="secondary" onClick={() => onAlign?.('top')} title="Align Top">AT</Button>
            <Button variant="secondary" onClick={() => onAlign?.('middleY')} title="Align Middle (Vertical)">AM</Button>
            <Button variant="secondary" onClick={() => onAlign?.('bottom')} title="Align Bottom">AB</Button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Button variant="secondary" onClick={() => onAlign?.('distributeH')} title="Distribute Horizontal">DH</Button>
            <Button variant="secondary" onClick={() => onAlign?.('distributeV')} title="Distribute Vertical">DV</Button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Button variant="secondary" onClick={() => onZIndex?.('forward')} title="Bring Forward"><Layers className="w-4 h-4" /></Button>
            <Button variant="secondary" onClick={() => onZIndex?.('backward')} title="Send Backward"><Layers className="w-4 h-4 rotate-180" /></Button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Button variant="secondary" onClick={() => onExport?.('png2x')} title="Export PNG (2x)"><Download className="w-4 h-4" /></Button>
            <Button variant="secondary" onClick={() => onExportSelection?.('png2x')} title="Export Selection PNG (2x)">Sel</Button>
            <Button variant="secondary" onClick={onSaveVersion} title="Save Version">SV</Button>
            <Button variant="secondary" onClick={onRestoreVersion} title="Restore Latest">RL</Button>
        </div>
    )
}


