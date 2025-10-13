## Metadata
- **Phase:** 04
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/phase-04-01-start.md`

---

# Phase Starter — Module #4: Canvas Engine & UI (MVP)

## 1) Phase Overview
- **Phase Number/Name:** 04 — Canvas Engine & UI (MVP)
- **Date:** Oct 13, 2025
- **Previous Phase Summary (from handoff):**
  - Module #3 established a stable, test-ready canvas route shell under `AuthGuard` with `app/c/[canvasId]/page.tsx`. Build/tests are green; phase docs updated. Minimal 404 placeholder and tests were queued. Ready to proceed into Canvas Engine & UI with strong continuity and low risk.
- **Objectives & Deliverables for Phase 04:**
  - Integrate Konva stage and base layers with smooth pan/zoom at 60 FPS.
  - Implement selection (single and multi-select via shift/marquee).
  - Add transform handles: move/resize/rotate.
  - Keyboard interactions: Delete, Esc (cancel), Shift multi-select, Arrow nudge.
  - Wire `data-testid` markers for stable testing.
  - Align with architecture and dev checklist Module #4 acceptance criteria.

## 2) Scope
### Included
- Canvas stage using Konva (`react-konva`) rendering full viewport within `/c/[canvasId]`.
- Pan/zoom interactions with throttling to maintain 60 FPS.
- Selection model and marquee selection overlay.
- Transform handles for rectangle and text nodes (foundation for Module #8).
- Keyboard shortcuts for delete/cancel/multi-select/nudge.
### Excluded/Deferred
- Realtime presence/cursors and Firestore listeners (covered in Modules #6–#7).
- Persistence (Module #5) beyond local state scaffolding.
- Additional shapes beyond rectangle and text behavior wiring (Module #8 handles creation/editing specifics).
- Undo/redo, snapping/guides, grouping, layers panel (stretch goals).

## 3) Risks and Assumptions
### Risks
- Performance regressions if re-render frequency is not controlled; mitigate via memoization and batched state updates.
- Interaction conflicts between marquee selection and pan/zoom; require clear modality and pointer-capture logic.
- Keyboard focus issues inside Next.js app router; ensure stage container is focusable.
### Assumptions
- AuthGuard and `/c/[canvasId]` shell are stable (Phase 03 complete).
- `react-konva` and `konva` will be added as dependencies.
- State management via Zustand is available (`lib/store/*`) per architecture plan.
- Data model for shapes will align with PRD/architecture but persistence will be integrated later.

## 4) Testing Focus
### Unit/Integration
- Stage renders with expected viewport and attaches wheel/pan handlers.
- Selection and marquee logic correctly updates selected IDs and visuals.
- Transform handles invoke move/resize/rotate callbacks with expected deltas.
- Keyboard shortcuts operate only when stage focused; do not fire globally.
### E2E (scaffolding in this phase; full flows later)
- Navigate to `/c/[canvasId]` (authenticated) and see the canvas stage.
- Perform basic pan/zoom and selection interactions; verify `data-testid` markers.
### Example Test Paths
- `tests/unit/canvas/stage.test.tsx`
- `tests/unit/canvas/selection.test.ts`
- `tests/unit/canvas/transforms.test.ts`
- `tests/e2e/canvas/canvas-basic.spec.ts`

## 5) Implementation Plan
1. Add dependencies: `react-konva`, `konva`.
2. Create `components/canvas/CanvasStage.tsx` rendering Stage + Layer with pan/zoom.
3. Create `components/canvas/SelectionLayer.tsx` with marquee and selected bounding boxes.
4. Create `components/canvas/TransformHandles.tsx` to expose resize/rotate handles and drag.
5. Introduce `lib/store/canvas-store.ts` (Zustand) for objects, selection, UI state (pan/zoom).
6. Wire keyboard handlers within a focusable container at `app/c/[canvasId]/page.tsx`.
7. Add `data-testid` to key nodes for tests.
8. Write unit/integration tests for stage, selection, transforms; add a basic E2E scaffold.

## 6) Expected Outcome
- Definition of Done:
  - Konva stage renders at `/c/[canvasId]` with smooth pan/zoom, selection, and transforms.
  - Keyboard interactions function when stage focused.
  - Unit/integration tests for stage, selection, transforms pass locally and in CI.
  - E2E scaffold for canvas interaction created and passing basic checks.
  - Build remains green; no regressions to routing/auth.

## 7) Checkpoint Preparation
- Verify: AuthGate + route are stable; tests/build green.
- Verify: Dependencies to add: `react-konva`, `konva` (none present yet in `package.json`).
- Verify: No breaking changes to PRD/architecture; Module #4 acceptance criteria aligned.
- Suggested commit message for phase start:
  - `docs(phase-04): start Module #4 — Canvas Engine & UI; scope, plan, tests`


