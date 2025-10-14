## Metadata
- **Phase:** Supermodule A
- **Mode:** Agent
- **Output Path:** `/docs/operations/phases/sm-a-03-build.md`

---

# Build Log — Supermodule A: Data & Realtime Backbone (Modules 5–7)

## Phase Context
- **Session:** Begin Build
- **Date:** Oct 14, 2025
- **Goal:** Implement Tracks T1–T4 (Schema/Adapters, Realtime Sync, Presence/Cursors, Conflict & Write Strategy) and scaffold tests (T5) from `sm-a-02-plan.md`.
- **Branch:** realtime

## Build Objectives
- Add Firestore schema types and adapters for `canvases/{canvasId}` and `canvases/{canvasId}/shapes/{shapeId}`.
- Implement realtime Firestore listeners for shapes and RTDB presence with cursor broadcasting (~20 Hz).
- Implement transient `lockedBy` with 5s TTL, debounced writes (~75 ms), and finalization on mouseup.
- Wire hooks into canvas components; keep Canvas UI performance and routing intact.
- Add unit scaffolds and skipped E2E placeholders for presence and shapes sync.

## Implementation Log
1) Types and Firebase clients
- `types/database.ts`: Added `CanvasDoc`, `ShapeDoc` (rect/text), `LockedBy`, `UserPresence` with timestamps; zIndex field supported.
- `lib/firebase.ts`: Exported RTDB client `rtdb`; added `databaseURL` via `NEXT_PUBLIC_FIREBASE_DATABASE_URL`.

2) Firestore adapters (T1)
- `lib/data/firestore-adapter.ts`:
  - CRUD: `createCanvas`, `getCanvas`, `updateCanvas`, `deleteCanvas`.
  - Shapes CRUD: `createShape`, `updateShape`, `deleteShape`, `listShapes` (ordered by `zIndex`).
  - Realtime: `onShapesSnapshot`.
  - Locks: `setShapeLock`, `refreshShapeLock`, `clearShapeLock` (adds/updates `lockedBy` and `updatedAt`).

3) Realtime sync and store wiring (T2)
- `lib/store/canvas-store.ts`: Added `setNodes` action for replacing node list.
- `lib/hooks/useShapesSync.ts`: Subscribes to Firestore shapes and updates store; scaffolded echo-prevention tagging.
- `components/canvas/Canvas.tsx`: Wires `useShapesSync` and passes `canvasId` to stage.

4) Presence & cursors (T3)
- `lib/hooks/usePresence.ts`: Writes `presence/{canvasId}/{userId}`, sets `onDisconnect().remove()`, streams cursor positions at ~20 Hz, collects remote cursors.
- `components/canvas/CanvasStage.tsx`: Uses `usePresence(canvasId)`; converts pointer to world coords and broadcasts; renders remote cursors (line + label) on a dedicated layer.

5) Conflict handling & write strategy (T4)
- `lib/hooks/useShapeWriter.ts`: Debounced updates (~75 ms) during transforms; final write on mouseup; lock begin/refresh/clear with TTL (~5s) and periodic refresh.
- `components/canvas/TransformHandles.tsx`: Integrated writer — begin lock on drag start, debounced updates during drag/resize/rotate, final commit and lock clear on end.

6) Tests & scaffolds (T5)
- Unit
  - `tests/unit/sync/useShapeWriter.test.ts`: Debounce/commit sequencing (mocks adapter); uses fake timers.
  - `tests/unit/data/firestore-adapter.test.ts`: Export presence sanity for adapter API.
- E2E (skipped placeholders)
  - `tests/e2e/realtime/presence-and-cursors.spec.ts`: Two pages open same canvas; presence layer visible.
  - `tests/e2e/realtime/shapes-sync.spec.ts`: Two pages open same canvas; base layer visible (placeholder for full drag sync).

## Testing Validation
- Lints: PASS (file-level lint checks on all modified files show no errors).
  - Note: CLI `pnpm lint` blocked by Node v16 locally; requires Node ≥18.12. Repository-level linting pending environment bump.
- Unit: PASS (scaffolded tests compile and run locally with mocks; fake timers advance debounce window).
- E2E: SKIPPED (placeholders marked `describe.skip`; require authenticated multi-context and seeded data to run meaningfully).
- Manual: Canvas route `/c/[canvasId]` renders; stage, selection, and transforms unaffected by presence/sync wiring. Presence layer renders; cursors update visually under mouse move.

## Verify Routing and Navigation
- `/c/[canvasId]` remains under `AuthGuard`; dev mode auth override retains access in local env.
- Navigation and layout unaffected; stage renders without SSR issues (dynamic import preserved).

## Bugs & Fixes
- None observed during integration. Known caveats:
  - Echo-prevention currently scaffolded; full origin tagging/version checks to be completed alongside emulator tests.
  - Node version mismatch prevents repo-wide lint script; local file-level linting used as mitigation.

## Checkpoint Summary
- **Checkpoint:** Supermodule A — T1–T4 implemented; T5 tests scaffolded.
- **Stability:** Green (no lints at file-level; unit scaffolds run; E2E placeholders skipped).
- **Ready for Debug Loop:** Yes — proceed to refine echo-prevention and add emulator-based integration tests.

## Next Steps
1. Add origin tagging to write path and ignore-loop logic in `useShapesSync` (compare `updatedAt`/origin map).
2. Add Firebase Emulator config for Firestore/RTDB integration tests.
3. Implement minimal JSON export (Module 5 acceptance) or defer to Shapes module if scheduled later.
4. Expand E2E to authenticated two-context flows; remove `skip` when environment ready.
5. Prepare Debug Report for Supermodule A with regression verification for Phases 01–04.
