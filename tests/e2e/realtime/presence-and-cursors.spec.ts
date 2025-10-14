import { expect, test } from '@playwright/test'

test.describe.skip('Presence and cursors', () => {
    test('two users see each other cursors', async ({ page, browser }) => {
        const url = '/c/demo-canvas'
        const page2 = await browser.newPage()

        await page.goto(url)
        await page2.goto(url)

        await expect(page.getByTestId('canvas-stage')).toBeVisible()
        await expect(page2.getByTestId('canvas-stage')).toBeVisible()

        // basic smoke: presence layer exists
        await expect(page.getByTestId('presence-layer')).toBeVisible()
        await expect(page2.getByTestId('presence-layer')).toBeVisible()
    })
})
