import { expect, test } from '@playwright/test'

test('app boots', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/Create Next App|CollabCanvas/i)
})


