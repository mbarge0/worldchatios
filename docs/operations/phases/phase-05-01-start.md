## Metadata
- **Phase:** 05
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/phase-05-01-start.md`

---

# Phase Starter — Supermodule: Pre-AI Reliability, Persistence, Auth & Advanced Features (A1–A5)

Use this document to kick off the new supermodule phase defined in `docs/foundation/dev_checklist.md` as Modules A1–A5.

---

## Phase Overview

- **Date:** 2025-10-15
- **Previous Phase Summary (sm-d2-04-debug):**
  - Focused on UI/presence stability and minor accessibility checks.
  - Surgical fixes: guarded `localeCompare` on display names in `app/c/[canvasId]/page.tsx`; suppressed transient RTDB permission-denied errors in `lib/hooks/usePresence.ts` during auth transitions; added screenshot capture of `/c/default`.
  - Debug checklist items emphasized cursor fade on offline/idle, centered header avatars, keyboard-accessible toolbar, and rectangle contrast.
- **Objective for this Phase:**
  - Deliver consolidated Supermodule A1–A5 to harden multiplayer correctness, reconnection/persistence, and visible UI polish; implement a visible set of advanced features from the rubric; and extract AI-ready shape action helpers used by both UI and (later) the agent.

---

## Scope

### Included (per Dev Checklist)
- **A1 — Conflict Resolution 2.0**
  - Transform sessions lifecycle; `lockedBy` with TTL and visual indicator; LWW arbitration; safe-cancel on delete vs edit; Sentry breadcrumbs.
- **A2 — Persistence & Reconnection**
  - Mid-edit refresh rollback to last committed state; `beforeunload` cleanup; connection status chip; short disconnect op-queue replay.
- **A3 — Authentication & Canvas UI Polish**
  - Revamped `/login` (two-column, Email/Password + Magic Link, a11y); security pass; bottom toolbar; page-frame visuals; combined a11y sweep.
- **A4 — Advanced Features Suite**
  - Keyboard shortcuts; PNG/SVG export (canvas + selection); grid toggle + snap; simple smart guides; alignment + distribution; z-index management; version history snapshots + restore + retention; unified dependencies/QA.
- **A5 — AI-Ready Shape Action Abstractions**
  - Idempotent helpers in `lib/ai/actions.ts`; UI refactor to call the same helpers.

### Explicitly Excluded / Deferred
- AI agent/chat UI and server calls (Modules #13–#16).
- Undo/redo, grouping, layers panel beyond z-index, comments/annotations.
- Server-side rendering for exports.

---

## Risks and Assumptions

### Assumptions
- Firebase project and emulators are configured; Sentry client is active.
- Konva stage is the rendering foundation; selection and toolbar components exist.
- Dev checklist (A1–A5) is the source of truth for acceptance criteria.

### Risks & Mitigations
- **Concurrent edits thrash**: strengthen session lifecycle + TTL locks; add breadcrumbs for diagnostics.
- **Mid-edit persistence edge cases**: ensure rollback uses last committed write; avoid partial commits.
- **Export performance/size**: provide scale selector; throttle high-resolution captures.
- **A11 helper adoption drift**: enforce UI-only calls through new helpers; add unit coverage.
- **Accessibility regressions**: run axe checks on login and toolbar; require keyboard reachability.

---

## Testing Focus

### Unit
- Sessions reducer and lock utilities: `lib/store/*` (new session state) — success: deterministic lifecycle and TTL expiry.
- Math/utils for snapping, alignment, distribution, z-index normalization: `lib/utils.ts` or new dedicated module — success: pixel-accurate outputs.
- AI action helpers: `lib/ai/actions.ts` — success: typed, idempotent, correct adapter calls.

### Integration
- Toolbar actions and keyboard map: `components/ui/Toolbar.tsx`, `components/canvas/*` — success: handlers invoke helpers; UI updates.
- Login page: `app/login/page.tsx` — success: flows for Email/Password and Magic Link; focus management.
- Export functions (mock Konva): ensure PNG/SVG strings produced.

### E2E (Playwright)
- Conflict scenarios: Simultaneous Move, Rapid Edit Storm, Delete vs Edit.
- Persistence scenarios: Mid-Operation Refresh; Network Simulation (offline/restore).
- Advanced features: shortcuts, grid+snap, guides, alignment/distribution, z-index, export downloads, version snapshot/restore.

---

## Implementation Plan

1. A1: Implement session state + TTL locks; LWW arbitration and safe-cancel; add Sentry breadcrumbs.
2. A2: Add rollback on refresh; `beforeunload` cleanup; status chip; op-queue replay.
3. A3: Build login UI and harden a11y/security; implement toolbar + page-frame visuals.
4. A4: Ship advanced features in this order for low risk: keyboard shortcuts → PNG/SVG export → grid + snapping → guides → alignment/distribution → z-index → version history (snapshot/restore/retention).
5. A5: Extract `lib/ai/actions.ts`; refactor toolbar/shortcut handlers to use helpers; add unit tests.
6. Testing: add/expand unit and integration tests alongside each step; finalize E2E for conflict/persistence/advanced flows.

### Dependencies
- Canvas Engine & UI, Selection, Toolbar; Data Model & Persistence; Authentication; Firestore/RTDB clients; Sentry.

---

## Expected Outcome

- All A1–A5 acceptance criteria pass with tests in place.
- Advanced features accessible via toolbar/shortcuts; visible polish on login and canvas frame.
- Helpers in `lib/ai/actions.ts` become the single action surface for future AI tool calls.
- No regressions to MVP performance metrics (60 FPS; <100 ms object sync; <50 ms cursors).

---

## Checkpoint Preparation

- Dependencies verified: Firebase Auth/Firestore/RTDB; Sentry; Playwright; Konva stage; selection and toolbar components.
- Open questions/assumptions:
  - Grid default (8px) and snap radius (6px) are acceptable.
  - Version snapshot retention cap (20) is acceptable for this phase.

If all above are acceptable, we will proceed with Supermodule A1–A5.

Suggested commit message on completion:

"phase(05): deliver Pre-AI reliability/persistence/UI polish + advanced features; add AI-ready action helpers"


