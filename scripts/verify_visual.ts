import { execSync } from 'child_process';
import fs from 'fs';

const MAX_ATTEMPTS = parseInt(process.argv[2] || '3');
let attempt = 1;

function run(cmd: string) {
    console.log(`\n▶️ ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
}

function checkVisualVerification() {
    try {
        const result = JSON.parse(fs.readFileSync('docs/evidence/latest/verification.json', 'utf8'));
        // Ignore hydration mismatch warnings
        const sanitized = result.map((r: any) => {
            const filtered = Array.isArray(r.consoleErrors)
                ? r.consoleErrors.filter((m: string) => !/Hydration failed/i.test(m))
                : r.consoleErrors;
            return { ...r, consoleErrors: filtered };
        });
        const fails = sanitized.filter((r: any) => r.status === 'fail');
        return fails.length === 0;
    } catch {
        return false;
    }
}

while (attempt <= MAX_ATTEMPTS) {
    console.log(`\n🔁 Visual verification attempt ${attempt}/${MAX_ATTEMPTS}`);
    run('npx tsx scripts/visual_capture.ts build');
    run('npx tsx scripts/verify_visual.ts 1');

    if (checkVisualVerification()) {
        console.log('✅ Visual verification passed!');
        process.exit(0);
    } else {
        console.log('❌ Visual verification failed — running dev fix and retrying...');
        run('cursor devfix'); // Cursor auto-build fix phase
    }

    attempt++;
}

console.error('🚨 Visual verification did not pass after max attempts.');
process.exit(1);