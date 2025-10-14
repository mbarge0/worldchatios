## Metadata
- **Phase:** Supermodule A
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/sm-a-01-start.md`

---

# Phase Starter — Supermodule A: Data & Realtime Backbone (Modules 5–7)

## 1) Phase Overview
- **Phase Number/Name:** Supermodule A — Data & Realtime Backbone (Modules #5–#7)
- **Date:** Oct 14, 2025
- **Previous Phase Summary (from handoff):**
  - Phase 04 delivered Canvas Engine & UI: Konva stage with smooth pan/zoom, selection (click/shift/marquee), transforms (move/resize/rotate), and keyboard interactions. AuthGuard-protected `/c/[canvasId]` route is stable; unit tests and E2E scaffold are green. Ready to integrate persistence and realtime.
- **Objectives & Deliverables for Supermodule A:**
  - Define and implement Firestore schema: `canvases/{canvasId}` + `shapes/{shapeId}`.
  - Build persistence adapter (CRUD) and schema validation for shapes and canvas metadata.
  - Implement realtime sync for shapes via Firestore listeners.
  - Implement RTDB presence: `presence/{canvasId}/{userId}` with onDisconnect and cursor broadcasting (~20 Hz).
  - Add transient `lockedBy` with 5s TTL during transforms; clear on mouseup/timeout.
  - Debounce writes (~75 ms) during transforms; finalize on mouseup.
  - Preserve acceptance criteria from Modules 5–7; define tests and regression plan.

## 2) Scope
### Included
- Firestore data model and adapters for canvas and shapes.
- Realtime listeners for shape changes; write path with debounce and finalization.
- RTDB presence and labeled cursor broadcasting/receiving.
- Conflict reduction via transient locks (`lockedBy`, TTL) and merge-safe write strategy.
- Unit, integration, and E2E tests for data/sync/presence; regression across Phases 01–04.

### Excluded/Deferred
- Advanced shapes beyond current rectangle/text behaviors (Module 8).
- Security rules hardening (Module 9) beyond basic guardrails; to be handled in Supermodule B.
- Observability/perf instrumentation beyond basic logging (Module 10, B-phase).

## 3) Risks and Assumptions
### Risks
- Data contention leading to jitter or state oscillation.
- Excessive write frequency causing quota/latency issues.
- Presence flakiness on tab sleep/backgrounding.
- Clock drift impacting TTL-based locks.

### Mitigations
- Debounce writes (~75 ms) and batch updates; finalize on mouseup.
- Use `onDisconnect` for RTDB presence cleanup.
- Store lock with server timestamp and enforce 5s TTL; ignore stale locks.
- Prefer last-writer-wins for transient properties; deterministic merge for geometry.

### Assumptions
- Firebase Auth/Firestore/RTDB are initialized and available in client.
- Canvas store and UI are stable and instrumented with `data-testid`.
- Emulator or test environment available for integration tests.

## 4) Testing Focus
### Unit/Integration
- Firestore adapter: schema validation, CRUD for `shapes` and canvas metadata.
- Debounce utility and finalization logic on pointer up.
- Locking logic: set/refresh/expire; ignore stale locks.
- Firestore listeners: apply remote updates without feedback loops.

### E2E
- Two-user presence: `presence/{canvasId}/{userId}` appears/disappears; cursors at ~20 Hz.
- Two-user shape sync: move/resize/rotate reflected <100 ms typical.
- Conflict: two users attempt concurrent transform; lock behavior reduces contention.

### Example Test Paths
- `tests/unit/data/firestore-adapter.test.ts`
- `tests/unit/realtime/presence.test.ts`
- `tests/unit/sync/debounce-and-finalize.test.ts`
- `tests/e2e/realtime/presence-and-cursors.spec.ts`
- `tests/e2e/realtime/shapes-sync.spec.ts`

## 5) Implementation Plan
1. Define TypeScript types for canvas and shapes, including `lockedBy?: { userId: string; ts: number }` and zIndex.
2. Implement Firestore collections: `canvases/{canvasId}` and `canvases/{canvasId}/shapes/{shapeId}` with CRUD adapter.
3. Add Firestore listeners for shapes; update local store with origin tagging to avoid echo.
4. Implement RTDB presence: set `presence/{canvasId}/{userId}` with name/color, attach `onDisconnect().remove()`.
5. Cursor broadcasting at ~20 Hz: throttle outbound; render inbound with labels.
6. Write strategy: debounce during transforms (~75 ms) and final write on mouseup; include transient `lockedBy` with 5s TTL.
7. Tests: unit for adapters and debounce/lock; e2e for presence and realtime sync; regression for Phases 01–04.

## 6) Expected Outcome
- Definition of Done:
  - Firestore schema operational; CRUD and listeners stable.
  - RTDB presence and cursor broadcasting visible between two sessions.
  - Debounced writes with finalization; transient locks reduce conflicts.
  - Tests pass (unit/integration/E2E); no regressions to Auth, Routing, or Canvas UI.

## 7) Checkpoint Preparation
- Verify Firebase envs and emulator/test setup.
- Verify canvas route remains protected by `AuthGuard`.
- Confirm performance budgets: <100 ms shape sync, <50 ms cursor perceived latency.
- Suggested commit message for phase start:
  - `docs(sm-a): start Supermodule A — Data & Realtime Backbone (Modules 5–7)`
