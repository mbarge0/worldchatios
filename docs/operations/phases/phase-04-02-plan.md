## Metadata
- **Phase:** 04
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/phase-04-02-plan.md`

---

# Planning Loop — Module #4: Canvas Engine & UI (MVP)

## 1) Phase Context
- **Phase:** 04 — Canvas Engine & UI
- **Date:** Oct 13, 2025
- **Reason for Planning Loop:** Break Phase 04 into actionable tasks with priorities, dependencies, effort, and regression coverage before build.
- **Current Progress Summary:**
  - Phase 03 delivered a stable `/c/[canvasId]` shell under `AuthGuard` (build/tests green).
  - Phase 04 start doc created (`phase-04-01-start.md`) with scope, risks, testing focus, and implementation plan.

## 2) Current Status
- **Completed:** Routing shell + auth guard; Phase 04 start scoped and approved.
- **In Repo:** No `react-konva`/`konva` yet; no `components/canvas/*` or `lib/store/canvas-store.ts` yet.
- **Toward Goals:** Ready to implement Konva stage, pan/zoom, selection, transforms, keyboard.

## 3) Issues and Blockers
- None blocking. Minor: add `react-konva` and `konva` dependencies.

## 4) Scope Adjustments
- No changes from start doc. Confirmed Module #4 targets: Stage + pan/zoom, selection (single/multi), transforms, keyboard.

## 5) Risk Assessment
- **Performance risk:** Frequent re-renders during transforms.
  - Mitigation: memoized nodes, batched state updates, throttled pointer/wheel handlers.
- **Interaction modality risk:** Marquee selection conflicts with pan/zoom.
  - Mitigation: pointer capture + explicit modes; Space for panning; Shift for multi-select.
- **Focus handling risk:** Keyboard shortcuts firing when stage not focused.
  - Mitigation: focusable container; scope handlers to focused element; preventDefault selectively.

## 6) Regression Plan
- **Affected Prior Systems:**
  - Module #2 Authentication: `AuthGuard`/login flow must remain intact.
  - Module #3 Routing & Shell: `/c/[canvasId]` route must remain reachable, error-free, and protected.
- **Master Manifest Reference:** `/docs/operations/regression/00_master_regression_manifest.md`
  - Table row: Module #4 depends on #3; regression scope includes #1–#3.
- **Must-Remain-Functional:**
  - Login and session (Phase 02).
  - Redirect protection for `/c/[canvasId]` (Phase 02/03).
  - Route rendering of canvas shell without Konva breaking layout (Phase 03).
- **Checks to Add in Debug Loop:**
  - Quick smoke: login → navigate to `/c/[canvasId]` → verify stage renders; no console errors; build still green.
  - Comprehensive: auth gate, route integrity, and performance sanity (60 FPS target during pan/zoom).

## 7) Updated Success Criteria
- Konva stage renders full viewport at `/c/[canvasId]`; pan/zoom smooth at 60 FPS.
- Selection works (single, Shift multi, marquee) with clear visuals.
- Transform handles support move/resize/rotate; top-left coordinates; rotate around center.
- Keyboard: Delete, Esc (cancel), Shift multi-select, Arrow nudge.
- `data-testid` markers enable deterministic tests.
- Unit/integration tests for stage, selection, transforms; basic E2E scaffold.
- No regressions to Modules #1–#3; build/tests remain green.

---

## 8) Task Summary (Priority, Dependencies, Effort, Mapping)

Legend: Priority (P1 highest), Effort (S ≤2h, M 2–4h, L ≥4h), Maps (PRD §2/§3; Checklist Module #4)

1. T1 — Add canvas dependencies
   - Description: Add `react-konva` and `konva` to project; verify SSR compatibility settings.
   - Priority: P1
   - Dependencies: None
   - Effort: S
   - Maps: PRD §2 (Canvas interactions); Checklist M4 “Integrate Konva stage and base layers”

2. T2 — Create canvas state store
   - Description: `lib/store/canvas-store.ts` with viewport (scale, position), selection (ids), interaction mode.
   - Priority: P1
   - Dependencies: None
   - Effort: M
   - Maps: PRD §2/§3 (selection, transforms); Checklist M4 (selection/keyboard)

3. T3 — Implement `CanvasStage` with pan/zoom
   - Description: `components/canvas/CanvasStage.tsx` rendering Stage/Layer; wheel/pan handlers; rAF batching.
   - Priority: P1
   - Dependencies: T1, T2
   - Effort: M
   - Maps: PRD §2 (pan/zoom 60 FPS); Checklist M4 (stage + pan/zoom)

4. T4 — Implement `SelectionLayer` (single/multi + marquee)
   - Description: Hit-testing for single select; marquee rect with rubber-band; Shift multi; visual outlines.
   - Priority: P1
   - Dependencies: T3, T2
   - Effort: M
   - Maps: PRD §2/§3 (selection); Checklist M4 (selection)

5. T5 — Implement `TransformHandles`
   - Description: Drag to move; resize handles; rotate handle; center-origin rotation.
   - Priority: P1
   - Dependencies: T3, T2
   - Effort: M
   - Maps: PRD §2/§3 (object manipulation); Checklist M4 (transform handles)

6. T6 — Keyboard interactions
   - Description: Delete, Esc (cancel), Arrow nudge; scoped to focused stage container.
   - Priority: P2
   - Dependencies: T2, T3
   - Effort: S
   - Maps: PRD §2 (manipulation); Checklist M4 (keyboard)

7. T7 — Test IDs and accessibility
   - Description: Add `data-testid` markers; ensure focusability and ARIA where applicable.
   - Priority: P2
   - Dependencies: T3–T5
   - Effort: S
   - Maps: Checklist testing expectations (M4)

8. T8 — Unit/Integration tests (stage, selection, transforms)
   - Description: Vitest/RTL tests for handlers and state updates.
   - Priority: P2
   - Dependencies: T3–T5, T7
   - Effort: M
   - Maps: PRD §5; Checklist M4 testing bullets

9. T9 — E2E scaffold for canvas basics
   - Description: Playwright test to render stage, basic pan/zoom/selection sanity.
   - Priority: P2
   - Dependencies: T3, T7
   - Effort: S
   - Maps: PRD §5; Checklist M12 (E2E), scoped to M4

10. T10 — Docs and acceptance verification
    - Description: Update phase build/debug docs; verify acceptance criteria.
    - Priority: P3
    - Dependencies: T3–T9
    - Effort: S
    - Maps: PRD §9; Checklist references

---

## 9) Dependency Graph (ASCII)

```
T1 (deps)     T2 (store)
   \           /
     \       /
       T3 (CanvasStage: pan/zoom)
          /           \
      T4 (Selection)  T5 (Transforms)
           \          /
            T7 (TestIDs)
             |\
             | T6 (Keyboard)
             |
             T8 (Unit/Integration) → T9 (E2E) → T10 (Docs)
```

Critical Path: T1 → T2 → T3 → (T4,T5) → T7 → T8 → T9 → T10

---

## 10) Task Breakdown (Detailed)

### T1 — Add canvas dependencies
- Acceptance:
  - `react-konva` and `konva` listed in `package.json`; app compiles.
  - No SSR/runtime errors on `/c/[canvasId]`.
- Steps:
  1. Add deps; import Stage/Layer in a stub component.
  2. Run dev build; verify no errors.
- Outputs: Updated `package.json`.

### T2 — Create canvas state store
- Acceptance:
  - Store exposes: `scale`, `position {x,y}`, `selectedIds: string[]`, `mode: 'idle'|'panning'|'marquee'|'transform'`.
  - Actions to set viewport, selection, and mode.
- Steps:
  1. Create `lib/store/canvas-store.ts` with typed state/actions.
  2. Unit tests for reducer-like actions.
- Outputs: `lib/store/canvas-store.ts`, tests.

### T3 — Implement CanvasStage with pan/zoom
- Acceptance:
  - Stage fills viewport; wheel zoom centered under cursor; panning with Space + drag.
  - 60 FPS under typical load; no layout shift; no console errors.
- Steps:
  1. `components/canvas/CanvasStage.tsx` with Stage/Layer.
  2. Wheel/pan handlers update store; throttle/memoize.
- Outputs: `components/canvas/CanvasStage.tsx`.

### T4 — Implement SelectionLayer
- Acceptance:
  - Click selects single object; Shift allows multi-select; marquee selects by overlap.
  - Visual outlines for selected objects; marquee visible during drag.
- Steps:
  1. Hit test integration; overlay marquee rect.
  2. Update selection in store; prevent conflict with panning.
- Outputs: `components/canvas/SelectionLayer.tsx`.

### T5 — Implement TransformHandles
- Acceptance:
  - Drag to move; handles for resize; rotate around center; emits deltas.
  - Works with single and multi-select (group transform basics).
- Steps:
  1. Add handle nodes; compute bounding box; apply transforms.
  2. Update store on interaction end.
- Outputs: `components/canvas/TransformHandles.tsx`.

### T6 — Keyboard interactions
- Acceptance:
  - Delete removes selected (local for now); Esc clears selection; Arrow nudges by 1px (Shift=10px).
  - Only fires when stage container focused.
- Steps:
  1. Focusable wrapper in `/c/[canvasId]/page.tsx`.
  2. Keydown handlers wired to store actions.
- Outputs: Integration in route page.

### T7 — Test IDs and accessibility
- Acceptance:
  - `data-testid` present on stage, selection, handles, and key nodes.
  - Focusable container with sensible tabIndex; ARIA labels where relevant.
- Steps:
  1. Add markers; verify via tests.
- Outputs: Marked components.

### T8 — Unit/Integration tests
- Acceptance:
  - Tests cover pan/zoom math, selection transitions, transform deltas.
  - All tests pass locally and in CI.
- Steps:
  1. Add `tests/unit/canvas/*.test.ts(x)`.
  2. Mock Konva where needed; test store updates.
- Outputs: Test files and passing CI run.

### T9 — E2E scaffold for canvas basics
- Acceptance:
  - Playwright test renders stage on `/c/[canvasId]`; performs basic pan/zoom/selection without errors.
- Steps:
  1. Add `tests/e2e/canvas/canvas-basic.spec.ts`.
  2. Use `data-testid` for selectors.
- Outputs: E2E spec passing locally.

### T10 — Docs and acceptance verification
- Acceptance:
  - Update build/debug docs with results; acceptance criteria confirmed.
- Steps:
  1. Update phase docs; note any deviations.
- Outputs: Updated docs.

---

## 11) Success Metrics
- 60 FPS during pan/zoom and simple transforms (manual profiling acceptable for MVP).
- Zero console errors in canvas route.
- Unit/integration tests pass; E2E scaffold green.
- Auth guard + routing unchanged and functional post-changes.

## 12) Checkpoint Schedule
- CP1: After T3 (stage pan/zoom in place)
- CP2: After T5 (selection + transforms)
- CP3: After T8/T9 (tests green)

## 13) Next Steps
1. Execute T1–T3 (critical path to interactive stage).
2. Proceed with T4–T5 (selection + transforms).
3. Add T6–T7 (keyboard + test IDs).
4. Complete T8–T10 (tests + docs) and run regression per manifest.


