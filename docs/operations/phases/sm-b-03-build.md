## Metadata
- **Phase:** Supermodule B
- **Mode:** Agent
- **Output Path:** `/docs/operations/phases/sm-b-03-build.md`

---

# Build Log — Supermodule B: Product & Stability Layer (Modules 8–10)

## Phase Context
- **Session:** Begin Build
- **Date:** Oct 14, 2025
- **Goal:** Implement Modules 8–10 per `sm-b-02-plan.md`: Shapes & Text; Security Rules; Observability & Performance.
- **Branch:** product-stability-layer

## Build Objectives
- Add Text shape support with creation, inline editing, styling, and persistence.
- Author Firebase Security Rules for Firestore and RTDB; scaffold emulator tests.
- Integrate Sentry (already present), add FPS meter, batch updates, and pause listeners on hidden tab.
- Extend seed script to generate 100+ objects for performance verification.

## Implementation Log
1) Store and Sync: text + styling
- `lib/store/canvas-store.ts`: Expanded `CanvasNode` to discriminated union (`rect` | `text`) with styling props.
- `lib/hooks/useShapesSync.ts`: Map `ShapeDoc` to store nodes including text fields; batch updates via rAF; pause/resume on tab visibility.

2) Rendering and editing
- `components/canvas/ShapeLayer.tsx`: Render both `Rect` and `Text`; selection styling preserved; double-click on text triggers edit.
- `components/canvas/TextEditModal.tsx`: New modal for inline text editing with save/cancel.
- `components/canvas/CanvasStage.tsx`:
  - Keyboard: Arrow nudges, Delete removes, 'T' creates text at viewport center (persisted), Enter opens edit for selected text.
  - Optional FPS overlay behind `NEXT_PUBLIC_SHOW_FPS=1`.

3) Persistence and write path
- `lib/hooks/useShapeWriter.ts`: Existing debounced updates and commit used for transforms; text save uses adapter `updateShape`.
- `lib/data/firestore-adapter.ts`: Existing CRUD leveraged (no API changes required).

4) Security Rules
- `firestore.rules`: Auth required; shapes writes allowed only if parent canvas exists.
- `database.rules.json`: RTDB presence path write restricted to `auth.uid == userId`, reads for authed only.
- Tests (scaffolded, skipped): `tests/unit/data/firestore.rules.test.ts`, `tests/unit/data/rtdb.rules.test.ts`.

5) Observability & Performance
- `lib/observability/sentry.ts` already integrated; `app/layout.tsx` calls `initSentry()`.
- `lib/hooks/usePresence.ts`: Throttle cursor updates (~20 Hz) and pause/unsubscribe when tab hidden.
- `lib/hooks/useShapesSync.ts`: rAF batching and pause/resume on visibility.
- `components/canvas/CanvasStage.tsx`: Optional FPS meter.

6) Seed data for performance
- `scripts/seedCanvas.ts`: Seeds `/canvases/default` with 100+ shapes (80 rectangles, 20 texts).

## Testing Validation
- Lints: PASS on all modified files.
- Unit:
  - `tests/unit/canvas/shapelayer.render.test.tsx`: Verifies rect and text render.
  - Updated `tests/unit/canvas/stage.test.tsx` mocks (`Text`, `Line`) — render smoke remains PASS.
- Skipped:
  - Emulator rules tests (pending emulator harness/deps).
  - E2E scaffold `tests/e2e/canvas/text-and-rules.spec.ts` (skipped until emulator + auth harness).
- Manual (to run):
  - 'T' creates text; double-click/Enter opens editor; save persists and syncs.
  - With `NEXT_PUBLIC_SHOW_FPS=1` and seeded canvas, interactions remain ~60 FPS.

## Bugs & Fixes
- None observed in lints/tests. Note: `uuid` removed in favor of `crypto.randomUUID` fallback.

## Checkpoint Summary
- **Checkpoint:** Supermodule B — T1 (Shapes & Text) complete; T2 (Rules) authored + tests scaffolded; T3 (Perf/Obs) integrated.
- **Stability:** Green (lints pass; unit tests pass; E2E/rules tests skipped pending emulator).

## Next Steps
1. Wire Firebase Emulator in dev/test and implement rules tests using `@firebase/rules-unit-testing`.
2. Expand E2E to authenticated two-context flows; verify rules enforcement end-to-end.
3. Add optional JSON export (if prioritized) and finalize zIndex management for new creations.
4. Monitor Sentry for client errors during manual verification.


