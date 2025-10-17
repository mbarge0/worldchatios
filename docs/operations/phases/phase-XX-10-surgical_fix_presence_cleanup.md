# Surgical Fix — Presence Cleanup (RTDB)

## Phase Context
- Date: 2025-10-17
- Type: Surgical Fix (Presence/Cursors only)
- File Patched: `lib/hooks/usePresence.ts`

## Issue
- Explicit unmount write `online:false` caused transient disappearance of users/cursors during routine tab switches or navigation, racing with subscriptions and `onDisconnect`.

## Fix
- Removed the explicit unmount `set(presenceRef, { online:false, ... })` call.
- Kept `clearInterval(heartbeat)`.
- Retained `onDisconnect(presenceRef).remove()` to handle true disconnects.

## Validation
1. Two tabs on same canvas show both users simultaneously (no flicker).
2. Live cursors update near-instantly (<50 ms perceived) both ways.
3. Switching tabs back and forth does not remove users or reset cursors.
4. RTDB path `/presence/{canvasId}/{sessionKey}` remains stable across visibility changes.

## Notes
- Presence heartbeat continues every 15s while tab active.
- Combined with event-driven cursor updates, perceived latency and flicker are minimized.
