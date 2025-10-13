import { expect, test } from '@playwright/test'

test.describe('Canvas basic rendering', () => {
    test('renders canvas stage or redirects to login', async ({ page }) => {
        await page.goto('/c/test-canvas')
        try {
            await expect(page.getByTestId('canvas-shell')).toBeVisible({ timeout: 3000 })
            await expect(page.getByTestId('canvas-stage-wrapper')).toBeVisible()
        } catch {
            await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
        }
    })
})


