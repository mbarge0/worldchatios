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
    fs.mkdirSync(latestDir, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const videoDirArchive = path.join(outDir, "videos");
    const videoDirLatest = path.join(latestDir, "videos");
    fs.mkdirSync(videoDirArchive, { recursive: true });
    fs.mkdirSync(videoDirLatest, { recursive: true });

    const context = await browser.newContext({
        recordVideo: { dir: videoDirArchive, size: { width: 1280, height: 720 } },
    });
    const page = await context.newPage();

    const results: Array<Record<string, any>> = [];

    const screenshotsDir = path.join(outDir, "screenshots");
    const latestShots = path.join(latestDir, "screenshots");
    const latestVids = videoDirLatest;
    fs.mkdirSync(screenshotsDir, { recursive: true });
    fs.mkdirSync(latestShots, { recursive: true });
    if (config.video) fs.mkdirSync(latestVids, { recursive: true });

    const startAll = Date.now();

    for (const route of hooks.routes) {
        const url = `${config.baseUrl}${route}`;
        console.log(`➡️ Navigating to ${url}`);

        try {
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
            const name = route.replace(/[/?=&]/g, "_").replace(/_+/g, "_").replace(/^_/, "");
            const screenshotPath = path.join(screenshotsDir, `${name}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            fs.copyFileSync(screenshotPath, path.join(latestShots, `${name}.png`));

            // Short video capture: let it run ~5s then save
            await page.waitForTimeout(5000);
            const v = await page.video();
            if (v) {
                const vPath = await v.path();
                const dest = path.join(latestVids, `${name}.webm`);
                fs.copyFileSync(vPath, dest);
                console.log(`🎥 Recorded 5s video for ${route}`);
            }

            results.push({ route, url, screenshot: screenshotPath, status: ready ? "success" : "partial" });
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