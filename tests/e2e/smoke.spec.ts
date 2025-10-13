import { expect, test } from '@playwright/test'

test('app boots', async ({ page }) => {
    await page.goto(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('body')).toBeVisible()
})


