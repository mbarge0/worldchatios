## Metadata
- **Phase:** 03
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/phase-03-02-plan.md`

---

# Planning Loop — Module #3: Routing & Shell (MVP)

## 1) Phase Context
- **Phase:** 03 — Routing & Shell (MVP)
- **Date:** Oct 13, 2025
- **Reason for planning loop:** Break down shell scaffolding into implementable tasks, map to PRD and Dev Checklist, and lock regression scope before build.
- **Current progress:** Phase start document created (`phase-03-01-start.md`). Auth (Phase 02) is stable and guarding `/c/[canvasId]`.

## 2) Current Status
- Completed: Firebase Auth, `/login`, `AuthGuard`, removal of Supabase remnants; green build and smoke.
- In this phase: Scaffold `/c/[canvasId]` route shell, integrate `AuthGuard`, add minimal tests.

## 3) Issues and Blockers
- None blocking. Minor UX risk: loader flash due to client-side guard; acceptable for MVP.

## 4) Scope Adjustments
- No scope changes from start doc. Keep Konva/persistence out of this phase.

## 5) Risk Assessment
- **Guard flash:** Acceptable; revisit middleware later if needed.
- **Param validation:** Keep permissive to avoid blocking; add 404 placeholder logic.

## 6) Regression Plan
- Impacted prior phases/systems:
  - Phase 01 Environment & Tooling: build must remain green; test infra intact.
  - Phase 02 Authentication: login, magic link, and `AuthGuard` redirect must continue working.
- Master Manifest references: See `/docs/operations/regression/00_master_regression_manifest.md` Module #3 row (depends on #2; regression scope #1–#2).
- Features/workflows that must remain functional post-phase:
  - Auth flows: email/password + magic link, session persistence, logout.
  - Protected routing: unauthenticated users redirected to `/login` from `/c/[canvasId]`.
  - Build: `pnpm build` passes; tests run.
- Add to Debug plan: Quick smoke (Auth login → navigate `/c/abc` → see shell markers; unauthenticated redirect).

## 7) Updated Success Criteria
- `/c/[canvasId]` renders a stable shell for authenticated users; unauthenticated users redirected.
- Unit test(s) and Playwright E2E pass locally and in CI.
- No regressions in Phase 01–02 behaviors.

## 8) Task Summary (Prioritized)

| ID | Task | Priority | Depends On | Estimate |
|---|---|---|---|---|
| T1 | Add shell structure and testids in `app/c/[canvasId]/page.tsx` | High | P02 Auth | 1.0h |
| T2 | Ensure `AuthGuard` wraps canvas route and handles redirect | High | T1 | 0.5h |
| T3 | Add minimal 404 handling for invalid `canvasId` (placeholder) | Medium | T1 | 0.5h |
| T4 | Unit test: shell renders for authed user; blocked when unauth | High | T1, T2 | 0.8h |
| T5 | Playwright E2E: unauth redirect, authed sees shell markers | High | T1, T2 | 1.2h |
| T6 | Docs: update `README` and note shell markers, planning refs | Low | T1–T5 | 0.3h |

Effort total: ~4.3h

## 9) Dependency Graph (ASCII)

```
P02 Auth (stable)
   ↓
T1 (shell in /c/[canvasId]) → T2 (AuthGuard integration) → T4 (unit)
                          ↘︎                              ↘︎
                           T3 (404 placeholder)            T5 (e2e)
                                                          ↘︎
                                                           T6 (docs)
```

## 10) Task Breakdown (Mapping to PRD/Checklist)

### T1 — Add shell structure and testids in `app/c/[canvasId]/page.tsx`
- Maps to: Dev Checklist `Module #3: Routing & Shell` (scaffold `/c/[canvasId]`); PRD Section 6 "URLs & Routing" (`/c/[canvasId]`).
- Acceptance:
  - Route renders header placeholder and main content area with `data-testid` markers (e.g., `canvas-shell`, `canvas-header`).
  - Compiles and loads with no console errors.
- Steps:
  1. Update `app/c/[canvasId]/page.tsx` to include shell container and placeholders.
  2. Expose markers for tests.
  3. Verify local route renders when authenticated.
- Output: Edited `app/c/[canvasId]/page.tsx`.

### T2 — Ensure `AuthGuard` wraps canvas route and handles redirect
- Maps to: Dev Checklist Module #2 (auth gate) and Module #3 (protected route behavior).
- Acceptance:
  - Unauthenticated user visiting `/c/{id}` redirects to `/login`.
  - Authenticated user sees shell with no errors.
- Steps:
  1. Confirm guard usage in `app/c/[canvasId]/page.tsx`.
  2. Validate redirect and loader state.
- Output: Guarded page verified.

### T3 — Add minimal 404 handling for invalid `canvasId` (placeholder)
- Maps to: Dev Checklist Module #3 (404 for invalid ids).
- Acceptance:
  - Simple conditional shows 404 placeholder when `canvasId` fails basic check (e.g., empty/whitespace).
- Steps:
  1. Basic param check in route component.
  2. Render placeholder for invalid cases.
- Output: 404 placeholder path.

### T4 — Unit test: shell renders for authed user; blocked when unauth
- Maps to: Checklist Module #3 testing; PRD Testing & Quality (unit/integration).
- Acceptance:
  - Unit test passes for authed shell render and unauth blocked path (mocked guard/auth state).
- Steps:
  1. Create `tests/unit/routes/c-canvas-shell.test.tsx`.
  2. Mock auth hook; assert markers presence/absence.
- Output: Test file and passing run.

### T5 — Playwright E2E: unauth redirect, authed sees shell markers
- Maps to: Checklist Module #3 E2E navigation; Regression Manifest Module #3 dependency on #2.
- Acceptance:
  - Visiting `/c/abc` unauth → redirected to `/login`.
  - Visiting after auth → shell markers visible.
- Steps:
  1. Add `tests/e2e/routing-shell.spec.ts`.
  2. Use existing auth helper or minimal auth fixture (if present/feasible).
- Output: E2E spec; passing run.

### T6 — Docs: update `README` and note shell markers, planning refs
- Maps to: PRD Documentation & Dev Quality; keeps docs aligned.
- Acceptance:
  - `README` references canvas route, shell markers for QA, and links to phase docs.
- Steps:
  1. Add brief section to `README.md`.
  2. Link to phase-03 docs.
- Output: Updated `README.md`.

## 11) Risk Mitigation per Task
- T1/T2: Keep changes minimal; reuse existing guard; avoid refactors.
- T3: Placeholder only; no external calls; upgrade later with real validation.
- T4/T5: Run locally and in CI; avoid flaky selectors by using data-testid.
- T6: Keep docs scoped; no build impact.

## 12) Checkpoint Schedule
- CP-1: After T1/T2 (route and guard functional).
- CP-2: After T4/T5 (tests green locally).
- CP-3: After T6 (docs updated); begin Phase 04 prep.

## 13) Next Steps
1. Implement T1 → T2.
2. Add T3 placeholder.
3. Write T4 unit and T5 E2E.
4. Update docs (T6).


