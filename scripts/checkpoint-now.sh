#!/usr/bin/env bash
set -euo pipefail

# Quick checkpoint script that can be run anytime
# This checks if there's a generated checkpoint script, or creates one on the fly

CHECKPOINT_SCRIPT="${TMPDIR:-/tmp}/do-checkpoint.sh"

if [[ -f "$CHECKPOINT_SCRIPT" ]]; then
  # Run the auto-generated checkpoint script
  "$CHECKPOINT_SCRIPT"
else
  # Create a checkpoint manually if no reminder script exists
  cd "$(dirname "$0")/.." || exit 1
  
  # Check for changes
  if git diff --quiet && git diff --cached --quiet; then
    echo "✅ No uncommitted changes detected."
    exit 0
  fi
  
  echo "⏰ Manual Checkpoint"
  echo "📝 Uncommitted changes detected:"
  echo
  git status --short | head -10
  echo
  
  read -r -p "Create checkpoint? (yes/no) [yes]: " ans
  ans="${ans:-yes}"
  
  if [[ "$ans" =~ ^y(es)?$ ]]; then
    ts="$(date '+%Y-%m-%d_%H%M')"
    echo
    read -r -p "Commit message: " label
    
    if [[ -z "$label" ]]; then
      echo "❌ Commit message required."
      exit 1
    fi
    
    git add -A
    git commit -m "${label}"
    git tag -a "ckpt-${ts}" -m "${label}" 2>/dev/null || true
    
    echo "✅ Checkpoint recorded: ${label}"
    echo "🏷️  Tagged as: ckpt-${ts}"
  else
    echo "⏭️ Skipping checkpoint."
  fi
fi

