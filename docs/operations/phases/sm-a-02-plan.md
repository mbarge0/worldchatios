## Metadata
- **Phase:** Supermodule A
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/sm-a-02-plan.md`

---

# Planning Loop — Supermodule A: Data & Realtime Backbone (Modules 5–7)

## 1) Phase Context
- **Phase:** Supermodule A — Modules #5 Data, #6 Realtime, #7 Conflicts
- **Date:** Oct 14, 2025
- **Reason for Planning Loop:** Integrate persistence, realtime sync, and write-conflict strategy into a cohesive backbone enabling multi-user collaboration.
- **Current Progress Summary:**
  - Phase 04 completed Canvas Engine & UI with pan/zoom, selection, transforms, and keyboard. Route `/c/[canvasId]` under `AuthGuard` is stable; tests green.
  - Firebase Auth/Firestore initialization present in `lib/firebase.ts`/`lib/firebase/client.ts`.

## 2) Current Status
- **Completed:** Canvas UI foundation; project wiring; Auth and Firebase clients configured.
- **In Repo:** No Firestore adapters for shapes; no RTDB presence; no debounce/lock strategy implemented yet.
- **Toward Goals:** Ready to add schema, adapters, presence, listeners, and conflict handling.

## 3) Issues and Blockers
- Need deterministic schema for `shapes` (rect/text baseline), including zIndex and `lockedBy`.
- Avoid write/echo loops between local transforms and remote listeners.
- Cursor broadcast rate vs. performance trade-offs.

## 4) Scope Adjustments
- Consolidate Modules 5–7 into 5 tracks:
  - T1 Schema & Adapter (M5)
  - T2 Realtime Sync (M6)
  - T3 Presence & Cursors (M6)
  - T4 Conflict & Write Strategy (M7)
  - T5 Tests, Regression, Docs (All)

## 5) Risk Assessment
- **Write amplification:** mitigated by ~75 ms debounce and finalization on mouseup.
- **Stale locks:** mitigated by TTL (5s) based on server timestamps; ignore expired.
- **Listener feedback loops:** mitigated by origin tagging and version/updatedAt checks.
- **Presence flake on tab sleep:** mitigated by periodic heartbeat and `onDisconnect`.

## 6) Regression Plan
- **Affected Prior Systems:**
  - Module #2 Authentication (`AuthGuard` and login redirects)
  - Module #3 Routing & Shell (`/c/[canvasId]` stability)
  - Module #4 Canvas Engine & UI (stage, selection, transforms, keyboard)
- **Master Manifest Reference:** `/docs/operations/regression/00_master_regression_manifest.md`
- **Must-Remain-Functional:**
  - Login redirect when unauthenticated; canvas shell protected and renders when authed.
  - Canvas interactions unaffected by background listeners and writes (no FPS regressions).
- **Checks to Add:**
  - Smoke: login → `/c/[canvasId]` → presence appears; no console errors.
  - E2E: two sessions move shape; both see updates; cursors stream; no auth/routing regression.

## 7) Updated Success Criteria
- Firestore schema implemented; CRUD adapters pass unit tests; emulator/integration green.
- Firestore listeners propagate shape updates <100 ms typical.
- RTDB presence `presence/{canvasId}/{userId}` online/offline accurate; onDisconnect works.
- Cursors broadcast at ~20 Hz; perceived latency <50 ms with labels and colors.
- Transient `lockedBy` reduces conflicting edits; auto-clears on mouseup or 5s TTL.
- Debounced writes (~75 ms) during transforms; final write on mouseup; consistent state.
- Unit/integration/E2E tests pass; no regressions to Phases 01–04.

---

## 8) Task Summary (Priority, Dependencies, Effort, Mapping)

Legend: Priority (P1 highest), Effort (S ≤2h, M 2–4h, L ≥4h), Maps (Checklist Modules 5–7)

1. T1 — Firestore Schema & Adapter
   - Description: Define types and implement CRUD for `canvases/{canvasId}` and `shapes/{shapeId}`.
   - Priority: P1
   - Dependencies: Auth/Firebase client
   - Effort: M
   - Maps: M5 schema/CRUD

2. T2 — Realtime Sync (Shapes)
   - Description: Firestore listeners for shapes with origin tagging to prevent echo.
   - Priority: P1
   - Dependencies: T1
   - Effort: M
   - Maps: M6 shapes realtime

3. T3 — Presence & Cursors (RTDB)
   - Description: RTDB presence paths and cursor broadcast/render at ~20 Hz.
   - Priority: P1
   - Dependencies: Auth/Firebase client
   - Effort: M
   - Maps: M6 presence + cursors

4. T4 — Conflict & Write Strategy
   - Description: Debounced writes (~75 ms), finalization on mouseup; transient `lockedBy` with 5s TTL.
   - Priority: P1
   - Dependencies: T1, T2
   - Effort: M
   - Maps: M7 conflict handling

5. T5 — Tests, Regression, Docs
   - Description: Unit/integration/E2E tests; regression plan; update docs and acceptance verification.
   - Priority: P2
   - Dependencies: T1–T4
   - Effort: M
   - Maps: All

---

## 9) Dependency Graph (ASCII)

```
        T1 (Schema & Adapter)
            |           
            v           
        T2 (Realtime Sync)      T3 (Presence & Cursors)
            |                   /
            v                 /
        T4 (Conflict & Write Strategy)
                 |
                 v
        T5 (Tests, Regression, Docs)
```

Critical Path: T1 → T2 → T4 → T5 (T3 runs in parallel with T1/T2 and joins at T5)

---

## 10) Task Breakdown (Detailed)

### T1 — Firestore Schema & Adapter
- Acceptance:
  - Collections: `canvases/{canvasId}`, `canvases/{canvasId}/shapes/{shapeId}` operational.
  - Shape schema supports: id, type, x, y, width, height, rotation, zIndex, fill, stroke, opacity, `lockedBy? { userId, ts }`, `updatedAt`.
  - CRUD utilities with validation and type-safe inputs/outputs.
- Steps:
  1. Define TS types in `types/database.ts` or a new `types/shapes.ts`.
  2. Implement adapter in `lib/store/canvas-store.ts` or `lib/data/firestore-adapter.ts`.
  3. Add emulator-aware config for integration tests.
- Outputs: Types and adapter files; unit tests.

### T2 — Realtime Sync (Shapes)
- Acceptance:
  - Firestore snapshots apply remote changes to local store without echo.
  - Latency: <100 ms typical to reflect remote edits.
- Steps:
  1. Subscribe to `shapes` subcollection for active `canvasId`.
  2. Tag local-origin writes (e.g., `originUserId`, or keep a per-session map of pending ids) to avoid re-applying.
  3. Apply updates to Zustand store; batch with rAF.
- Outputs: Listener utilities; integration tests.

### T3 — Presence & Cursors (RTDB)
- Acceptance:
  - `presence/{canvasId}/{userId}` entries appear/disappear; onDisconnect removes.
  - Cursors stream at ~20 Hz outbound; remote cursors render with displayName/color; perceived latency <50 ms.
- Steps:
  1. On join, set presence node with `{ online: true, displayName, color, ts }` and `onDisconnect().remove()`.
  2. Broadcast cursor position throttled to ~20 Hz to `presence/{canvasId}/{userId}/cursor`.
  3. Listen to others under `presence/{canvasId}`; render cursors.
- Outputs: Presence utilities and hooks; e2e test.

### T4 — Conflict & Write Strategy
- Acceptance:
  - During transforms, outbound updates debounced ~75 ms; final snapshot on mouseup.
  - `lockedBy` set when user begins transform; cleared on mouseup or after 5s TTL.
  - Competing edits minimized; consistent end state.
- Steps:
  1. Add lock set/refresh on pointer down/move; include server timestamp.
  2. Implement debounced writer for shape updates; commit final on mouseup.
  3. Ignore remote writes if `lockedBy.userId !== me` and not expired, unless finalization.
- Outputs: Writer utilities; unit tests for debounce/TTL; e2e contention test.

### T5 — Tests, Regression, Docs
- Acceptance:
  - Unit: adapters, debounce, TTL, presence hooks.
  - Integration: Firestore listeners; echo-prevention; emulator runs.
  - E2E: two-user presence, cursors, and shapes sync; contention scenario passes.
  - Docs updated; acceptance criteria preserved (Modules 5–7).
- Steps:
  1. Add unit tests under `tests/unit/{data,realtime,sync}`.
  2. Add E2E under `tests/e2e/realtime/*` using two browser contexts.
  3. Update phase docs and checklist mapping.
- Outputs: Tests and updated docs.

---

## 11) Acceptance Criteria (Preserved from Dev Checklist)
- **Module #5 — Data Model & Persistence**
  - Firestore collections: `canvases/{canvasId}` + `shapes/{shapeId}`; CRUD works; timestamps; zIndex maintained. Tests: unit for adapters; emulator integration.
  - JSON export (scoped for later; ensure schema supports export roundtrip).
- **Module #6 — Realtime Sync & Presence**
  - RTDB presence at `presence/{canvasId}/{userId}` with onDisconnect; two-browser e2e.
  - Labeled cursors streamed at ~20 Hz; perceived latency <50 ms.
  - Firestore listeners for shapes; updates propagate <100 ms. E2E move/resize/rotate sync.
- **Module #7 — Conflict Handling & Write Strategy**
  - Transient `lockedBy` with 5s TTL; clears on mouseup/timeout. E2E contention test.
  - Debounced writes (~75 ms) during transforms; final write on mouseup; smooth local transforms; minimal write load.

---

## 12) Success Metrics
- <100 ms typical Firestore shape sync; <50 ms cursor latency perceived.
- No visible jitter during local transforms; write volume reduced by >80% vs. naive per-frame writes.
- Zero echo loops observed; no FPS regression on canvas interactions.
- Tests: unit/integration/E2E all green locally and in CI.

## 13) Checkpoint Schedule
- CP1: After T1 (schema + adapter ready)
- CP2: After T2/T3 (listeners + presence operational)
- CP3: After T4 (debounce + locks functional)
- CP4: After T5 (tests + docs + regression pass)

## 14) Next Steps
1. Implement T1 schema and adapter.
2. Wire T2 listeners and T3 presence/cursors in parallel.
3. Add T4 debounce and lock strategy; integrate with UI events.
4. Execute T5 tests and regression; finalize docs.
