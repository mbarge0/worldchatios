#!/usr/bin/env bash
set -euo pipefail

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit 1

PIDFILE="${TMPDIR:-/tmp}/commit-reminder.pid"
if [[ -f "$PIDFILE" ]] && ps -p "$(cat "$PIDFILE")" >/dev/null 2>&1; then
  echo "✅ Reminder running (PID $(cat "$PIDFILE"))."
else
  echo "❌ Reminder not running."
fi