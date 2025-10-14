## Metadata
- **Phase:** 04
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/phase-04-05-reflect.md`

---

# Reflection — Module #4: Canvas Engine & UI

## 1) Phase Context
- **Date:** Oct 13, 2025
- **Duration:** ~1 working block (build + debug)
- **Objectives:** Integrate Konva stage with pan/zoom; selection (click/Shift/marquee); transform handles (move/resize/rotate); keyboard Delete/Esc/Arrow; ensure acceptance and regression.
- **Checkpoint:** Phase 04 build/debug logs updated (`phase-04-03-build.md`, `phase-04-04-debug.md`, `phase-04-05-debug.md`).

## 2) Achievements
- Canvas composite mounted under `AuthGuard` at `/c/[canvasId]` with full-viewport stage.
- Pan/zoom implemented with cursor-centered zoom and Space+drag panning.
- Selection: click, Shift multi, and marquee; transform handles: move, resize (min-size guard), rotate.
- Keyboard: Delete removes selected; Esc clears; Arrow nudge (Shift=10) with scale compensation.
- Tests: unit and E2E smoke pass; lints clean; acceptance and regression (Phases 01–03) verified.

## 3) Challenges
- Initial Stage not rendering due to zero container size at mount.
- Resize jitter and occasional flips when dragging corner handles.
- E2E flakiness from `AuthGuard` redirect on canvas route.

## 4) Root Cause Analysis
- Stage visibility: ResizeObserver delay meant container width/height were 0; Stage gated by size.
- Jitter/flips: Corner drag applied incremental transforms to evolving bbox; missing min-size guard; handle position in group coords.
- E2E: Assumption of authenticated context; guard correctly redirects when unauthenticated.

## 5) Process Evaluation
- Code aligned with architecture; components split (`CanvasStage`, `ShapeLayer`, `SelectionLayer`, `TransformHandles`).
- Tooling effective (Vitest + RTL, Playwright). Mocks for `react-konva` enabled fast unit tests.
- Documentation updated consistently across start/plan/build/debug.

## 6) Phase Performance Score
- **Score:** 92%
- **Rationale:** All acceptance criteria met with solid UX. Minor future work remains (perf under high node counts; advanced rotation math for extreme cases).

## 7) Key Learnings
- Initialize container size synchronously to avoid rendering gates waiting on observers.
- Use original snapshots + center-based scaling and rAF batching to stabilize transforms.
- Scale-compensated keyboard nudges feel consistent across zoom levels.

## 8) Actionable Improvements
- Add integration tests for selection/transform edge cases (min-size, rotate+resize).
- Profile performance with 100–500 nodes; add throttling/tuning hooks if needed.
- Introduce visual hover/active affordances for handles (accessibility focus states).

## 9) Forward Outlook
- Next Phase (Module #5: Data Model & Persistence):
  - Implement Firestore `canvases` and `shapes` schema; adapters; zIndex maintenance.
  - Wire store persistence (debounced writes on transforms) and JSON export utility.
  - Keep Canvas Engine APIs stable for sync integration in Module #6.

## 10) Reflection Summary
- We delivered a functional, performant canvas engine with stable transforms and controls, validated by tests and regression checks. The system is ready to persist shape state and enable real-time sync next.


