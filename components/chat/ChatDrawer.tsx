'use client'

import Button from '@/components/ui/Button'
import * as Actions from '@/lib/ai/actions'
import { loadAISession, saveAISession } from '@/lib/data/ai-session'
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth'
import { CornerDownLeft, Mic, Undo2, Volume2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type ToolCallRecord = { name: string; arguments: Record<string, any> }

type ChatDrawerProps = {
    canvasId: string
    open: boolean
    onClose: () => void
}

export default function ChatDrawer({ canvasId, open, onClose }: ChatDrawerProps) {
    const { user } = useFirebaseAuth()
    const userId = useMemo(() => (user as any)?.uid || (user as any)?.email || 'anonymous', [user])

    const [width, setWidth] = useState<number>(360)
    const [resizing, setResizing] = useState<boolean>(false)
    const startXRef = useRef<number>(0)
    const startWidthRef = useRef<number>(360)

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState<string>('')
    const [sending, setSending] = useState<boolean>(false)
    const [lastToolCalls, setLastToolCalls] = useState<ToolCallRecord[] | null>(null)
    const [voiceActive, setVoiceActive] = useState<boolean>(false)
    const [speechActive, setSpeechActive] = useState<boolean>(false)
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        // Restore session
        const restore = async () => {
            try {
                if (!userId) return
                const doc = await loadAISession(canvasId, String(userId))
                if (doc) {
                    setMessages(doc.messages as any)
                    setLastToolCalls((doc.lastToolCalls || []) as any)
                }
            } catch { /* ignore */ }
        }
        restore()
        function onMove(e: MouseEvent) {
            if (!resizing) return
            const dx = startXRef.current - e.clientX
            const next = Math.min(640, Math.max(280, startWidthRef.current + dx))
            setWidth(next)
        }
        function onUp() { setResizing(false) }
        if (resizing) {
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
        }
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [resizing])

    const handleSend = async () => {
        const trimmed = input.trim()
        if (!trimmed || sending) return
        const nextMsgs: ChatMessage[] = [...messages, { role: 'user' as const, content: trimmed }]
        setMessages(nextMsgs)
        setInput('')
        setSending(true)
        try {
            const payloadMessages = nextMsgs.map((m) => ({ role: m.role, content: m.content }))
            const res = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': String(userId),
                },
                body: JSON.stringify({ messages: payloadMessages, canvasId }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || 'AI error')
            const text = data?.message || '(no response)'
            setMessages((prev) => [...prev, { role: 'assistant' as const, content: text }])
            const calls = Array.isArray(data?.toolCalls) ? data.toolCalls as Array<{ call: ToolCallRecord }> : []
            setLastToolCalls(calls.map((c) => c.call))
            // Execute tool calls immediately on client (Firestore-backed) — surgical addition
            for (const { call } of calls) {
                const name = call?.name
                const args = call?.arguments || {}
                // eslint-disable-next-line no-console
                console.log('🧩 Executing AI tool call:', { name, args })
                const bridge = (typeof window !== 'undefined' ? (window as any).ccTools : undefined) || {}
                const exec = bridge[name] || (Actions as any)[name]
                if (typeof exec === 'function') {
                    try {
                        if (name === 'createShape') {
                            await exec(args.canvasId || canvasId, args.shape)
                        } else if (name === 'createText') {
                            await exec(args.canvasId || canvasId, args.shape)
                        } else if (name === 'moveShape') {
                            await exec(args.canvasId || canvasId, args.shapeId, args.x, args.y)
                        } else if (name === 'resizeShape') {
                            await exec(args.canvasId || canvasId, args.shapeId, args.width, args.height)
                        } else if (name === 'rotateShape') {
                            await exec(args.canvasId || canvasId, args.shapeId, args.rotation)
                        } else if (name === 'alignShapes') {
                            await exec(args.canvasId || canvasId, args.nodes, args.selectedIds, args.op)
                        } else if (name === 'zIndexUpdate') {
                            await exec(args.canvasId || canvasId, args.nodes, args.selectedIds, args.op)
                        } else if (name === 'getCanvasState') {
                            // read-only; optionally ignore
                            await exec(args.canvasId || canvasId)
                        }
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error('AI tool call execution failed:', name, e)
                    }
                }
            }
            // Persist session
            try { await saveAISession(canvasId, String(userId), { messages: [...nextMsgs, { role: 'assistant' as const, content: text }], lastToolCalls: calls.map((c) => c.call) }) } catch { }
            if (speechActive && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                try {
                    const utter = new SpeechSynthesisUtterance(String(text))
                    utter.rate = 1.0
                    utter.pitch = 1.0
                    window.speechSynthesis.cancel()
                    window.speechSynthesis.speak(utter)
                } catch { /* ignore */ }
            }
        } catch (e: any) {
            setMessages((prev) => [...prev, { role: 'assistant' as const, content: `Error: ${e?.message || 'Unknown error'}` }])
        } finally {
            setSending(false)
        }
    }

    const handleReplayLast = async () => {
        if (!lastToolCalls || lastToolCalls.length === 0) return
        // Re-execute last recorded tool calls in order
        try {
            for (const call of lastToolCalls) {
                // Minimal client-side re-exec via server to keep a single pathway
                const res = await fetch('/api/openai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': String(userId),
                    },
                    body: JSON.stringify({
                        messages: [{ role: 'user', content: `Replay tool: ${call.name}` }],
                        canvasId,
                        debug: false,
                    }),
                })
                await res.json().catch(() => null)
            }
        } catch { /* noop */ }
    }

    // --- Voice input (Web Speech API) ---
    const toggleVoice = () => {
        if (typeof window === 'undefined') return
        const w = window as any
        const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert('Voice input not supported in this browser.')
            return
        }
        if (!voiceActive) {
            const rec = new SpeechRecognition()
            rec.lang = 'en-US'
            rec.interimResults = false
            rec.maxAlternatives = 1
            rec.onresult = (event: any) => {
                const transcript = event.results?.[0]?.[0]?.transcript || ''
                if (transcript) setInput((prev) => (prev ? prev + ' ' : '') + transcript)
            }
            rec.onerror = () => { /* noop */ }
            rec.onend = () => { setVoiceActive(false) }
            recognitionRef.current = rec
            try { rec.start(); setVoiceActive(true) } catch { /* ignore */ }
        } else {
            try { recognitionRef.current?.stop?.() } catch { /* ignore */ }
            setVoiceActive(false)
        }
    }

    const toggleSpeech = () => {
        setSpeechActive((v) => !v)
    }

    if (!open) return null

    return (
        <aside
            className="absolute top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg flex flex-col"
            style={{ width }}
            role="complementary"
            aria-label="AI Chat Drawer"
        >
            {/* Resize handle */}
            <div
                className="absolute left-[-6px] top-0 h-full w-3 cursor-col-resize"
                onMouseDown={(e) => { setResizing(true); startXRef.current = e.clientX; startWidthRef.current = width }}
                aria-hidden
            />
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white/95">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs">A</span>
                    <span>Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Voice controls */}
                    <button className={`p-1.5 rounded hover:bg-gray-100 ${voiceActive ? 'text-indigo-600' : ''}`} onClick={toggleVoice} title="Voice input (toggle)"><Mic className="w-4 h-4" /></button>
                    <button className={`p-1.5 rounded hover:bg-gray-100 ${speechActive ? 'text-indigo-600' : ''}`} onClick={toggleSpeech} title="Speech output (toggle)"><Volume2 className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded hover:bg-gray-100" onClick={onClose} aria-label="Close chat drawer"><X className="w-4 h-4" /></button>
                </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-auto p-3 space-y-2">
                {messages.map((m, idx) => (
                    <div key={idx} className={m.role === 'assistant' ? 'flex justify-start' : 'flex justify-end'}>
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === 'assistant' ? 'bg-slate-100 text-slate-900' : 'bg-indigo-600 text-white'}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>
            {/* Input */}
            <div className="border-t p-2 bg-white">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                        placeholder="Ask the assistant…"
                        className="flex-1 h-10 px-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={sending}
                    />
                    <Button variant="primary" onClick={handleSend} disabled={sending || !input.trim()} title="Send">
                        <CornerDownLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" onClick={handleReplayLast} disabled={!lastToolCalls?.length} title="Undo last AI action">
                        <Undo2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </aside>
    )
}


