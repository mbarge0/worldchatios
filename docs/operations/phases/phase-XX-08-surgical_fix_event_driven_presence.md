# Surgical Fix — Event-Driven Cursor Presence (RTDB)

## Phase Context
- Date: 2025-10-17
- Type: Surgical Fix (Presence/Cursors only)
- Files Patched: `components/canvas/CanvasStage.tsx`

## Issue
- Cursor updates in UI were driven by a 100 ms polling interval that read from `cursorsRef.current`, adding extra latency and occasional stutter.

## Fix
- Removed polling setInterval from `CanvasStage.tsx`.
- Switched to event-driven re-renders keyed off `version` from `usePresence` (incremented on each `onValue` update).
- `remoteCursors` state now updates immediately when presence data changes.

## Verification
- Two-browser same-canvas test: cursors render with perceived <50 ms delay.
- Multiple tabs for same user display as distinct cursors (sessionKey isolation retained from prior fix).
- Hiding/closing tabs does not produce flicker or stale cursors; listeners unsubscribe/resubscribe correctly.

## Notes
- No changes to `CursorLayer.tsx` or annotation rendering; smoothing and fade behavior preserved.
- This change is localized to presence update propagation; no canvas UI regressions observed.

## Next Steps (Optional)
- Consider exposing a direct `onCursorsChanged` callback from `usePresence` if additional event-driven consumers are added.
