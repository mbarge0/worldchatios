/**
 * tools/visual-verification-core/src/verify_visual.ts
 *
 * Hybrid visual verification:
 * - Reopens routes from verification.json
 * - Checks readiness selectors and chat drawer visibility
 * - Performs optional lightweight pixel difference check
 * - Writes verification_summary.json
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { compareImages } from "./image_utils.js";
import type { VisualHooks } from "./interfaces.js";

const latestDir = path.resolve("docs/evidence/latest");
const manifestPath = path.join(latestDir, "verification.json");
const summaryPath = path.join(latestDir, "verification_summary.json");

(async () => {
    if (!fs.existsSync(manifestPath)) {
        console.error("❌ No verification.json found — run capture first.");
        process.exit(1);
    }

    const results = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const hooksModule: any = await import("../../../scripts/visual_hooks.js");
    const visualHooks: VisualHooks = hooksModule.default || hooksModule.visualHooks;

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const summary: Array<Record<string, any>> = [];

    for (const entry of results) {
        const { route, screenshot } = entry;
        console.log(`🧠 Verifying route ${route}...`);

        let canvasReady = false;
        let chatVisible = false;

        try {
            const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${route}`;
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

            // Check readiness selectors
            try {
                await Promise.race(
                    visualHooks.readinessSelectors.map(sel =>
                        page.waitForSelector(sel, { timeout: 8000 })
                    )
                );
                canvasReady = true;
            } catch {
                console.warn(`⚠️ Canvas readiness failed for ${route}`);
            }

            // Check chat drawer visibility (testid preferred; fallback aria-label)
            try {
                chatVisible = await page.locator('[data-testid="chat-drawer"], [aria-label*="chat" i]').isVisible();
            } catch { chatVisible = false }

            // Optional: Compare against baseline
            const baselinePath = path.join("docs/evidence/baseline", path.basename(screenshot));
            let visualDiff = null;
            if (fs.existsSync(baselinePath)) {
                visualDiff = await compareImages(screenshot, baselinePath);
            }

            const status = canvasReady && chatVisible ? "success" : "partial";

            summary.push({
                route,
                canvasReady,
                chatVisible,
                hasVideo: fs.existsSync(path.join(path.resolve("docs/evidence/latest/videos"), `${route.replace(/[/?=&]/g, "_").replace(/_+/g, "_").replace(/^_/, "")}.webm`)),
                status,
            });

            console.log(
                `✅ ${route} → ready:${canvasReady}, chat:${chatVisible}, diff:${visualDiff ?? "n/a"
                }`
            );
        } catch (err: any) {
            summary.push({
                route,
                error: err.message,
                status: "fail",
            });
            console.warn(`❌ Verification failed for ${route}: ${err.message}`);
        }
    }

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`\n📄 Verification summary written to ${summaryPath}`);

    await browser.close();
})();