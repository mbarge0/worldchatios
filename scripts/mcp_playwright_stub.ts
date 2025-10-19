/*
 Minimal Playwright MCP replacement
 - Launches Chromium headless
 - Navigates to provided URL (default: http://localhost:3000/)
 - Waits for network idle (best-effort)
 - Captures console errors
 - Checks canvas and chat drawer readiness via selectors
 - Outputs structured JSON
*/

import { chromium } from 'playwright'

type Result = {
    route: string
    canvasReady: boolean
    chatVisible: boolean
    consoleErrors: string[]
}

async function safeWaitFor(page: any, selector: string, timeoutMs: number): Promise<boolean> {
    try {
        await page.waitForSelector(selector, { timeout: timeoutMs, state: 'attached' })
        return true
    } catch {
        return false
    }
}

async function main() {
    const route = process.argv[2] || 'http://localhost:3000/'
    const consoleErrors: string[] = []
    let browser: any
    let page: any

    try {
        browser = await chromium.launch({ headless: true })
        const context = await browser.newContext()
        page = await context.newPage()

        page.on('console', (msg: any) => {
            if (msg.type?.() === 'error') consoleErrors.push(String(msg.text?.()))
        })
        page.on('pageerror', (err: any) => {
            consoleErrors.push(String(err?.message || err))
        })

        try {
            await page.goto(route, { waitUntil: 'networkidle', timeout: 15000 })
        } catch {
            // tolerate navigation timeout; continue with best-effort checks
        }

        // Canvas readiness: require both shell and konva content to exist
        const shellOk = await safeWaitFor(page, "[data-testid='canvas-shell']", 3000)
        const konvaOk = await safeWaitFor(page, '.konvajs-content', 3000)
        const canvasReady = !!(shellOk && konvaOk)

        // Chat visibility: either specific testid or any element with aria-label containing 'chat'
        const chatTestIdOk = await safeWaitFor(page, "[data-testid='chat-drawer']", 1000)
        const chatAriaOk = await safeWaitFor(page, "[aria-label*='chat' i]", 1000)
        const chatVisible = !!(chatTestIdOk || chatAriaOk)

        const result: Result = {
            route,
            canvasReady,
            chatVisible,
            consoleErrors,
        }
        process.stdout.write(JSON.stringify(result) + '\n')
    } catch (e: any) {
        const fallback: Result = {
            route,
            canvasReady: false,
            chatVisible: false,
            consoleErrors: [String(e?.message || e)],
        }
        process.stdout.write(JSON.stringify(fallback) + '\n')
    } finally {
        try { await page?.close?.() } catch { }
        try { await browser?.close?.() } catch { }
    }
}

main()


