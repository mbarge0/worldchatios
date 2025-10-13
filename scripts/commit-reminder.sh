#!/usr/bin/env bash
set -euo pipefail

# Config (can be overridden by env or .checkpointrc)
DEFAULT_INTERVAL=1200   # 20 minutes
DEFAULT_BRANCH_TAG="checkpoint"

PIDFILE="${TMPDIR:-/tmp}/commit-reminder.pid"
RC_FILE="./.checkpointrc"

# Load optional overrides from .checkpointrc (bash syntax: KEY=VALUE)
if [[ -f "$RC_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$RC_FILE"
fi

REMINDER_INTERVAL="${REMINDER_INTERVAL:-$DEFAULT_INTERVAL}"
BRANCH_TAG="${BRANCH_TAG:-$DEFAULT_BRANCH_TAG}"

# Ensure we're in a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repo. Exiting." >&2
  exit 1
fi

# Ensure only one instance
if [[ -f "$PIDFILE" ]] && ps -p "$(cat "$PIDFILE")" >/dev/null 2>&1; then
  echo "Reminder already running (PID $(cat "$PIDFILE"))."
  exit 0
fi

echo $$ > "$PIDFILE"
trap 'rm -f "$PIDFILE"' EXIT

echo "⏳ Checkpoint reminder active — ping every ${REMINDER_INTERVAL}s."

LOG_FILE="${TMPDIR:-/tmp}/checkpoint-reminder.log"

while true; do
  sleep "$REMINDER_INTERVAL"

  # Detect uncommitted changes
  if ! git diff --quiet || ! git diff --cached --quiet; then
    
    # Generate smart commit message based on changes
    CHANGED_FILES=$(git diff --name-only --cached 2>/dev/null || git diff --name-only)
    NUM_FILES=$(echo "$CHANGED_FILES" | wc -l | tr -d ' ')
    
    # Analyze changes and suggest message
    SUGGESTED_MSG=""
    
    if echo "$CHANGED_FILES" | grep -q "\.env"; then
      SUGGESTED_MSG="configure environment variables"
    elif echo "$CHANGED_FILES" | grep -q "schema\.sql"; then
      SUGGESTED_MSG="update database schema"
    elif echo "$CHANGED_FILES" | grep -q "supabase"; then
      SUGGESTED_MSG="implement Supabase client setup"
    elif echo "$CHANGED_FILES" | grep -q "config/env\.ts"; then
      SUGGESTED_MSG="add environment validation"
    elif echo "$CHANGED_FILES" | grep -q "auth"; then
      SUGGESTED_MSG="implement authentication"
    elif echo "$CHANGED_FILES" | grep -q "components/"; then
      COMPONENT=$(echo "$CHANGED_FILES" | grep "components/" | head -1 | sed 's|.*/||' | sed 's|\..*||')
      SUGGESTED_MSG="add ${COMPONENT} component"
    elif echo "$CHANGED_FILES" | grep -q "lib/hooks"; then
      HOOK=$(echo "$CHANGED_FILES" | grep "lib/hooks" | head -1 | sed 's|.*/||' | sed 's|\..*||')
      SUGGESTED_MSG="implement ${HOOK} hook"
    elif echo "$CHANGED_FILES" | grep -q "test\|spec"; then
      SUGGESTED_MSG="add tests"
    elif echo "$CHANGED_FILES" | grep -q "README\|docs/"; then
      SUGGESTED_MSG="update documentation"
    elif echo "$CHANGED_FILES" | grep -q "package\.json"; then
      SUGGESTED_MSG="update dependencies"
    else
      # Generic message based on file count
      if [ "$NUM_FILES" -eq 1 ]; then
        FILE_NAME=$(echo "$CHANGED_FILES" | head -1 | sed 's|.*/||')
        SUGGESTED_MSG="update ${FILE_NAME}"
      else
        SUGGESTED_MSG="update ${NUM_FILES} files"
      fi
    fi
    
    # Log the reminder
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⏰ Checkpoint reminder: ${NUM_FILES} files changed" >> "$LOG_FILE"
    echo "$CHANGED_FILES" | head -5 >> "$LOG_FILE"
    
    # Send macOS notification
    osascript -e "display notification \"${NUM_FILES} files changed. Suggested: ${SUGGESTED_MSG}\" with title \"⏰ Checkpoint Reminder\" sound name \"Glass\""
    
    # Create a temporary script for the user to run when they're ready
    CHECKPOINT_SCRIPT="${TMPDIR:-/tmp}/do-checkpoint.sh"
    cat > "$CHECKPOINT_SCRIPT" << EOF
#!/usr/bin/env bash
cd "$PWD" || exit 1

echo "⏰ Checkpoint Reminder"
echo "📝 Detected uncommitted changes:"
echo
echo "$CHANGED_FILES" | head -5 | sed 's/^/  - /'
if [ "$NUM_FILES" -gt 5 ]; then
  echo "  ... and $((NUM_FILES - 5)) more"
fi
echo
read -r -p "Create checkpoint? (yes/no) [yes]: " ans
ans="\${ans:-yes}"

if [[ "\$ans" =~ ^y(es)?$ ]]; then
  ts="\$(date '+%Y-%m-%d_%H%M')"
  echo
  read -r -p "Commit message (default: ${SUGGESTED_MSG}): " label
  label="\${label:-${SUGGESTED_MSG}}"
  
  git add -A
  git commit -m "\${label}"
  git tag -a "ckpt-\${ts}" -m "\${label}" 2>/dev/null || true
  
  echo "✅ Checkpoint recorded: \${label}"
  echo "🏷️  Tagged as: ckpt-\${ts}"
else
  echo "⏭️ Skipping checkpoint."
fi

rm -f "$CHECKPOINT_SCRIPT"
EOF
    chmod +x "$CHECKPOINT_SCRIPT"
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 💾 Run: ${CHECKPOINT_SCRIPT}" >> "$LOG_FILE"
  fi
done