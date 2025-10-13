#!/usr/bin/env bash
set -euo pipefail

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit 1

PIDFILE="${TMPDIR:-/tmp}/commit-reminder.pid"
if [[ -f "$PIDFILE" ]]; then
  PID="$(cat "$PIDFILE")"
  if ps -p "$PID" >/dev/null 2>&1; then
    kill "$PID" || true
    sleep 0.2
  fi
  rm -f "$PIDFILE"
  echo "🛑 Reminder stopped."
else
  # Fallback: kill any strays
  pkill -f commit-reminder.sh 2>/dev/null || true
  echo "ℹ️ No active PID file. Ensured no stray reminders are running."
fi