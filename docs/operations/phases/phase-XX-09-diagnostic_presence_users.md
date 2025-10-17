# Diagnostic — Presence Users List vs Cursor Visibility (RTDB)

## Files Reviewed
- `lib/hooks/usePresence.ts`
- `lib/firebase.ts`
- `components/canvas/CanvasStage.tsx` (consumer of cursors)
- `components/layout/PresenceBar.tsx` (users display)

## Paths & Listeners
1. Write Path (sessions):
   - `usePresence.ts` writes to: `/presence/{canvasId}/{sessionKey}` where `sessionKey = "${uid}:${randomUUID}"`
   - Fields: `{ online, displayName, color, ts, userId, sessionId, cursor: {x,y,ts} }`
2. Read Path (cursors/users):
   - `usePresence.ts` subscribes to: `/presence/{canvasId}` via `onValue`
   - `participantsRef.current` is populated from that snapshot; `CanvasPage` maps participants to `PresenceBar` users
3. Paths Match: ✅ Yes — reads aggregate all sessions under the same canvasId and expose them via refs.

## Cleanup & Unsubscribe Behavior
- `onDisconnect(presenceRef).remove()` registered for abrupt close.
- Best-effort offline write on unmount sets `{ online:false }` (may cause brief offline flicker if invoked during tab switches).
- `visibilitychange` unsubscribes listener when hidden and re-subscribes on visible; event handler removed on unmount.

## Likely Issues Observed
- If user list is missing entries while cursors show (or vice-versa), probable causes:
  1) Multiple tabs for same user: previously filtered by `uid` hid sibling tabs — now fixed by `sessionKey`.
  2) Transient offline flicker: explicit offline `set(...)` during unmount can momentarily remove the session before other clients subscribe, causing a missing avatar until heartbeat refresh.

## Minimal Surgical Fix Recommendation (one-liner)
- Prefer relying on `onDisconnect.remove()` and remove the explicit offline write in unmount cleanup to avoid transient disappearance.

Change in `usePresence.ts` (unmount cleanup):
- Remove: `set(presenceRef, { online: false, ... })`
- Keep: `clearInterval(heartbeat)` and the previously established `onDisconnect.remove()`

Rationale: Let RTDB handle disconnects; avoid toggling `online:false` during routine route/tab changes, which can race with subscriptions and briefly clear the user.

## Conclusion
- Paths are aligned: writes `/presence/{canvasId}/{sessionKey}`; reads `/presence/{canvasId}`.
- A small cleanup change (remove best-effort offline write) will reduce flicker and make user list and cursors more stable during tab visibility changes.
