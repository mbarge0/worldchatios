import puppeteer from "puppeteer";

async function captureEvidence(url = "http://localhost:3000", outputDir = "./docs/operations/evidence/auto") {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Add brand viewport size
    await page.setViewport({ width: 1440, height: 900 });

    // Navigate to the app
    await page.goto(url, { waitUntil: "networkidle0" });

    // Capture landing screen
    await page.screenshot({ path: `${outputDir}/home.png` });

    await browser.close();
    console.log("✅ Evidence screenshots saved:", outputDir);
}

captureEvidence();