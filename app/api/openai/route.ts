import { aiConfig } from '@/config/ai'
import { env } from '@/config/env'
import * as Tools from '@/lib/ai/actions'
import { appendToMemory, withShortTermMemory, type ChatMessage } from '@/lib/ai/orchestrator'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Simple in-memory per-user rate limiter (3 QPS)
const TOKENS_PER_SECOND = 3
const userBuckets = new Map<string, { tokens: number; lastRefill: number }>()

function allowRequest(userKey: string): boolean {
    const now = Date.now()
    let bucket = userBuckets.get(userKey)
    if (!bucket) {
        bucket = { tokens: TOKENS_PER_SECOND, lastRefill: now }
        userBuckets.set(userKey, bucket)
    }
    const elapsed = (now - bucket.lastRefill) / 1000
    const refill = Math.floor(elapsed * TOKENS_PER_SECOND)
    if (refill > 0) {
        bucket.tokens = Math.min(TOKENS_PER_SECOND, bucket.tokens + refill)
        bucket.lastRefill = now
    }
    if (bucket.tokens > 0) {
        bucket.tokens -= 1
        return true
    }
    return false
}

const openai = new OpenAI({ apiKey: aiConfig.openai.apiKey })

type ToolCall = {
    name: string
    arguments: Record<string, any>
}

const registeredTools = {
    createShape: Tools.createShape,
    createText: Tools.createText,
    moveShape: Tools.moveShape,
    resizeShape: Tools.resizeShape,
    rotateShape: Tools.rotateShape,
    alignShapes: Tools.alignShapes,
    zIndexUpdate: Tools.zIndexUpdate,
    getCanvasState: Tools.getCanvasState,
} as const

export async function POST(req: NextRequest) {
    if (!env.OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
    }

    const userId = (req.headers.get('x-user-id') || 'anonymous').slice(0, 64)
    if (!allowRequest(userId)) {
        return NextResponse.json({ error: 'Rate limit exceeded (3 QPS per user)' }, { status: 429 })
    }

    let body: any
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { messages, canvasId, debug } = body || {}
    if (!Array.isArray(messages) || !canvasId) {
        return NextResponse.json({ error: 'Missing messages or canvasId' }, { status: 400 })
    }

    try {
        const composedMessages = withShortTermMemory({
            userId,
            canvasId,
            messages: messages as ChatMessage[],
        })
        const completion = await openai.chat.completions.create({
            model: aiConfig.openai.model,
            messages: composedMessages as any,
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'createShape',
                        description: 'Create a new shape on the canvas',
                        parameters: {
                            type: 'object',
                            properties: {
                                canvasId: { type: 'string' },
                                shape: { type: 'object' },
                            },
                            required: ['canvasId', 'shape'],
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        name: 'createText',
                        description: 'Create a text object on the canvas',
                        parameters: {
                            type: 'object',
                            properties: {
                                canvasId: { type: 'string' },
                                shape: { type: 'object' },
                            },
                            required: ['canvasId', 'shape'],
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        name: 'moveShape',
                        parameters: {
                            type: 'object',
                            properties: {
                                canvasId: { type: 'string' },
                                shapeId: { type: 'string' },
                                x: { type: 'number' },
                                y: { type: 'number' },
                            },
                            required: ['canvasId', 'shapeId', 'x', 'y'],
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        name: 'resizeShape',
                        parameters: {
                            type: 'object',
                            properties: {
                                canvasId: { type: 'string' },
                                shapeId: { type: 'string' },
                                width: { type: 'number' },
                                height: { type: 'number' },
                            },
                            required: ['canvasId', 'shapeId', 'width', 'height'],
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        name: 'rotateShape',
                        parameters: {
                            type: 'object',
                            properties: {
                                canvasId: { type: 'string' },
                                shapeId: { type: 'string' },
                                rotation: { type: 'number' },
                            },
                            required: ['canvasId', 'shapeId', 'rotation'],
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        name: 'getCanvasState',
                        description: 'Return current shapes for the given canvas',
                        parameters: {
                            type: 'object',
                            properties: { canvasId: { type: 'string' } },
                            required: ['canvasId'],
                        },
                    },
                },
            ],
            tool_choice: 'auto',
            temperature: 0.2,
        })

        const message = completion.choices?.[0]?.message
        const toolCalls = (message?.tool_calls || []) as any[]
        const results: Array<{ call: ToolCall; result: unknown }> = []

        for (const call of toolCalls) {
            const name = call.function?.name as keyof typeof registeredTools
            const argsRaw = call.function?.arguments
            let args: Record<string, any> = {}
            try { args = JSON.parse(argsRaw || '{}') } catch { }
            // Inject canvasId default from request body if missing
            if (!args.canvasId) args.canvasId = canvasId
            const fn = registeredTools[name]
            if (typeof fn === 'function') {
                // Execute tool
                const result = await (fn as any)(...Object.values(args))
                results.push({ call: { name, arguments: args }, result })
            }
        }

        // Update short-term memory
        const memoryAppend: ChatMessage[] = []
        for (const m of messages as ChatMessage[]) memoryAppend.push(m)
        if (message?.content) memoryAppend.push({ role: 'assistant', content: message.content })
        appendToMemory(userId, canvasId, memoryAppend)

        if (debug && process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log('[AI DEBUG]', {
                userId,
                canvasId,
                composedMessagesLength: composedMessages.length,
                toolCalls: results.map((r) => r.call),
            })
        }

        let text = (message?.content || '').trim()
        if (!text) {
            // eslint-disable-next-line no-console
            console.warn('⚠️ No assistant text returned by model; deriving summary from tool calls')
            if (results.length > 0) {
                const verbs: Record<string, string> = {
                    createShape: 'created a shape',
                    createText: 'created a text node',
                    moveShape: 'moved a shape',
                    resizeShape: 'resized a shape',
                    rotateShape: 'rotated a shape',
                    alignShapes: 'aligned shapes',
                    zIndexUpdate: 'updated z-index',
                    getCanvasState: 'retrieved canvas state',
                }
                const actions = Array.from(new Set(results.map(r => verbs[r.call.name] || r.call.name)))
                text = actions.length ? `I've ${actions.join(', ')}.` : ''
            }
        }
        // eslint-disable-next-line no-console
        console.log(`\u{1F4AC} AI replied: ${text}`)
        return NextResponse.json({
            status: 'ok',
            message: text,
            toolCalls: results,
            model: completion.model,
            usage: completion.usage || null,
        })
    } catch (e: any) {
        const msg = e?.message || 'Unknown error'
        return NextResponse.json({ status: 'error', error: msg }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'OpenAI proxy route reachable',
    })
}