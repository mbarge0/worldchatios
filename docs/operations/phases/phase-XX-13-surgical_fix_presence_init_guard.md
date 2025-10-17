# Surgical Fix — Presence Initialization Guard (RTDB)

## Phase Context
- Date: 2025-10-17
- Type: Surgical Fix (Presence/Cursors only)
- File Patched: `lib/hooks/usePresence.ts`

## Fix
- Wrapped presence setup (write, subscribe, cursor updates) in a strict guard:
  - `if (!canvasId || typeof canvasId !== 'string' || canvasId.length === 0) return;`
- Added dev log for confirmation:
  - `console.log('[usePresence] Initialized presence for canvasId:', canvasId)`

## Rationale
- Ensures RTDB presence initializes only when a valid route param is ready, preventing early-return exit and missing presence writes/subscriptions.

## Validation
1. Open `http://localhost:3000/c/default` in two tabs → both users appear in header within 1–2 seconds.
2. Live cursors move smoothly both ways (<50 ms latency perceived).
3. Switch tabs repeatedly → no disappearance or cursor reset.
4. Confirm RTDB nodes present at `/presence/default/{sessionKey}` and removed on tab close.

## Notes
- Works in concert with previous fixes:
  - Per-session keys to avoid uid collisions.
  - Event-driven cursor update path in `CanvasStage`.
  - Removed explicit unmount `online:false` to avoid transient flicker.
