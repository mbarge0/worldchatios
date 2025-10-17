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



## Supermodule — AI Agent, LangChain Orchestration, Voice & Brand UX (Modules B1–B5)

Purpose: Deliver a fully interactive AI Agent capable of tool use via the OpenAI API and LangChain orchestration, integrated with chat and voice interfaces, unified AI state, and visual polish applying Matt Barge personal brand colors.

Contained Modules:
- B1) OpenAI Integration
- B2) LangChain Orchestration Layer
- B3) Chat Interface Front-End
- B4) Voice Input & Output
- B5) Shared AI State, Persistence & Personal Brand UI

References:
- Requirements: `/docs/requirements/requirements2.md`
- Architecture/PRD: `/docs/foundation/architecture.md`, `/docs/foundation/prd.md`

---

## Module B1: OpenAI Integration

- [ ] [Build] Set up Next.js API route `/api/openai` proxying to OpenAI API.
  - Acceptance: supports function calling to registered canvas tools (`createShape`, `moveShape`, etc.); rate-limited to 3 QPS/user.
  - Testing: integration with mock OpenAI responses; rate limit verification.
- [ ] [Build] Secure environment variables via `.env.local` (`OPENAI_API_KEY`).
  - Acceptance: no keys exposed client-side; errors handled gracefully.
  - Testing: manual failure injection + logging checks.

---

## Module B2: LangChain Orchestration Layer

- [ ] [Build] Create orchestration pipeline using LangChain or LangGraph for multi-turn reasoning.
  - Acceptance: agent can interpret natural language → select appropriate tool → act → respond.
  - Testing: simulated prompts like "move the blue rectangle 10 pixels right."
- [ ] [Build] Define memory and context management strategy (ephemeral vs persisted state).
  - Acceptance: short conversation memory; cleared after idle 10 min.
  - Testing: confirm state expiry and reinitialization.
- [ ] [Validate] Logging of agent reasoning chain (debug mode only).
  - Acceptance: recorded to console or Firestore log for inspection.

---

## Module B3: Chat Interface Front-End

- [ ] [Build] Add collapsible chat drawer on right side of canvas.
  - Acceptance: opens via toolbar button or shortcut; resizable; sticky input at bottom.
  - Testing: e2e user-to-agent chat flow.
- [ ] [Build] Show agent responses inline, including any triggered actions or error messages.
  - Acceptance: visible "Assistant" avatar and distinct bubble style.
- [ ] [Build] Contextual tool buttons (e.g., "Undo last AI action").
  - Acceptance: clicking tool action replays last command.
  - Testing: interaction + visual.

---

## Module B4: Voice Input & Output

- [ ] [Build] Implement browser-based microphone input via Web Speech API.
  - Acceptance: converts speech to text, populates chat input.
  - Testing: manual verification in Chrome/Edge.
- [ ] [Build] Enable speech synthesis for agent responses.
  - Acceptance: agent replies spoken aloud with adjustable rate/pitch.
  - Testing: audio playback correctness and browser compatibility.
- [ ] [Validate] Voice control toggle in chat drawer.
  - Acceptance: accessible via keyboard; status visible (active/muted).

---

## Module B5: Shared AI State, Persistence & Personal Brand UI

- [ ] [Build] Persist AI session context in Firestore (conversation + tool history).
  - Acceptance: restored on reload; session scoped to user and canvas.
  - Testing: reload restores last few messages.
- [ ] [Build] Apply Matt Barge brand palette:
  - Colors:
    - Dark Blue #072d51
    - Gold #cfa968
    - White #ffffff
    - Light Blue #cdd2c5
  - Acceptance: login hero image, toolbar, and chat drawer adopt this theme.
- [ ] [Build] Apply UX polish:
  - Move toolbar to left side (to avoid macOS dock conflict)
  - Improve zoom smoothness and shape placement under zoom context
  - Acceptance: interactions performant at 60 FPS.
- [ ] [Validate] Accessibility + contrast check post-theme.
  - Testing: axe audit passes with no critical violations.

---

Unified Dependencies
- OpenAI API (via server proxy)
- LangChain JS or LangGraph
- Firestore for persistence
- Web Speech API
- Canvas Engine + Toolbar

Unified Acceptance
- Full end-to-end AI chat flow works: user → chat → tool → visual action → response.
- Voice input/output operates reliably in supported browsers.
- Personal branding consistent throughout UI (color palette, hero image, contrast).
- No performance regressions (<100ms tool latency; 60 FPS interaction).

Testing Focus
- Unit: Tool schema handlers; LangChain pipeline; voice utils.
- Integration: Chat UI with API calls; state persistence; speech toggles.
- E2E: "Draw a circle" → AI creates object; reload → state persists; voice input/output stable.

---

## Module #13: Tune-Up Sprint (UI + Brand Integration)

- Date: 2025-10-17
- Owner: Matt Barge
- Status: Not Started

Context: Final polish, performance tuning, and personal brand alignment after AI Agent integration; incorporates Ash’s MVP review feedback. Treated as a mini supermodule with its own structure, tracking, and completion criteria.

Goals:
- Visual refresh and brand alignment across login, toolbar, chat drawer, and canvas.
- Toolbar reposition to left, consolidate alignment controls, and reduce size.
- Canvas performance improvements (zoom/drag responsiveness) and shape spawn at viewport center.

Submodules:
- [13A — Brand & UI Enhancements](#submodule-13a-brand--ui-enhancements)
- [13B — Toolbar Refactor](#submodule-13b-toolbar-refactor)
- [13C — Canvas Experience Improvements](#submodule-13c-canvas-experience-improvements)
- [13D — Documentation Cleanup](#submodule-13d-documentation-cleanup)

References: `/docs/foundation/prd.md`, `/docs/foundation/architecture.md`

---

### Submodule 13A: Brand & UI Enhancements

- [ ] [Plan] Define brand tokens (colors, typography scale) and apply via CSS variables
  - Acceptance: tokens available in `app/globals.css` and referenced in UI components.
  - Testing: visual regression screenshots updated; contrast ratios AA+ for text/UI controls.
- [ ] [Build] Repaint login right panel with brand palette and modern background
  - Acceptance: login page shows branded right panel (gradient/texture/image) aligned to palette.
  - Testing: e2e login renders branded layout; a11y scan passes (axe) with no critical issues.
- [ ] [Build] Apply consistent brand colors to toolbar and chat drawer
  - Acceptance: toolbar and chat drawer adopt brand background/foreground, hover/active states.
  - Testing: snapshot of toolbar/chat drawer; interactive hover/focus states verified.
- [ ] [Build] Refresh canvas background and typography across main app
  - Acceptance: subtle canvas backdrop (brand-friendly neutral) and updated heading/body styles.
  - Testing: visual diff shows updated typography scale; no overflow/regression in responsive layouts.
- [ ] [Validate] Accessibility and contrast review post-theme
  - Acceptance: all interactive elements achieve AA contrast; focus rings visible and unobstructed.
  - Testing: axe audit; keyboard-only nav through login, toolbar, and chat drawer.

Dependencies: Authentication & Canvas UI; Chat Interface Front-End; Personal Brand UI tasks in Module B5.

---

### Submodule 13B: Toolbar Refactor

- [ ] [Build] Move toolbar to left-hand side
  - Acceptance: toolbar docks to left; does not collide with macOS dock; persists across routes.
  - Testing: e2e verifies position and visibility across viewport sizes.
- [ ] [Build] Consolidate alignment buttons into a grouped control
  - Acceptance: Align/Distribute actions presented as a single grouped menu or flyout.
  - Testing: unit tests for alignment math still pass; e2e triggers from grouped control.
- [ ] [Build] Reduce toolbar width and improve layout hierarchy
  - Acceptance: compact sizing (icons + labels where needed), clear primary vs secondary groupings.
  - Testing: visual snapshot; hit-target sizes ≥ 40px for touch accessibility.
- [ ] [Validate] Keyboard access and tooltips
  - Acceptance: all controls keyboard-focusable with tooltips/ARIA labels; shortcuts displayed.
  - Testing: axe and keyboard traversal; tooltip visibility on focus/hover.

Dependencies: Canvas Engine & UI; Advanced Features Suite (alignment/distribute); Shared AI State UI surfaces.

---

### Submodule 13C: Canvas Experience Improvements

- [ ] [Build] Optimize Konva rendering for smoother drag/zoom
  - Acceptance: 60 FPS interactions on 500+ shapes; no noticeable input lag on pan/zoom.
  - Testing: manual profiling; ensure rAF-driven updates and unnecessary layer redraws avoided.
- [ ] [Build] Adjust shape spawn logic to respect current viewport center
  - Acceptance: creating shapes spawns at the current viewport’s visual center at any zoom level.
  - Testing: e2e create-after-zoom places items within ±16px of viewport center.
- [ ] [Build] Add subtle grid or texture background
  - Acceptance: non-intrusive background (grid/texture) that complements brand; no perf regression.
  - Testing: toggle/visibility verified; frame times stable within ±2 ms of baseline.
- [ ] [Validate] Interaction latency and smoothness
  - Acceptance: drag latency <16 ms/frame; wheel/zoom curve feels linear and predictable.
  - Testing: repeatable profiling notes captured; no stutter under typical loads.

Dependencies: Canvas Engine & UI; Observability & Performance; Advanced Features (optional grid interop).

---

### Submodule 13D: Documentation Cleanup

- [ ] [Build] Prune outdated docs and consolidate brand/UI guidance
  - Acceptance: removed superseded drafts; updated references to brand tokens and UI locations.
  - Testing: internal link check passes; no dead links to removed docs.
- [ ] [Validate] Update screenshots in README/dev docs post-refresh
  - Acceptance: screenshots reflect new login, toolbar (left), and chat drawer styling.
  - Testing: visual verification; paths correct and load in repo.

Dependencies: Completion of visual refresh tasks in 13A–13C.

---

Completion Criteria (Deliverables):
- Visual updates consistent with Matt’s brand palette across login, toolbar, chat drawer, and canvas.
- Toolbar relocated to left and simplified with grouped alignment controls.
- Canvas interactions feel smoother (no noticeable lag) with improved drag/zoom.
- Shape creation appears at the viewport’s focus area.
- Documentation pruned and clean with updated visuals.

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
