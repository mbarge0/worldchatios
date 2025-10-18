import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const phase = process.argv[2] || 'build'; // 'build', 'debug', or 'fix'
const outDir = path.resolve(`docs/evidence/archive/${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}_${phase}`);
const latestDir = path.resolve('docs/evidence/latest');

// ensure directories exist
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(latestDir, { recursive: true });

const urls = [
    '/',
    '/c/test-canvas',
    '/c/default?auto=dev',
];

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const results: any[] = [];

    for (const url of urls) {
        const name = url.replace(/[/?=&]/g, '_').replace(/_+/g, '_').replace(/^_/, '');
        try {
            const fullUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' + url;
            await page.goto(fullUrl);
            await page.waitForLoadState('networkidle', { timeout: 10000 });

            const screenshotPath = path.join(outDir, `${name}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            fs.copyFileSync(screenshotPath, path.join(latestDir, `${name}.png`));

            // optional 5s video
            const videoPath = path.join(outDir, `${name}.webm`);
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(500);
            await page.video()?.path();
            results.push({ url, screenshot: screenshotPath, status: 'success' });
        } catch (err: any) {
            results.push({ url, status: 'fail', error: err.message });
        }
    }

    fs.writeFileSync(path.join(outDir, 'verification.json'), JSON.stringify(results, null, 2));
    fs.copyFileSync(path.join(outDir, 'verification.json'), path.join(latestDir, 'verification.json'));

    console.log(`✅ Visual capture complete for phase: ${phase}`);
    console.log(`📁 Saved to: ${outDir}`);

    await browser.close();
})();