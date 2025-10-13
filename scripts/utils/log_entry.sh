#!/bin/bash
log_entry() {
  local NAME=$1
  local TIMESTAMP=$2
  echo "✅ [$TIMESTAMP] Checkpoint created: $NAME" >> ./docs/log.md
  echo "Tag: checkpoint-$NAME-$TIMESTAMP" >> ./docs/log.md
}
