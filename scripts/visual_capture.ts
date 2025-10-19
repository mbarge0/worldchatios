// scripts/visual_capture.ts
/**
 * Focused Visual Capture
 * - Example capture for root route only (framework default)
 * - Attempts Firebase REST login if credentials provided; otherwise uses ?auto=dev fallback
 * - Robust readiness check for canvas (selectors) with a retry
 * - Writes only focused screenshots to /docs/evidence/latest/
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const phase = process.argv[2] || "build";
const outDir = path.resolve(
    `docs/evidence/archive/${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}_${phase}`
);
const latestDir = path.resolve("docs/evidence/latest");

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(latestDir, { recursive: true });

// Framework default: capture root route; downstream apps can customize
const routes = ["/"];

const EMAIL = process.env.VISUAL_CAPTURE_USER_EMAIL || "";
const PASS = process.env.VISUAL_CAPTURE_USER_PASS || "";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

// Try REST auth to get idToken (optional — will fall back to auto=dev)
async function getFirebaseIdToken(email: string, password: string): Promise<string | null> {
    if (!email || !password || !FIREBASE_API_KEY) return null;
    try {
        console.log("🔐 Attempting Firebase REST login...");
        const resp = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, returnSecureToken: true }),
            }
        );
        if (!resp.ok) {
            console.warn("⚠️ Firebase REST login failed:", resp.statusText);
            return null;
        }
        const j = await resp.json();
        return j.idToken ?? null;
    } catch (err: any) {
        console.warn("⚠️ Firebase REST login error:", err?.message || err);
        return null;
    }
}

(async () => {
    const token = await getFirebaseIdToken(EMAIL, PASS);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    if (token) {
        console.log("🧩 Injecting token into localStorage (idToken)...");
        // Use addInitScript so the token is present before scripts run
        await context.addInitScript((t: string) => {
            try {
                // adjust keys per your app's client auth storage if different
                localStorage.setItem("firebaseAuthToken", t);
                localStorage.setItem(
                    "firebase:authUser",
                    JSON.stringify({
                        apiKey: "",
                        appName: "[DEFAULT]",
                        stsTokenManager: { accessToken: t },
                    })
                );
            } catch (e) {
                // ignore
            }
        }, token);
    } else {
        console.log("⚙️ No token available — canvas routes will use ?auto=dev fallback.");
    }

    const results: Array<Record<string, any>> = [];

    // Single readiness check (max 10s)
    async function canvasReady(timeout = 10_000): Promise<boolean> {
        try {
            await page.waitForSelector('main', { timeout });
            return true;
        } catch {
            return false;
        }
    }

    for (let route of routes) {
        const name = route.replace(/[/?=&]/g, "_").replace(/_+/g, "_").replace(/^_/, "");
        const url = `${BASE_URL}${route}`;

        try {
            console.log(`➡️ Navigating to ${url}`);
            await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });

            let ready = await canvasReady(10_000);
            if (!ready) {
                await page.reload({ waitUntil: "networkidle", timeout: 60_000 }).catch(() => { });
                ready = await canvasReady(10_000);
            }

            // capture screenshot (fullPage to include header in evidence)
            const screenshotPath = path.join(outDir, `${name}.png`);
            // No chat drawer handling for framework default
            await page.screenshot({ path: screenshotPath, fullPage: true });
            // copy to latest, overwriting only the focused set
            fs.copyFileSync(screenshotPath, path.join(latestDir, `${name}.png`));

            results.push({ route, url, screenshot: screenshotPath, status: ready ? "success" : "partial" });
            console.log(`📸 Captured ${route}`);
        } catch (err: any) {
            results.push({ route, url, status: "fail", error: String(err?.message ?? err) });
        }
    }

    // Write verification.json to archive and latest
    const manifestPath = path.join(outDir, "verification.json");
    fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2));
    fs.copyFileSync(manifestPath, path.join(latestDir, "verification.json"));

    console.log("✅ Done — Evidence updated.");

    await browser.close();
})();