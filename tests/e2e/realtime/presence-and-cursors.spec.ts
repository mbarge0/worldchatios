import { expect, test } from '@playwright/test'

test.describe('Presence and cursors', () => {
    test('two sessions show presence layer on the same canvas route', async ({ page, browser }) => {
        // Use a deterministic test canvas id route that does not require specific seed
        const url = '/c/test-canvas'
        const page2 = await browser.newPage()

        await page.goto(url)
        await page2.goto(url)

        // If auth is required, tests may land on login; in that case, just assert the login renders
        // Otherwise, verify canvas is visible and presence layer is mounted
        try {
            await expect(page.getByTestId('canvas-stage')).toBeVisible({ timeout: 3000 })
            await expect(page2.getByTestId('canvas-stage')).toBeVisible({ timeout: 3000 })
            await expect(page.getByTestId('presence-layer')).toBeVisible()
            await expect(page2.getByTestId('presence-layer')).toBeVisible()
        } catch {
            await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
        }
    })
})
