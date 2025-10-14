'use client'

import Modal from '@/components/ui/Modal'
import { useEffect, useState } from 'react'

type TextEditModalProps = {
    isOpen: boolean
    initialText: string
    onClose: () => void
    onSave: (text: string) => void
}

export default function TextEditModal({ isOpen, initialText, onClose, onSave }: TextEditModalProps) {
    const [text, setText] = useState(initialText)
    useEffect(() => {
        if (isOpen) setText(initialText)
    }, [isOpen, initialText])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(text)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Text">
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-32 border border-gray-300 rounded p-2"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-3 py-1 rounded border border-gray-300">Cancel</button>
                    <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white">Save</button>
                </div>
            </form>
        </Modal>
    )
}


