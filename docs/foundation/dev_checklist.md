# CollabCanvas — Development Checklist

---

## Overview

- Scope: Convert PRD and Architecture into actionable, testable tasks for MVP and Final.
- Documents: references `docs/foundation/prd.md` and `docs/foundation/architecture.md`.
- Estimated tasks: ~100.

Structure: grouped by module and milestone (MVP first, then Final AI). Each task includes acceptance criteria and testing expectations.

---

## Milestones

- MVP (Day 1–2): Auth, Canvas, Shapes/Transforms, Realtime/Presence, Persistence, Export, Deployment, Observability, Security Rules, E2E.
- Final (Day 3–7): AI agent, polish, additional tests and performance hardening.

---

## Module #1: Environment & Tooling (MVP)

- [ ] Initialize Firebase project and SDKs (Auth, Firestore, RTDB)
  - Acceptance: `.env.local` set; Firebase apps initialize without runtime errors.
  - Testing: dev boot, mock Firebase in unit tests.
- [ ] Configure Vercel env vars for Firebase + OpenAI (final placeholder)
  - Acceptance: `vercel env pull` works locally; no secrets in repo.
  - Testing: deploy preview runs without missing envs.
- [ ] Add Sentry client SDK and basic config
  - Acceptance: test error is captured in Sentry.
  - Testing: manual throw in dev, verify event.
- [ ] Set up Vitest + React Testing Library + Playwright
  - Acceptance: `pnpm test` and `pnpm e2e` run locally and in CI.
  - Testing: sample unit and e2e pass.

Dependencies: none.

---

## Module #2: Authentication (MVP)

- [ ] Implement Firebase Auth (Email/Password + Magic Link)
  - Acceptance: users can sign up/sign in; Magic Link flow completes.
  - Testing: unit for auth hooks; e2e login flow.
- [ ] Auth gate for canvas route (`/c/[canvasId]`)
  - Acceptance: unauthenticated users redirected to login; authenticated can access.
  - Testing: e2e with two contexts, one authed, one not.
- [ ] User profile display name fallback (email prefix)
  - Acceptance: cursors show readable labels.
  - Testing: unit for formatter.

Dependencies: Environment & Tooling.

---

## Module #3: Routing & Shell (MVP)

- [ ] Next.js App Router scaffold for `/c/[canvasId]`
  - Acceptance: route renders canvas shell; 404 for invalid ids.
  - Testing: unit for route component; e2e navigation.

Dependencies: Authentication.

---

## Module #4: Canvas Engine & UI (MVP)

- [ ] Integrate Konva stage and base layers
  - Acceptance: stage renders full-viewport; pan/zoom works smoothly at 60 FPS.
  - Testing: integration: render, wheel/pan handlers.
- [ ] Selection: single and multi-select (shift/marquee)
  - Acceptance: selection boxes highlight nodes; multi-select transforms together.
  - Testing: integration: hit test, marquee select.
- [ ] Transform handles: move/resize/rotate
  - Acceptance: handles appear and operate; origin at shape center; top-left coordinates.
  - Testing: integration: drag/resize/rotate interactions.
- [ ] Keyboard: Delete, Esc, Shift multi-select, Arrow nudge
  - Acceptance: keys perform as specified.
  - Testing: integration: key events.

Dependencies: Routing & Shell.

---

## Module #5: Data Model & Persistence (MVP)

- [ ] Firestore collections: `canvases/{canvasId}` + subcollection `shapes/{shapeId}`
  - Acceptance: CRUD works with schema; Timestamps set; zIndex maintained.
  - Testing: unit for adapters; integration with Firebase emulator.
- [ ] JSON export (canvas + shapes)
  - Acceptance: downloads valid JSON; re-import round-trip in dev util.
  - Testing: unit: serialization; e2e: export button.

Dependencies: Authentication, Environment & Tooling.

---

## Module #6: Realtime Sync & Presence (MVP)

- [ ] RTDB presence at `presence/{canvasId}/{userId}` with onDisconnect
  - Acceptance: online users list updates; node removed on disconnect.
  - Testing: e2e two-browser presence.
- [ ] Labeled cursors streamed at ~20 Hz
  - Acceptance: other user’s cursor moves <50 ms perceived; labels and colors render.
  - Testing: e2e cursor sync.
- [ ] Firestore listeners for shapes
  - Acceptance: creation and updates propagate <100 ms typical.
  - Testing: e2e move/resize/rotate sync.

Dependencies: Data Model & Persistence, Canvas Engine & UI.

---

## Module #7: Conflict Handling & Write Strategy (MVP)

- [ ] Transient `lockedBy` during transforms with 5s TTL
  - Acceptance: competing edits minimized; lock clears on mouseup/timeout.
  - Testing: e2e with two users contending.
- [ ] Debounced writes (~75 ms) during transforms; final write on mouseup
  - Acceptance: smooth local transforms; minimal write load; consistent end state.
  - Testing: unit for debounce; e2e stress move.

Dependencies: Realtime Sync & Presence.

---

## Module #8: Shapes & Text (MVP)

- [ ] Rectangle: create/move/resize/rotate/delete
  - Acceptance: meets data schema; solid fill/stroke; opacity; zIndex.
  - Testing: unit reducers; e2e create and transform.
- [ ] Text: create/edit/move/resize/rotate/delete
  - Acceptance: font size/family/weight; textAlign; lineHeight; solid colors.
  - Testing: integration text editing; e2e persistence.
- [ ] Optional Circle (time permitting)
  - Acceptance: behaves like rectangle; solid colors.
  - Testing: integration shape creation.

Dependencies: Canvas Engine & UI, Data Model & Persistence.

---

## Module #9: Security Rules (MVP)

- [ ] Firestore rules: auth required; read/write allowed for any authenticated user on existing `canvasId`
  - Acceptance: unauthorized blocked; authorized allowed; emulator tests pass.
  - Testing: rules unit tests with emulator.
- [ ] RTDB rules: restrict writes to `presence/{canvasId}/{userId}` by same `userId`
  - Acceptance: cross-user writes blocked; onDisconnect allowed.
  - Testing: rules tests.

Dependencies: Authentication, Data Model & Persistence.

---

## Module #10: Observability & Performance (MVP)

- [ ] Sentry errors capture on client
  - Acceptance: errors visible in Sentry project.
  - Testing: manual verify.
- [ ] Performance: batch state updates, rAF-driven renders, unsubscribe on hidden tab
  - Acceptance: 60 FPS interactions with 100+ objects in dev.
  - Testing: manual profiling; add perf assertions if feasible.

Dependencies: Environment & Tooling, Canvas Engine & UI.

---

## Module #11: Deployment (MVP)

- [ ] Vercel deploy with Firebase env vars
  - Acceptance: app accessible publicly; auth works; presence and sync verified.
  - Testing: smoke e2e on deployment URL.

Dependencies: All MVP core modules.

---

## Module #12: Cross-Module Testing & QA (MVP)

- [ ] E2E: Two users join same canvas; presence and labeled cursors visible
- [ ] E2E: Create/move/resize/rotate rectangle and text; real-time sync
- [ ] E2E: Refresh mid-edit; state persists
- [ ] E2E: Export JSON
- [ ] Manual QA matrix across Chrome/Safari/Firefox/Edge

Acceptance: all pass reliably; flakiness addressed.

---

## Supermodule — Pre-AI Reliability, Persistence, Auth & Advanced Features (Modules A1–A5)

Purpose: Harden multiplayer correctness, persistence, and UX prior to the AI phase; add low-risk advanced features from the rubric; and abstract canvas actions to callable functions for the upcoming agent.

Contained Modules:
- A1) Conflict Resolution 2.0
- A2) Persistence & Reconnection
- A3) Authentication & Canvas UI Polish
- A4) Advanced Features Suite
- A5) AI-Ready Shape Action Abstractions

References:
- Requirements: `/docs/requirements/requirements2.md` (Sections 1 & 3)
- Architecture/PRD: `/docs/foundation/architecture.md`, `/docs/foundation/prd.md`
- Handoff: `/docs/operations/phases/sm-d2-04-debug.md`

---

## Module A1: Conflict Resolution 2.0

- [ ] [Build] Shape transform sessions with explicit lifecycle (`start`, `update`, `end`) in store
  - Acceptance: session created on mousedown; cleared on mouseup/cancel; state consistent when multiple rapid updates occur.
  - Dependencies: Canvas Engine & UI; Data Model & Persistence.
  - Testing: unit tests for session reducer; integration drag/resize storm.
- [ ] [Build] Ephemeral `lockedBy` with TTL + visual indicator
  - Acceptance: when a user is transforming, `lockedBy` is set (5s TTL) and other clients see subtle lock UI (handle tint + tooltip "Editing: <name>").
  - Testing: e2e two-users contention; verify lock clears on end/timeout.
- [ ] [Build] Write arbitration: last-write-wins using `serverTimestamp` and `actorId`
  - Acceptance: simultaneous updates converge; no duplicates/ghost nodes after thrash.
  - Testing: e2e Simultaneous Move and Rapid Edit Storm scenarios (see requirements2.md).
- [ ] [Build] Safe-cancel on delete vs edit
  - Acceptance: deleting a locked/being-edited object cancels remote session; other client’s UI reverts without error.
  - Testing: e2e Delete vs Edit.
- [ ] [Validate] Metrics log for contention events (Sentry breadcrumb)
  - Acceptance: when arbitration triggers, a breadcrumb with shapeId/actorIds recorded (no PII).
  - Testing: manual verify breadcrumb appears.

---

## Module A2: Persistence & Reconnection

- [ ] [Build] Mid-edit refresh rollback to last committed state
  - Acceptance: if page unloads during transform, object restores to its pre-drag state on reload; no partial positions saved.
  - Dependencies: Module A1 sessions; existing debounced writes.
  - Testing: e2e Mid-Operation Refresh scenario.
- [ ] [Build] `beforeunload` cleanup for `lockedBy` and transient UI state
  - Acceptance: refresh/close clears local lock and session; no stale locks when returning.
  - Testing: integration with simulated unload.
- [ ] [Build] Connection status indicator (connected/reconnecting/offline)
  - Acceptance: small status chip visible; states reflect emulator network toggles.
  - Testing: e2e Network Simulation (0 kbps for 30s) then recover.
- [ ] [Build] Local operation queue for short disconnects (UI-only, idempotent on commit)
  - Acceptance: up to 10 buffered ops replay on reconnect; state converges; duplicates avoided via op ids.
  - Testing: integration with throttled network; assertions on final state.

---

## Module A3: Authentication & Canvas UI Polish

- [ ] [Plan] Update wireframe to two-column login with hero image and accessible form
  - Acceptance: design aligns with screenshot reference; states defined for error/loading.
  - Testing: design review checklist.
- [ ] [Build] Implement revamped `/login` with Email/Password + Magic Link toggle
  - Acceptance: responsive layout; keyboard/focus styles; remember-me checkbox (local state only); error toasts via `components/ui/Toast`.
  - Dependencies: Authentication module; UI components.
  - Testing: e2e login flows for both methods; a11y checks (axe) pass.
- [ ] [Validate] Security pass
  - Acceptance: no credentials logged; rate-limit auth attempts (client debounce + Firebase defaults); Sentry excludes auth payloads.
  - Testing: unit on input sanitization; manual inspection.
- [ ] [Build] Bottom-docked toolbar with primary actions (select, rect, text, duplicate, delete, align menu, z-index menu, export)
  - Acceptance: toolbar visible on canvas route; icons labeled with tooltips; keyboard hints shown.
  - Testing: integration render + click handlers; snapshot.
- [ ] [Build] Page frame visuals (light background, blue page outline) per reference
  - Acceptance: canvas shows subtle page boundary; no perf regressions.
  - Testing: visual assertion in e2e screenshot.
- [ ] [Validate] Accessibility sweep of login and toolbar
  - Acceptance: all controls reachable via keyboard; ARIA labels present; focus rings visible.
  - Testing: manual + axe checks.

---

## Module A4: Advanced Features Suite

- [ ] [Build] Centralized keymap with scope (stage vs input) and conflict-safe handlers
  - Acceptance: Delete removes selection; Cmd/Ctrl+D duplicates; Arrow keys nudge (1px) with Shift for 10px.
  - Testing: unit for keymap; e2e keyboard interactions.
- [ ] [Build] Export whole canvas to PNG via `Stage.toDataURL()` with scale selector
  - Acceptance: downloads PNG; result dimensions match selected scale; background color preserved.
  - Testing: integration mocks `toDataURL`; e2e button click downloads.
- [ ] [Build] Export selection to PNG (bounds crop)
  - Acceptance: when shapes selected, export uses tight bounding box.
  - Testing: integration compute-bounds unit; e2e happy path.
- [ ] [Build] Basic SVG export for supported shapes (rect, circle, text)
  - Acceptance: generates minimal SVG markup; opens correctly in browsers.
  - Testing: unit snapshot of SVG string for sample scene.
- [ ] [Build] Toggleable grid (8px default) with lightweight rendering
  - Acceptance: grid overlay toggles from toolbar; persists per-canvas in local storage.
  - Testing: unit for preference; manual perf check.
- [ ] [Build] Snap on move/resize to nearest grid lines with magnet radius
  - Acceptance: objects snap within 6px; hold Alt/Option to temporarily disable.
  - Testing: unit math functions; e2e drag behaviour.
- [ ] [Build] Simple smart guides (center/edge alignment between selected items)
  - Acceptance: guide lines appear when centers/edges align; disappear on release.
  - Testing: integration with 2+ shapes.
- [ ] [Build] Align Left/Right/Top/Bottom/Center (horizontal/vertical) for multi-selection
  - Acceptance: positions calculated using selection bounds; maintains zIndex order.
  - Testing: unit math for alignment; e2e with 3 rectangles.
- [ ] [Build] Distribute Horizontally/Vertically
  - Acceptance: even spacing between outermost items.
  - Testing: unit for distribution gaps; e2e verify pixels.
- [ ] [Build] Bring to Front / Send to Back / Step Forward / Step Backward
  - Acceptance: updates `zIndex` and persists; rendering order matches expectation.
  - Testing: unit reorder helper; e2e via toolbar actions.
- [ ] [Validate] Rules for unique `zIndex`
  - Acceptance: no duplicate zIndex after operations; normalization utility corrects sequence.
  - Testing: unit normalization.
- [ ] [Build] Snapshot subcollection `versions/{versionId}` on demand
  - Acceptance: snapshot stores canvas meta + shapes array with author and timestamp.
  - Dependencies: Data Model & Persistence.
  - Testing: unit serialize/deserialize; emulator write/read.
- [ ] [Build] Restore snapshot (non-destructive) as a new snapshot with pointer
  - Acceptance: restore applies to current canvas and records prior state as another snapshot.
  - Testing: e2e create → modify → restore flow.
- [ ] [Validate] Basic retention policy
  - Acceptance: keep last 20 snapshots per canvas; older pruned client-side.
  - Testing: unit prune utility.

Unified Dependencies: Canvas Engine & UI, Selection, Toolbar; Data Model & Persistence for versioning; download permissions for export.

Unified Acceptance & QA: All features are accessible via toolbar/shortcuts; Playwright verifies keyboard actions, snapping/guides, alignment, z-index, and PNG/SVG downloads with pixel/DOM assertions; unit coverage for math/utilities ≥80% for this module.

---

## Module A5: AI-Ready Shape Action Abstractions

- [ ] [Build] Extract idempotent action helpers in `lib/ai/actions.ts`
  - Acceptance: exported functions: `createShape`, `createText`, `moveShape`, `resizeShape`, `rotateShape`, `alignShapes`, `zIndexUpdate`, `exportCanvas`, `exportSelection` with explicit types and return values.
  - Dependencies: Canvas store and Firestore adapter.
  - Testing: unit tests per action with mocked adapters; type tests compile.
- [ ] [Build] Single source of truth: UI uses helpers (no duplicate logic)
  - Acceptance: canvas toolbar and keyboard handlers call the same helpers used by AI later.
  - Testing: integration: spy that helper invoked from UI.

---



## Module #13: AI Agent & Tools (Final)

- [ ] Tool schema: `createShape`, `moveShape`, `resizeShape`, `rotateShape`, `createText`, `getCanvasState`
  - Acceptance: functions validated; unit tests for handlers.
  - Testing: unit + contract tests.
- [ ] Next.js API proxy to OpenAI with function calling
  - Acceptance: prompts invoke tools; errors handled; rate limit 3 QPS/user.
  - Testing: integration with mocked OpenAI.
- [ ] Agent identity and broadcast
  - Acceptance: actions appear as bot user; changes sync in real time.
  - Testing: e2e two-user + agent scenario.
- [ ] Minimal chat UI drawer (final only)
  - Acceptance: submit prompt; shows tool call/action result.
  - Testing: integration UI flow.

Dependencies: MVP complete, Environment & Tooling.

---

## Module #14: Cross-Module Testing & QA (Final)

- [ ] Full-suite E2E regression with AI enabled
  - Acceptance: all MVP E2Es pass with AI features enabled; add scenarios involving AI + human edits co-occurring.
  - Testing: Playwright two-user + agent flows; stress on create/move/resize/rotate via tools.
- [ ] Manual QA matrix re-run (AI build)
  - Acceptance: Chrome/Safari/Firefox/Edge checks; latency targets; reconnect; presence; AI action visibility.
  - Testing: checklist-based manual verification logged.

Dependencies: Module #13.

---

## Module #15: Deployment (Final)

- [ ] Production build & deploy with AI env vars
  - Acceptance: deployment succeeds; AI API keys configured; no secrets leaked.
  - Testing: smoke E2E on prod URL with AI enabled.
- [ ] Post-deploy validation (AI build)
  - Acceptance: presence, shapes sync, and AI actions verified in production.
  - Testing: quick two-user+agent session; capture Sentry logs.

Dependencies: Module #14.

---

## Module #16: Post-Deployment Regression (Final)

- [ ] Cross-module regression after AI deployment
  - Acceptance: repeat core MVP and AI scenarios; no regressions found or fixed.
  - Testing: Playwright suite re-run; manual QA sign-off.
- [ ] Final performance pass
  - Acceptance: 60 FPS interactions; <100 ms object sync; <50 ms cursor; 5–8 users; 500+ shapes with acceptable FPS.
  - Testing: profiling notes; adjust throttles if needed.

Dependencies: Module #15.

---

## Completion Definition

- 100% of MVP tasks checked and verified; deployment live; E2E suite green.
- Final AI tasks delivered; basic AI flows work end-to-end and broadcast to all users.
- Performance targets met (60 FPS, <100 ms object sync, <50 ms cursor sync, 5–8 users, 500+ shapes).

---

## References

- PRD: `/docs/foundation/prd.md`
- Architecture: `/docs/foundation/architecture.md`
- Evaluation: `/docs/requirements/evaluation_criteria.md`
