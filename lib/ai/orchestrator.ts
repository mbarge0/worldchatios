// Lightweight orchestration memory with idle expiry for multi-turn reasoning

export type ChatMessage = {
    role: 'system' | 'user' | 'assistant' | 'tool'
    content: string
    name?: string
}

type SessionKey = string // `${userId}:${canvasId}`

const TEN_MINUTES_MS = 10 * 60 * 1000

type MemoryEntry = {
    messages: ChatMessage[]
    lastActive: number
}

const memoryStore = new Map<SessionKey, MemoryEntry>()

function getKey(userId: string, canvasId: string): SessionKey {
    return `${userId}:${canvasId}`
}

export function getMemory(userId: string, canvasId: string): ChatMessage[] {
    const key = getKey(userId, canvasId)
    const entry = memoryStore.get(key)
    if (!entry) return []
    // Expire if idle > 10 minutes
    if (Date.now() - entry.lastActive > TEN_MINUTES_MS) {
        memoryStore.delete(key)
        return []
    }
    return entry.messages
}

export function setMemory(userId: string, canvasId: string, messages: ChatMessage[]): void {
    const key = getKey(userId, canvasId)
    memoryStore.set(key, {
        messages: clampMessages(messages),
        lastActive: Date.now(),
    })
}

export function appendToMemory(userId: string, canvasId: string, newMessages: ChatMessage[]): void {
    const key = getKey(userId, canvasId)
    const prev = getMemory(userId, canvasId)
    const next = clampMessages([...prev, ...newMessages])
    memoryStore.set(key, { messages: next, lastActive: Date.now() })
}

export function clearMemory(userId: string, canvasId: string): void {
    const key = getKey(userId, canvasId)
    memoryStore.delete(key)
}

function clampMessages(messages: ChatMessage[], max: number = 16): ChatMessage[] {
    // keep last N messages to bound context
    return messages.slice(-max)
}

export function withShortTermMemory(params: {
    userId: string
    canvasId: string
    messages: ChatMessage[]
}): ChatMessage[] {
    const prior = getMemory(params.userId, params.canvasId)
    return [...prior, ...params.messages]
}


