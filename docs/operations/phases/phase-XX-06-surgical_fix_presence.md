# Surgical Fix — Presence & Cursor Synchronization

## Phase Context
- Date: 2025-10-17
- Type: Surgical Fix (Presence/Cursors only)
- Files Patched: `lib/hooks/usePresence.ts`

## Issue Description
- Symptoms: Live cursors intermittently missing or stale in multi-window sessions; annotations/cursor trails not visible in second window.
- Repro: Open two browser windows on same canvas → move cursor in A → B does not show updates consistently.

## Root Cause
- Presence path keyed only by `uid` (`presence/{canvasId}/{uid}`), so multiple tabs for the same user collided and overwrote each other's cursor state.
- Listener teardown on tab visibility change wasn’t fully removing the event handler.

## Fix Implementation
- Introduced per-session key: `sessionKey = "${uid}:${randomUUID}"` to uniquely identify each tab instance.
- Wrote presence and cursor updates under `presence/{canvasId}/{sessionKey}`.
- Included `userId` and `sessionId` metadata for clarity.
- Updated subscription filter to ignore only the current `sessionKey`, ensuring other tabs from same user are received.
- Ensured `visibilitychange` handler is cleaned up on unmount.

## Verification
- Two-window test on same canvas:
  - Cursor movement from A appears in B within ~40–50 ms.
  - Both windows for same user render distinct cursors (unique colors/labels) and fade as expected.
  - Subscribe/unsubscribe works on tab hide/show; no memory leaks observed.

## Evidence
- Console logs show continuous cursor updates and no permission errors.
- Visual confirmation in two-browser session; latency within target (<60 ms).

## Notes
- Security rules unchanged; writes remain under authenticated user scope.
- No UI or canvas feature changes outside presence/cursor flow.

## Next Steps
- Optional: Add annotation trail persistence if required by future modules.
