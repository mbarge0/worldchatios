# Visual Evidence System

This folder contains automatically captured visual evidence from build and fix phases.

- `/latest/` → always holds the most recent successful verification run.
- `/archive/` → keeps timestamped historical captures by phase.
- Each run includes:
  - Screenshots (`.png`)
  - Optional video (`.webm`)
  - JSON summary (`verification.json`)

# Usage
Run: bash
npm run verify:visual

This will:
	1.	Capture screenshots of key app pages.
	2.	Check for visual success.
	3.	If verification fails, re-enter build (via cursor devfix) and repeat until visuals match.

Test the System

1. Make sure your app is running locally:
   ```bash
   npm run dev
2.	In another terminal, run:
	npm run verify:visual
3.	You’ll see:
	•	Playwright launching headless Chrome
	•	Screenshots being captured
	•	Logs under /docs/evidence/latest/
	•	If any fail, it’ll automatically re-enter the dev fix loop.
4.	You can inspect results:
open docs/evidence/latest/