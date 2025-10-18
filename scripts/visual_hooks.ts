import type { Page } from "playwright";

// Project-specific hooks for CollabCanvas
export const visualHooks = {
    routes: ["/c/test-canvas?auto=dev", "/c/default?auto=dev"],
    // Match actual DOM in our app/c/[canvasId]/page.tsx and ChatDrawer
    readinessSelectors: [
        "[data-testid='canvas-shell']",
        "[data-testid='canvas-stage-wrapper']",
        "[role='toolbar']",
        ".konvajs-content",
    ],
    async ensureChatOpen(page: Page): Promise<boolean> {
        console.log("💬 Ensuring chat drawer is open...");
        // 1) Try test hook if exposed
        try {
            await page.evaluate(() => (window as any).__ccToggleChat?.());
        } catch { /* ignore */ }

        // 2) If drawer not visible, try clicking toggle by various selectors
        const drawerVisible = await page.locator('[data-testid="chat-drawer"], [aria-label*="AI Chat Drawer" i]').isVisible().catch(() => false);
        if (!drawerVisible) {
            // Prefer title attribute used in Toolbar
            const toggle = page.locator('[title*="Toggle Chat" i], [data-testid="chat-toggle"], button:has-text("Chat"), [aria-label*="chat" i]');
            if (await toggle.count()) {
                await toggle.first().click().catch(() => { });
                await page.waitForTimeout(1500);
            }
            // Force display if still not visible
            try {
                await page.evaluate(() => {
                    const a = document.querySelector('[data-testid="chat-drawer"]') as HTMLElement | null;
                    const b = document.querySelector('[aria-label="AI Chat Drawer"]') as HTMLElement | null;
                    if (a) a.style.display = 'block';
                    if (b) b.style.display = 'block';
                });
            } catch { }
            // Try synthetic click on assistant-specific toggles
            const synthetic = page.locator('[data-testid="assistant-toggle"], [aria-expanded="false"][aria-controls*="chat"]');
            if (await synthetic.count()) {
                await synthetic.first().click().catch(() => { });
            }
            await page.waitForTimeout(2000);
        }
        // 3) Final wait for visibility (do not fail if absent)
        try { await page.waitForSelector('[data-testid="chat-drawer"], [aria-label*="AI Chat Drawer" i]', { timeout: 1500 }); } catch { }
        const visibleNow = await page.locator('[data-testid="chat-drawer"], [aria-label*="AI Chat Drawer" i]').isVisible().catch(() => false);
        if (visibleNow) console.log('✅ Chat drawer forced open.');
        return !!visibleNow;
    },
};

export default visualHooks;