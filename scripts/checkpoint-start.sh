#!/usr/bin/env bash
set -euo pipefail

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit 1

chmod +x ./scripts/commit-reminder.sh
echo "🔁 Starting checkpoint reminder (running in foreground)..."
echo "   Press Ctrl+C to stop."
./scripts/commit-reminder.sh