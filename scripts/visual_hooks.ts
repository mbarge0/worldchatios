import type { Page } from "playwright";

// Project hooks for Foundry Core v2 (example defaults)
export const visualHooks = {
    routes: ["/"],
    // Example readiness selectors (customize per downstream app)
    readinessSelectors: [
        "main",
    ],
    async ensureChatOpen(page: Page): Promise<boolean> {
        // No-op placeholder for downstream apps
        return false;
    },
};

export default visualHooks;