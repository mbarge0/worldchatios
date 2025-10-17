import puppeteer from "puppeteer";

async function captureEvidence(url = "http://localhost:3000", outputDir = "./docs/operations/evidence/auto") {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Add brand viewport size
    await page.setViewport({ width: 1440, height: 900 });

    // Navigate to the app
    await page.goto(url, { waitUntil: "networkidle0" });

    // Capture login screen
    await page.screenshot({ path: `${outputDir}/login.png` });

    // Go to canvas route
    await page.goto(`${url}/c/default`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: `${outputDir}/canvas.png` });

    await browser.close();
    console.log("✅ Evidence screenshots saved:", outputDir);
}

captureEvidence();