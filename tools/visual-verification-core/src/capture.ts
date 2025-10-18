/**
 * tools/visual-verification-core/src/capture.ts
 *
 * Unified visual evidence capture script for ESM environments.
 * Works with project-level hooks (scripts/visual_hooks.ts)
 * to take targeted screenshots of key routes.
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import type { VisualConfig, VisualHooks } from "./interfaces.js";

/**
 * Main capture function (called by auto-run block below)
 */
export async function captureVisuals(config: VisualConfig, hooks: VisualHooks) {
    const phase = process.argv[2] || "build";
    const outDir =
        config.outputDir ||
        path.resolve(`docs/evidence/archive/${new Date().toISOString().replace(/[:T]/g, "-")}_${phase}`);
    const latestDir = config.latestDir || path.resolve("docs/evidence/latest");

    fs.mkdirSync(outDir, { recursive: true });
    // Clean latest folder to keep only newest evidence
    fs.mkdirSync(latestDir, { recursive: true });
    try {
        for (const entry of fs.readdirSync(latestDir)) {
            const p = path.join(latestDir, entry);
            try { fs.rmSync(p, { recursive: true, force: true }); } catch { }
        }
    } catch { }

    const browser = await chromium.launch({ headless: true });
    const videoDirArchive = path.join(outDir, "videos");
    const videoDirLatest = path.join(latestDir, "videos");
    fs.mkdirSync(videoDirArchive, { recursive: true });
    fs.mkdirSync(videoDirLatest, { recursive: true });

    const context = await browser.newContext({
        recordVideo: { dir: videoDirArchive, size: { width: 1280, height: 720 } },
    });
    // page will be created per-route to ensure recordVideo flush

    const results: Array<Record<string, any>> = [];

    const screenshotsDir = path.join(outDir, "screenshots");
    const latestShots = path.join(latestDir, "screenshots");
    const latestVids = videoDirLatest;
    fs.mkdirSync(screenshotsDir, { recursive: true });
    fs.mkdirSync(latestShots, { recursive: true });
    if (config.video) fs.mkdirSync(latestVids, { recursive: true });

    const startAll = Date.now();

    function deriveName(url: string, routePath: string): string {
        if (url.includes('/login')) return 'login_screen';
        if (url.includes('/c/')) return 'canvas_app';
        const slug = routePath.replace(/[/?=&]/g, '_').replace(/_+/g, '_').replace(/^_/, '');
        return slug || 'route_custom';
    }

    for (const route of hooks.routes) {
        const url = `${config.baseUrl}${route}`;
        const name = deriveName(url, route);
        if (name === 'login_screen') console.log('🔐 Capturing Login Screen...');
        else if (name === 'canvas_app') console.log('🎨 Capturing Canvas Application...');
        else console.log(`➡️ Navigating to ${url}`);

        try {
            const page = await context.newPage();
            const consoleLogs: string[] = [];
            page.on('console', (msg) => consoleLogs.push(msg.text()));
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: config.timeouts?.goto ?? 20000 });

            // Wait for readiness
            let ready = false;
            try {
                await Promise.race(
                    hooks.readinessSelectors.map(sel =>
                        page.waitForSelector(sel, { timeout: config.timeouts?.ready ?? 8000 })
                    )
                );
                ready = true;
            } catch {
                console.warn(`⚠️ Canvas readiness timed out for ${route}`);
            }

            // Ensure chat/auth drawer open (project-specific)
            if (hooks.ensureChatOpen) {
                console.log("💬 Running ensureChatOpen()...");
                await hooks.ensureChatOpen(page);
            }

            // Screenshot
            const screenshotPath = path.join(screenshotsDir, `${name}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            fs.copyFileSync(screenshotPath, path.join(latestShots, `${name}.png`));

            // Short video capture: let it run ~5s then save
            await page.waitForTimeout(5000);
            const v = await page.video();
            const vPathPre = v ? await v.path() : undefined;
            // --- Behavioral checks ---
            let canvasReady = false;
            let chatVisible = false;
            let loginSucceeded: boolean | undefined = undefined;
            let shapeCreated: boolean | undefined = undefined;
            let chatResponded: boolean | undefined = undefined;
            let chatLatencyMs: number | undefined = undefined;

            try {
                // Basic readiness checks
                if (url.includes('/login')) {
                    // Wait for any input; try to simulate basic auth flow
                    try {
                        await page.waitForSelector('input', { timeout: 8000 });
                        const inputs = page.locator('input');
                        const count = await inputs.count().catch(() => 0);
                        if (count > 0) {
                            await inputs.first().fill('dev@example.com').catch(() => { });
                        }
                        // Detect redirected canvas or Sign out button
                        const redirected = await page.waitForSelector("[data-testid='canvas-shell']", { timeout: 2000 }).then(() => true).catch(() => false);
                        const signout = await page.locator('button:has-text("Sign out")').isVisible().catch(() => false);
                        loginSucceeded = redirected || signout;
                    } catch { loginSucceeded = false }
                }

                if (url.includes('/c/')) {
                    // Canvas ready
                    canvasReady = await page.waitForSelector('.konvajs-content', { timeout: 8000 }).then(() => true).catch(() => false);
                    // Click Rectangle if available
                    const rectBtn = page.locator('button[title*="Rectangle" i]');
                    if (await rectBtn.count()) {
                        await rectBtn.first().click().catch(() => { });
                        // Heuristic: rely on bridge logs for shape creation
                        const startShape = Date.now();
                        for (; ;) {
                            if (consoleLogs.some(t => t.includes('✅ Added square to canvas store') || t.includes('✅ Square rendered to canvas'))) { shapeCreated = true; break; }
                            if (Date.now() - startShape > 3000) { shapeCreated = false; break; }
                            await page.waitForTimeout(150);
                        }
                    } else {
                        shapeCreated = false;
                    }

                    // Chat: ensure input, send message and measure latency
                    chatVisible = await page.locator('[data-testid="chat-drawer"], [aria-label*="AI Chat Drawer" i]').isVisible().catch(() => false);
                    const chatInput = page.locator('input[placeholder="Ask the assistant…"]');
                    if (await chatInput.count()) {
                        await chatInput.fill('create a square at (100,100)').catch(() => { });
                        const t0 = Date.now();
                        await chatInput.press('Enter').catch(() => { });
                        try {
                            await page.locator('text=/created .* (square|shape)/i').first().waitFor({ timeout: 8000 });
                            chatResponded = true;
                            chatLatencyMs = Date.now() - t0;
                        } catch {
                            chatResponded = false;
                        }
                    }
                }
            } catch { }

            await page.close();
            await new Promise((r) => setTimeout(r, 500));
            if (vPathPre && fs.existsSync(vPathPre)) {
                try {
                    const stat = fs.statSync(vPathPre);
                    if (stat.size > 10 * 1024) {
                        const dest = path.join(latestVids, `${name}.webm`);
                        fs.copyFileSync(vPathPre, dest);
                        console.log(`🎥 Recorded 5s video for ${route}`);
                    } else {
                        console.warn(`⚠️ Incomplete video for ${name} (skipping copy).`);
                    }
                } catch { }
            }

            // Determine hasVideo from latest copy
            const hasVideo = fs.existsSync(path.join(latestVids, `${name}.webm`)) && ((): boolean => { try { return fs.statSync(path.join(latestVids, `${name}.webm`)).size > 10 * 1024 } catch { return false } })();

            results.push({ route, url, name, screenshot: path.join(latestShots, `${name}.png`), canvasReady: !!canvasReady, chatVisible: !!chatVisible, loginSucceeded, shapeCreated, chatResponded, chatLatencyMs, hasVideo, status: ready ? "success" : "partial" });
            console.log(`📸 Captured ${route} (${ready ? "ready" : "partial"})`);
        } catch (err: any) {
            results.push({ route, url, status: "fail", error: err.message });
            console.warn(`❌ Failed to capture ${route}: ${err.message}`);
        }
    }

    const manifest = path.join(outDir, "verification.json");
    fs.writeFileSync(manifest, JSON.stringify(results, null, 2));
    fs.copyFileSync(manifest, path.join(latestDir, "verification.json"));

    console.log(`✅ Done — Evidence saved to ${latestDir} (runtime ${Math.round((Date.now() - startAll) / 1000)}s)`);
    await browser.close();
}

/**
 * ------------------------------------------------------------
 * 🧠 Auto-run if executed directly via `npm run capture:visual`
 * ------------------------------------------------------------
 * Compatible with ESM (no require.main)
 */
const isDirectRun = import.meta.url === `file://${process.argv[1]}`;

if (isDirectRun) {
    (async () => {
        try {
            console.log("🧠 Running visual capture via project hooks...");

            // Dynamically import project-specific hooks
            const hooksModule: any = await import("../../../scripts/visual_hooks.js");

            // ✅ Fix: Explicitly resolve hook export safely
            const visualHooks: VisualHooks =
                (hooksModule.default as VisualHooks) ||
                (hooksModule.visualHooks as VisualHooks) ||
                (() => {
                    throw new Error("No valid export found in scripts/visual_hooks.js");
                })();

            const config: VisualConfig = {
                baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                outputDir: undefined, // default /docs/evidence/archive
                latestDir: undefined, // default /docs/evidence/latest
                timeouts: { goto: 20000, ready: 8000 },
            };

            await captureVisuals(config, visualHooks);
            console.log("✅ Visual capture run complete.");
        } catch (err: any) {
            console.error("❌ Visual capture failed:", err);
            process.exit(1);
        }
    })();
}