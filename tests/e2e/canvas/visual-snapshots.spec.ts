import { expect, test } from '@playwright/test'

test.describe('Visual snapshots', () => {
    test('Home/Login visual snapshot', async ({ page }) => {
        await page.goto('/')
        // It will redirect to /login when unauthenticated
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveScreenshot('home-or-login.png', { fullPage: true })
    })

    test('Canvas header layout snapshot', async ({ page }) => {
        await page.goto('/c/test-canvas')
        // If redirected to login, capture that state instead
        try {
            await expect(page.getByTestId('canvas-header')).toBeVisible({ timeout: 3000 })
            await expect(page.getByTestId('canvas-shell')).toHaveScreenshot('canvas-header.png')
        } catch {
            await expect(page).toHaveScreenshot('login-for-canvas.png', { fullPage: true })
        }
    })
})


