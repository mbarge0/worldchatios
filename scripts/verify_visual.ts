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
        const fails = result.filter((r: any) => r.status === 'fail');
        return fails.length === 0;
    } catch {
        return false;
    }
}

while (attempt <= MAX_ATTEMPTS) {
    console.log(`\n🔁 Visual verification attempt ${attempt}/${MAX_ATTEMPTS}`);
    run('npx tsx scripts/visual_capture.ts build');

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