import { expect, test } from '@playwright/test'

test.describe.skip('Shapes realtime sync', () => {
    test('move shape reflects on second client', async ({ page, browser }) => {
        const url = '/c/demo-canvas'
        const page2 = await browser.newPage()

        await page.goto(url)
        await page2.goto(url)

        await expect(page.getByTestId('canvas-stage')).toBeVisible()
        await expect(page2.getByTestId('canvas-stage')).toBeVisible()

        // This is a placeholder; full drag would require auth + seeded data
        await expect(page.getByTestId('canvas-base-layer')).toBeVisible()
        await expect(page2.getByTestId('canvas-base-layer')).toBeVisible()
    })
})
