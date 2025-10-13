#!/usr/bin/env bash
set -euo pipefail

# Ensure we're in the project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

source ./scripts/utils/timestamp.sh
source ./scripts/utils/log_entry.sh

ACTION=$1
NAME=$2

case $ACTION in
  create)
    if [ -z "$NAME" ]; then
      echo "Enter checkpoint name:"
      read NAME
    fi
    TIMESTAMP=$(generate_timestamp)
    git add .
    git commit -m "checkpoint: $NAME"
    git tag "checkpoint-$NAME-$TIMESTAMP"
    log_entry "$NAME" "$TIMESTAMP"
    echo "✅ Checkpoint created: $NAME ($TIMESTAMP)"
    ;;
  list)
    git tag --list | grep checkpoint-
    ;;
  revert)
    git checkout "tags/checkpoint-$NAME" -b "restore-$NAME"
    echo "🔄 Reverted to checkpoint: $NAME"
    ;;
  *)
    echo "Usage: ./scripts/checkpoint.sh {create|list|revert} [name]"
    ;;
esac
