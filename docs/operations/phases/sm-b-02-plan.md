## Metadata
- **Phase:** Supermodule B
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/sm-b-02-plan.md`

---

# Planning Loop — Supermodule B: Product & Stability Layer (Modules 8–10)

## 1) Phase Context
- **Phase:** Supermodule B — #8 Shapes & Text, #9 Security Rules, #10 Observability & Performance
- **Date:** Oct 14, 2025
- **Reason for Planning Loop:** Finalize product feature set (text + shapes), enforce security, and add observability/performance to achieve MVP readiness without regressing Modules 1–7.

## 2) Current Status
- **Completed (from Supermodule A):** Firestore schema/adapters, realtime listeners, RTDB presence/cursors, debounced writes + transient locks, Canvas wiring.
- **In Repo:** `ShapeLayer` renders rectangles; text creation/editing not yet implemented; styling props incomplete. Security rules not yet authored. Sentry scaffolding pending. Perf instrumentation absent.
- **Toward Goals:** Ready to extend shape model for text and styling, author rules + tests, and integrate monitoring/perf.

## 3) Issues and Blockers
- Text edit UX (Konva Text vs portal to HTML input) can be brittle with IME/selection.
- Emulator test harness for rules needed to validate constraints.
- Batch updates and rAF scheduling to avoid FPS regressions with 100+ nodes.

## 4) Scope Adjustments
- Consolidate Modules 8–10 into 4 tracks:
  - T1 Shapes & Text
  - T2 Security Rules (Firestore + RTDB)
  - T3 Observability & Performance
  - T4 Tests, Regression, Docs

## 5) Risk Assessment
- **Rules gaps → data leakage or blocked edits:** mitigate with explicit tests across auth/unauth and cross-canvas.
- **Text editing perf/UX issues:** mitigate with lightweight editor overlay, commit on blur/Enter, and escape to cancel.
- **Render thrash under many nodes:** mitigate by batching store updates, using `Konva.batchDraw`, and pausing listeners when tab hidden.

## 6) Regression Plan
- **Affected Prior Systems:** Auth gate, routing (`/c/[canvasId]`), presence/cursors, realtime sync, write strategy.
- **Must-Remain-Functional:** Login redirect, stable canvas render, smooth transforms, presence accuracy, no echo loops.
- **Checks to Add:**
  - Smoke: login → `/c/default` → create text → refresh → persists; no console errors.
  - E2E: two sessions create/edit text and move rectangle; both see updates; rules enforced.

---

## 7) Updated Success Criteria (from Dev Checklist Modules 8–10)
- Shapes & Text (M8):
  - Rectangle: create/move/resize/rotate/delete with fill, stroke, opacity, zIndex; persisted.
  - Text: create/edit/move/resize/rotate/delete; font size/family/weight, align, line-height; colors; persisted.
- Security Rules (M9):
  - Firestore: auth required; read/write allowed for authenticated users only on existing `canvasId`; emulator tests pass.
  - RTDB: writes restricted to `presence/{canvasId}/{userId}` by same `userId`; tests pass.
- Observability & Performance (M10):
  - Sentry captures client errors.
  - Batch updates; rAF-driven renders; unsubscribe/slow down on tab hidden; 60 FPS with 100+ objects (dev profile).

---

## 8) Task Summary (Priority, Dependencies, Effort, Mapping)

Legend: Priority (P1 highest), Effort (S ≤2h, M 2–4h, L ≥4h), Maps (Checklist Modules 8–10)

1. T1 — Shapes & Text (M8)
   - Description: Implement text node type with creation UI and inline editing; finalize rectangle and common styling props; persistence via Firestore; keyboard actions.
   - Priority: P1
   - Dependencies: Canvas engine, Firestore adapter/hooks.
   - Effort: M
   - Maps: M8

2. T2 — Security Rules (M9)
   - Description: Author Firestore and RTDB rules; add emulator tests for auth, cross-canvas, and presence restrictions.
   - Priority: P1
   - Dependencies: Auth; existing schema/collections.
   - Effort: M
   - Maps: M9

3. T3 — Observability & Performance (M10)
   - Description: Integrate Sentry client; add FPS/render-time instrumentation; Konva optimizations (batching, rAF scheduling, unsubscribe/slowdown when hidden).
   - Priority: P2
   - Dependencies: Canvas wiring; store/listeners.
   - Effort: M
   - Maps: M10

4. T4 — Tests, Regression, Docs (All)
   - Description: Unit/integration tests for shapes/text logic and rules; E2E for text create/edit and security enforcement; update docs.
   - Priority: P2
   - Dependencies: T1–T3
   - Effort: M
   - Maps: M8–M10

---

## 9) Dependency Graph (ASCII)

```
        T1 (Shapes & Text)
            |           
            v           
        T2 (Security Rules)      T3 (Observability & Perf)
            \                    /
             \                  /
                      v
              T4 (Tests, Docs)
```

Critical Path: T1 → T2 → T4. T3 can run in parallel after T1 UI is stabilized.

---

## 10) Task Breakdown (Detailed)

### T1 — Shapes & Text
- Acceptance:
  - `ShapeLayer` supports create/select/transform/delete for rect and text; properties persisted.
  - Text inline editing UX: click-to-edit, Enter to commit, Esc to cancel; blur commits.
  - Styling: fill, stroke, opacity, rotation, zIndex maintained; font settings for text.
- Steps:
  1. Extend types and store to include `TextShape` fields (content, fontSize, fontFamily, fontWeight, align, lineHeight, fill).
  2. Add text creation tool/button and pointer handler to place text at cursor.
  3. Implement inline editor overlay (HTML input/textarea portal) or Konva Text editing mode; wire commit/cancel.
  4. Persist via `firestore-adapter` using existing create/update flows; ensure zIndex ordering.
  5. Keyboard actions: Delete removes; arrows nudge; Shift modifies behavior; Esc cancels edit.

### T2 — Security Rules
- Acceptance:
  - Firestore: only authenticated users can read/write; writes must reference an existing `canvases/{canvasId}`; shape writes scoped to that canvas.
  - RTDB: path `presence/{canvasId}/{userId}` writable only by `auth.uid == userId`; onDisconnect allowed.
- Steps:
  1. Add `firestore.rules` and `database.rules.json` with constraints.
  2. Create emulator tests covering unauthenticated blocks, cross-canvas denial, valid writes.
  3. Integrate into CI script and local `pnpm test:rules`.

### T3 — Observability & Performance
- Acceptance:
  - Sentry captures a test error; dsn/env-driven config; sampling set for dev.
  - FPS meter shows ~60 FPS with 100+ shapes; rAF batching present; unsubscribe or throttle when tab hidden.
- Steps:
  1. Add Sentry client setup in `lib/observability/sentry.ts` and initialize in app layout.
  2. Add a small FPS/render-time meter gated by env flag; batch Konva draws.
  3. Add page visibility listener to pause listeners/cursor broadcast when hidden.

### T4 — Tests, Regression, Docs
- Acceptance:
  - Unit: shape reducers/text editor logic; rules tests green in emulator.
  - Integration: text creation/edit persistence; zIndex ordering; batching.
  - E2E: two-user text create/edit and rectangle move; rules enforced.
  - Docs updated; acceptance criteria preserved (Modules 8–10).
- Steps:
  1. Add unit tests under `tests/unit/canvas/*` for text logic.
  2. Add rules tests under `tests/unit/data/*rules*` or a new `tests/rules/` directory.
  3. Expand E2E: `tests/e2e/canvas/text-and-rules.spec.ts`.
  4. Update phase docs; add build/debug logs.

---

## 11) Acceptance Criteria (Preserved from Dev Checklist)
- See Section 7; mirrors `/docs/foundation/dev_checklist.md` Modules 8–10.

## 12) Success Metrics
- 60 FPS interactions with 100+ shapes during typical transforms.
- No unauthorized reads/writes; emulator rules suite green.
- Sentry capturing client exceptions; no uncaught console errors in core flows.
- Unit/integration/E2E all green locally and in CI.

## 13) Checkpoint Schedule
- CP1: After T1 (text + finalized rectangle behaviors persist)
- CP2: After T2 (rules implemented + tests green)
- CP3: After T3 (observability/perf instrumentation integrated)
- CP4: After T4 (tests + docs updated; regression pass)

## 14) Next Steps
1. Implement T1 shapes & text.
2. Author and test T2 security rules.
3. Integrate T3 observability/performance.
4. Execute T4 tests/regression; finalize docs.


