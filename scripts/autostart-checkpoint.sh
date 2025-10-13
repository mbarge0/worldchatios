#!/usr/bin/env bash
set -euo pipefail

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit 1

echo "⏳ Checkpoint reminder active — will ping every 20 min."
./scripts/commit-reminder.sh &
disown || true
