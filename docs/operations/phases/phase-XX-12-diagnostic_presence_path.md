# Diagnostic — Presence Data Path (RTDB)

## Checks Performed

1) `lib/hooks/usePresence.ts`
- Computed keys:
  - `canvasId`: passed from route via `useParams` in `app/c/[canvasId]/page.tsx`
  - `sessionKey`: `${uid}:${randomUUID}` (per-tab uniqueness)
- RTDB refs and calls:
  - Write init: `set(ref(rtdb, "presence/"+canvasId+"/"+sessionKey), { online, displayName, color, ts, userId, sessionId })`
  - Heartbeat: `update(presenceRef, { ts, online:true })`
  - Cursor: `update(presenceRef, { cursor:{x,y,ts} })`
  - Subscribe: `onValue(ref(rtdb, "presence/"+canvasId), cb)`
  - Disconnect: `onDisconnect(presenceRef).remove()`
- Visibility handling:
  - Unsubscribes when hidden; re-subscribes when visible.
  - Event handler is removed on unmount.
  - Explicit unmount write of `online:false` has been removed (per surgical fix).

2) `lib/firebase.ts`
- Initialization order:
  - `app = getApps().length ? getApp() : initializeApp(firebaseConfig)`
  - `rtdb = getDatabase(app)`
- RTDB is exported before any `ref()` usage — OK.

3) Presence list (`PresenceBar` flow)
- `app/c/[canvasId]/page.tsx` uses `usePresence(canvasId)` and maps `participantsRef.current` → `PresenceBar`.
- The hook increments internal `version` state on each snapshot; this re-renders the page component, refreshing the users list.

## Findings
- Paths match
  - Writes: `/presence/{canvasId}/{sessionKey}`
  - Reads: `/presence/{canvasId}`
- Initialization is correct
  - `getDatabase(app)` constructed before refs; no evidence of undefined clients.
- Cleanup timing
  - With the explicit `online:false` unmount write removed, transient user disappearance between tab switches should be eliminated.
- Remaining latency contributor
  - Polling-based cursor propagation in `CanvasStage` has been replaced with event-driven updates (prior surgical fix). This reduces perceived delay and stale cursors.

## Diagnostics To Watch (during local test)
- Is `canvasId` ever undefined/empty? If so, the hook `if (!canvasId) return` will skip presence init — ensure route param is ready before mounting presence hook.
- Console for RTDB errors
  - Current logic swallows transient `PERMISSION_DENIED` messages to avoid noisy logs. For deep debugging, temporarily log all errors to identify rule issues.

## Minimal Surgical Fix Plan (if issues reappear)
- Ensure presence init only runs when `canvasId` is non-empty:
  - Guard already present: `if (!canvasId) return;` in effects.
  - Optional: defer hook call until `typeof canvasId === 'string' && canvasId.length > 0`.
- If user list still flickers on tab switches:
  - Keep relying solely on `onDisconnect.remove()` (no explicit offline writes).
- If subscriptions miss updates:
  - Avoid unsubscribing on `visibilitychange` for brief backgrounding; or debounce the unsubscribe to reduce churn (e.g., unsubscribe after 2–3s hidden).

## Root Cause Summary
- No path mismatch detected. Prior flicker was due to an explicit unmount offline write racing with active sessions. This has been removed. Presence read/write paths are aligned, initialization order is correct, and event-driven updates are in place.
