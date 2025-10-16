## Phase Context
- **Phase:** 05 — Supermodule: Pre-AI Reliability, Persistence, Auth & Advanced Features (A1–A5)
- **Date:** 2025-10-15
- **Reason for Planning Loop:** Break consolidated supermodule into actionable tasks with priorities, dependencies, estimates, and regression coverage before execution.

### Current Progress Summary
- Phase kickoff created: `phase-05-01-start.md` with scope/objectives.
- Dev checklist updated with consolidated modules A1–A5 (`docs/foundation/dev_checklist.md`).
- No implementation started for A1–A5 yet.

---

## Current Status
- Tooling, canvas, persistence, and sync foundations exist (Modules #1–#12 complete for MVP baseline).
- Open risks: concurrency arbitration polish, mid-edit rollback, export performance, unified action helpers.

---

## Issues and Blockers
- None blocking. Decisions to confirm:
  - Grid size default = 8px, snap radius = 6px.
  - Version snapshot retention = 20 per canvas.

---

## Scope Adjustments
- No scope changes from kickoff. Maintain A1–A5 content as defined in the checklist; implement in low-risk sequence.

---

## Risk Assessment
- Concurrency thrash during rapid edits → mitigate with explicit transform sessions + TTL locks; Sentry breadcrumbs for diagnostics.
- Stale locks on refresh/close → `beforeunload` cleanup and TTL.
- Export PNG at high scale → provide scale selector and throttle UI; test with mocked `toDataURL`.
- Helper divergence → UI must call `lib/ai/actions.ts` only; add unit tests and spies.
- A11 naming preserved as A5 helpers to keep AI integration straightforward next phase.

---

## Dependency Graph (A1–A5)

```
A1 Conflict Resolution 2.0
   ↓
A2 Persistence & Reconnection (uses A1 session/lock state)
   ↓
A3 Authentication & Canvas UI Polish (independent of A1/A2 logic, but shares toolbar)
   ↓
A4 Advanced Features Suite (depends on toolbar/selection from A3 and canvas engine)
   ↓
A5 AI-Ready Shape Action Abstractions (used by A3/A4; can start in parallel after API decided)
```

Critical Path: A1 → A2 → A3 → A4. A5 starts after A3 handlers are identified; completes before end of A4 to refactor callers.

---

## Task Breakdown

Legend: Effort ≈ S (≤2h), M (2–6h), L (6–12h)

### A1 — Conflict Resolution 2.0 (Checklist: Module A1; PRD §4, §6; Architecture §4 Data Flow: LWW + Locks)
- A1-T1 Session lifecycle in store (start/update/end) — Effort: M
  - Acceptance: session created on mousedown; cleared on mouseup/cancel; consistent under rapid updates.
  - Deps: Canvas Engine & UI (#4), Data Model & Persistence (#5).
- A1-T2 Ephemeral `lockedBy` with 5s TTL + visual indicator — Effort: M
  - Acceptance: tint + tooltip shows editor; clears on end/timeout.
  - Deps: A1-T1.
- A1-T3 Write arbitration (LWW with `serverTimestamp`, `actorId`) — Effort: M
  - Acceptance: simultaneous updates converge; no ghost/dup nodes.
  - Deps: Firestore adapters (#5), listeners (#6).
- A1-T4 Safe-cancel on delete-vs-edit — Effort: S
  - Acceptance: deleting edited object cancels remote session cleanly.
  - Deps: A1-T1, A1-T2.
- A1-T5 Sentry breadcrumbs for contention events — Effort: S
  - Acceptance: breadcrumb includes shapeId, actorIds (no PII).
  - Deps: Observability (#10).

### A2 — Persistence & Reconnection (Checklist: Module A2; PRD §2 Persistence; Requirements2 §Persistence & Reconnection)
- A2-T1 Mid-edit refresh rollback to last committed state — Effort: M
  - Acceptance: reload during transform restores pre-drag state; no partials.
  - Deps: A1 session state, debounce writes (#7 baseline).
- A2-T2 `beforeunload` cleanup for locks and transient UI — Effort: S
  - Acceptance: lock/session cleared on refresh/close.
  - Deps: A1.
- A2-T3 Connection status chip (connected/reconnecting/offline) — Effort: S
  - Acceptance: reflects emulator network toggles.
  - Deps: Firebase clients (#1), presence (#6 optional for signal).
- A2-T4 Local op queue (buffer ≤10 ops, idempotent replay) — Effort: M
  - Acceptance: queued ops replay and converge after reconnect.
  - Deps: Firestore adapters (#5), A1 arbitration.

### A3 — Authentication & Canvas UI Polish (Checklist: Module A3; PRD §2 MVP Auth/UI; Requirements2 screenshots)
- A3-T1 Revamp `/login` (two-column hero, Email/Password + Magic Link) — Effort: M
  - Acceptance: responsive; focus styles; error toasts.
  - Deps: Authentication (#2), UI components.
- A3-T2 Security/a11y pass for login — Effort: S
  - Acceptance: no credentials logged; axe no serious violations.
  - Deps: A3-T1.
- A3-T3 Bottom toolbar with primary actions (+ tooltips/shortcuts) — Effort: M
  - Acceptance: visible on canvas; handlers wired.
  - Deps: Canvas Engine & UI (#4), Selection.
- A3-T4 Page frame visuals (background + blue outline) — Effort: S
  - Acceptance: subtle boundary; no perf regressions.
  - Deps: Canvas layout.
- A3-T5 Toolbar + login a11y sweep — Effort: S
  - Acceptance: full keyboard traversal; ARIA labels.
  - Deps: A3-T1, A3-T3.

### A4 — Advanced Features Suite (Checklist: Module A4; Requirements2 §3 Advanced Features)
- A4-T1 Keyboard shortcuts (Delete, Duplicate, Arrow ±Shift) — Effort: S
  - Acceptance: centralized keymap; conflict-safe; tests.
  - Deps: A3 toolbar/selection.
- A4-T2 PNG export (canvas + selection with scale) — Effort: M
  - Acceptance: downloads; correct dimensions; background preserved.
  - Deps: Konva stage; bounds utility.
- A4-T3 Basic SVG export (rect, circle, text) — Effort: M
  - Acceptance: valid SVG markup opens correctly.
  - Deps: shape serializers.
- A4-T4 Grid toggle + snapping (8px; radius 6px; Alt disables) — Effort: M
  - Acceptance: overlay toggle persists; accurate snap.
  - Deps: math utils; selection/drag hooks.
- A4-T5 Simple smart guides (center/edge align hints) — Effort: M
  - Acceptance: lines appear on alignment; disappear on release.
  - Deps: selection geometry.
- A4-T6 Alignment/distribution actions — Effort: M
  - Acceptance: multi-select aligns; spaces evenly.
  - Deps: selection; bounds math.
- A4-T7 Z-index management (front/back/step) + normalization — Effort: S
  - Acceptance: unique `zIndex`; order renders correctly.
  - Deps: Firestore updates; normalization util.
- A4-T8 Version history: snapshot/restore/retention(20) — Effort: M
  - Acceptance: snapshot stored; restore creates new snapshot; prune policy enforced.
  - Deps: Firestore subcollection; serializer.

### A5 — AI-Ready Shape Action Abstractions (Checklist: Module A5; PRD §4 Final AI tooling; Architecture §7/§97–§102)
- A5-T1 Implement `lib/ai/actions.ts` helpers — Effort: M
  - Acceptance: `createShape`, `createText`, `moveShape`, `resizeShape`, `rotateShape`, `alignShapes`, `zIndexUpdate`, `exportCanvas`, `exportSelection` with explicit types.
  - Deps: Firestore adapter; canvas store.
- A5-T2 Refactor UI handlers (toolbar + keymap) to call helpers — Effort: M
  - Acceptance: single source of truth; spies confirm calls in tests.
  - Deps: A3-T3, A4-T1..T7 as applicable.

---

## Task Summary & Priority Order
1) A1-T1 → A1-T5 (M/M/M/S/S) — Highest priority; unblocks A2.
2) A2-T1 → A2-T4 (M/S/S/M) — Next; ensures persistence and reconnect stability.
3) A3-T1 → A3-T5 (M/S/M/S/S) — UI polish and toolbar foundation for A4.
4) A5-T1 (M) — Start after A3-T3 finalizes handlers; done before A4 refactors.
5) A4-T1 → A4-T8 (S/M/M/M/M/M/S/M) — Ship in low-risk sequence: T1 → T2 → T4 → T5 → T6 → T7 → T3 → T8.

Estimated Total: ~3–4 days dev time (1 dev), excluding buffer.

---

## Regression Plan

Impacted prior modules/systems (from `/docs/foundation/dev_checklist.md` and mapped in `/docs/operations/regression/00_master_regression_manifest.md`):
- #2 Authentication — A3 login changes must preserve auth flows.
- #4 Canvas Engine & UI — A1/A3/A4 modify input/selection/toolbar behavior.
- #5 Data Model & Persistence — A2 rollback and A4 snapshots/export.
- #6 Realtime Sync & Presence — Ensure no regressions in listeners and cursor latency.
- #7 Conflict Handling & Writes — A1 extends lock/arbitration; maintain debounced writes.
- #10 Observability & Performance — Sentry breadcrumbs; maintain 60 FPS.
- #12 Cross-Module QA — MVP E2E must remain green.

Features/workflows that must continue working post-phase:
- Sign-in (Email/Password + Magic Link) and auth gate to `/c/[canvasId]`.
- Pan/zoom, selection (single/multi), transforms (move/resize/rotate), Delete, basic Arrow nudge.
- Real-time presence and <50 ms cursor sync; <100 ms object sync typical.
- Autosave and reload restoring state; JSON export remains valid.

Regression Checks to schedule during Debug Loop:
- Quick smoke of modules #2, #4–#7, #10, #12.
- E2E: two-user contention; mid-edit refresh; network offline/restore; keyboard shortcuts; export PNG/SVG; alignment/distribution; z-index; snapshot/restore.

---

## Updated Success Criteria
- All A1–A5 acceptance criteria from the checklist pass with unit/integration/E2E coverage.
- No performance regressions (60 FPS interactions; latency targets intact).
- UI accessible via keyboard; axe reports no serious violations on login/toolbar.
- Single action surface in `lib/ai/actions.ts` adopted by UI.

---

## Next Steps
1. Confirm assumptions (grid 8px, snap 6px, retention 20).
2. Implement A1 tasks in order; add unit tests and Sentry breadcrumbs.
3. Implement A2 tasks; add E2E for refresh/network scenarios.
4. Build A3 login + toolbar + visuals; run a11y checks.
5. Implement A5 helpers; refactor toolbar/shortcuts to use them.
6. Implement A4 features in low-risk sequence; extend tests accordingly.
7. Prepare phase debug checklist with regression items listed above.

---

## Pause & Review (Checkpoint)
- Objectives, dependencies, and priority order confirmed.
- All tasks map to PRD/Architecture/Checklist sections noted above.
- Proceed after confirming assumptions and test environment readiness.


