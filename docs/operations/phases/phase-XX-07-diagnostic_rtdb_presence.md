# Diagnostic — RTDB Presence & Cursor Sync

## Scope
- Files reviewed:
  - `lib/hooks/usePresence.ts`
  - `lib/firebase.ts`
  - Cursor rendering: `components/canvas/CursorLayer.tsx`
  - Stage wiring: `components/canvas/CanvasStage.tsx`

## API Usage Confirmation
- RTDB client created with `getDatabase(app)` in `lib/firebase.ts` → `export const rtdb` ✅
- Presence hook (`usePresence.ts`) uses RTDB primitives:
  - Writes: `set`, `update` to `ref(rtdb, presence/{canvasId}/{sessionKey})` ✅
  - Subscribe: `onValue(ref(rtdb, presence/{canvasId}))` ✅
  - Cleanup: `onDisconnect(presenceRef).remove()` + best-effort offline write ✅

## Current Behavior (post-fix with sessionKey)
- Write path: `/presence/{canvasId}/{uid}:{randomUUID}` (per-tab uniqueness)
- Read path: `/presence/{canvasId}` aggregating all sessions
- Local session filtered by `sessionKey` (not by `uid`) so other tabs from same user are included
- Heartbeat every 15s maintains `online: true` and `ts`
- Cursor sends at ~20 Hz via `sendCursor(x, y)` using `update(... { cursor: {x,y,ts} })`

## Potential Failure Points
1) Unintended Unsubscribe on Tab Visibility
   - `visibilitychange` handler calls `unsub()` when hidden and re-attaches on visible. If the event listener itself isn’t removed on unmount, multiple handlers could accumulate. The new code removes it on return path — mitigated. ✅

2) Filtering Out Self Cursor
   - Previously filtered by `uid`, which removed all sessions for same user. Now filtered by `sessionKey`, so other tabs from same user are visible. ✅

3) onDisconnect(remove) Misfire
   - Presence uses both `onDisconnect(...).remove()` and an explicit offline write in cleanup. If a tab becomes hidden or loses network briefly, explicit `set(... online:false ...)` could temporarily mark offline. However, heartbeat refreshes on interval and presence remains. Risk: brief flicker under aggressive tab lifecycle. ⚠️ Low

4) Throttle/Hidden Tab Path
   - `sendCursor` skips updates when `document.hidden` or under 50 ms since last send. On hidden tabs this is desired, but ensure the visible tab keeps updates. No issues identified. ✅

5) Rendering Path
   - `CanvasStage` polls `cursorsRef.current` every 100 ms and feeds `CursorLayer`. This polling interval introduces up to 100 ms extra delay. With RTDB delivery typically <50 ms, total perceived delay can approach ~150 ms. Consider event-driven state update instead of setInterval to shave latency. ⚠️ Medium (optimization)

## Evidence of Correct Wiring
- `lib/firebase.ts` exports `rtdb` and is used by `usePresence.ts`.
- `usePresence` writes and subscribes under `/presence/{canvasId}`.
- `CursorLayer` renders provided `cursors` with smoothing and time-based opacity fade.

## Minimal, Safe Fix Plan (no code changes yet)
- Replace polling in `CanvasStage` with a subscription callback from `usePresence`:
  - Expose a memoized `getCursors()` selector or an event emitter from the hook, and set state immediately on `onValue` callback instead of 100 ms interval.
  - This reduces end-to-end latency and improves perceived responsiveness.
- Keep per-session keys as implemented; no schema change required.
- Optional: gate explicit offline write in unmount cleanup to avoid transient offline flickers; rely on `onDisconnect.remove()` for abrupt closures.

## Conclusion
- Core RTDB presence and cursor synchronization logic is correctly implemented and subscribed.
- The most likely contributors to prior missing/laggy cursors were (a) `uid`-level filtering (now fixed) and (b) polling-based cursor propagation in `CanvasStage` (still present). Moving to event-driven updates is the recommended minimal improvement.
