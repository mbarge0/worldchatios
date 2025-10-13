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
