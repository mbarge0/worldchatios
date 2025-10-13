# Phase 02 — Planning Loop (Authentication)

## 1) Phase Context
- **Phase:** 02 — Authentication (MVP)
- **Date:** Oct 13, 2025
- **Reason for planning loop:** Break scope into execution-ready tasks with priorities, dependencies, estimates, and regression coverage before implementation.
- **Progress summary:** Phase 01 complete (env, Sentry, tests). Phase 02 starter created (`phase-02-01-start.md`) defining objectives, scope, risks, and DoD.

## 2) Current Status
- Foundation stable: Firebase clients, env schema, Sentry, Vitest/RTL, Playwright.
- Auth not yet wired into UI/routes. `useAuth.test.ts` shows an `act()` warning to resolve in this phase.

## 3) Issues and Blockers
- Firebase Auth configuration (Email/Password + Email Link) must be enabled with correct action URL and authorized domains.
- Magic Link handling in Next.js App Router requires capturing the link on the client and calling `signInWithEmailLink` safely.
- Decide initial guard strategy (client guard first; middleware optional later).

## 4) Scope Adjustments
- No changes to objectives: deliver Email/Password + Magic Link auth, route guard for `/c/[canvasId]`, display name fallback, and tests (unit + E2E).
- Social logins and profile edit UI are explicitly out of scope.

## 5) Risk Assessment
- Misconfigured Email Link action URL → validate early in a dry run.
- Guard approach may cause FOUC/redirect flicker → show minimal loader while resolving session.
- Test flakiness for Magic Link in E2E → mock or run a simulated flow where feasible.

## 6) Regression Plan
- Potentially impacted prior systems: Phase 01 foundation (env load, app boot, Sentry, test harness).
- Reference: `/docs/operations/regression/00_master_regression_manifest.md` (Phase summary rows #1–#2).
- Must remain functional post-phase:
  - App boots with no runtime or build errors
  - Unit and E2E harnesses run green (existing smoke tests still pass)
  - Sentry init path remains intact
- Add to this phase’s debug checklist: quick smoke (build, boot, smoke E2E), and Authentication regression (sign-in/out still works after changes).

## 7) Task Summary
- **Total tasks:** 10
- **Critical path:** T1 → T2/T3/T4 → T5 → T7/T8 → T10
- **Effort estimate (sum):** ~7.5–8.5 hours

## 8) Dependency Graph (ASCII)
```
T1 (Enable Firebase Auth modes)
  └─→ T2 (Login UI) ─┐
        T3 (Magic Link) ├─→ T5 (Route guard)
        T4 (Email/Pwd) ─┘        └─→ T7 (Unit tests)
                                   └─→ T8 (E2E tests)
T6 (Display name fallback) ──┐
                             └────(used by presence later; can ship now)
T9 (Docs) ──┐
T10 (Regression checks) ◄────┴─ after tests pass
```

## 9) Task Breakdown (IDs, priorities, deps, estimates, mappings)

- T1 — Enable Firebase Auth modes and action URL
  - Priority: P0  | Depends: Phase 01  | Estimate: 0.5h
  - Acceptance: Email/Password and Email Link enabled; domain + action URL configured.
  - Maps to: PRD 2.P0 “Auth”; Checklist Module #2 (L41–L46).

- T2 — Create `/app/login/page.tsx` with Email/Password and Magic Link UI
  - Priority: P0  | Depends: T1        | Estimate: 1.0h
  - Acceptance: Forms render; validation; buttons wired to hook actions; sign-out available somewhere in UI shell.
  - Maps to: PRD 2.P0 “Auth”; Checklist Module #2 (L43–L48).

- T3 — Implement Magic Link flow in `useAuth` (send + complete)
  - Priority: P0  | Depends: T1        | Estimate: 1.5h
  - Acceptance: `sendMagicLink(email)` sends; link completion handled on app load when link detected; error states surfaced.
  - Maps to: PRD 2.P0 “Auth”; Checklist Module #2 (L43–L46).

- T4 — Implement Email/Password sign up/in in `useAuth`
  - Priority: P0  | Depends: T1        | Estimate: 1.0h
  - Acceptance: `signInWithEmailPassword(email, password)` and signup path work; errors surfaced.
  - Maps to: PRD 2.P0 “Auth”; Checklist Module #2 (L43–L46).

- T5 — Add route guard for `/c/[canvasId]` (client-side guard)
  - Priority: P0  | Depends: T2/T3/T4  | Estimate: 0.5h
  - Acceptance: Unauth users redirected to `/login`; authed can access canvas; minimal loading state.
  - Maps to: PRD 2.P0 “Auth required”; Checklist Module #2 (L46–L48).

- T6 — Display name fallback utility and integration
  - Priority: P1  | Depends: none      | Estimate: 0.25h
  - Acceptance: `deriveDisplayName(email)` returns prefix; used where labels needed; no presence yet, but utility tested.
  - Maps to: PRD 2.P0 presence labels; Checklist Module #2 (L49–L51).

- T7 — Unit tests for auth hook and fallback; fix `act()` warning
  - Priority: P0  | Depends: T3/T4/T6  | Estimate: 1.0h
  - Acceptance: `useAuth` tests cover sign-in/out and magic link initiation; no `act()` warnings; fallback util tests added.
  - Maps to: PRD Sec.5 Testing; Checklist Module #2 (L45, L51).

- T8 — E2E tests for login and gated route (Playwright)
  - Priority: P0  | Depends: T2/T3/T4/T5 | Estimate: 1.0h
  - Acceptance: Unauth → `/login`; login succeeds; authed accesses `/c/[canvasId]`.
  - Maps to: PRD Sec.5 E2E; Checklist Module #2 (L45, L48).

- T9 — Docs updates (README auth setup + .env example if needed)
  - Priority: P2  | Depends: T1        | Estimate: 0.25h
  - Acceptance: Setup steps for Firebase Auth documented; action URL notes.
  - Maps to: PRD Sec.9 Documentation & Dev Quality.

- T10 — Regression checks (Phase 01 foundation + smoke)
  - Priority: P0  | Depends: T7/T8     | Estimate: 0.5h
  - Acceptance: Build succeeds; smoke E2E green; no Sentry/init regressions.
  - Maps to: Master Regression Manifest (#1–#2 obligations).

## 10) Updated Success Criteria
- Login via Email/Password and request Magic Link both function.
- `/c/[canvasId]` is gated; unauth redirected to `/login`.
- Display name fallback utility implemented and tested.
- Unit tests and E2E for auth and guard pass locally and in CI.
- No regressions in foundation (build, boot, smoke E2E, Sentry init).

## 11) Checkpoint Schedule
- Checkpoint A (post T1–T5): UI flows working locally; manual login verified
- Checkpoint B (post T7–T8): All tests green; ready for regression
- Checkpoint C (post T10): Regression complete; phase ready to move to build/debug loop

## 12) Next Steps
1. Execute T1 (enable auth providers + action URL) and verify configuration.
2. Build T2–T4 (UI + hook flows) and land client guard T5.
3. Add T6 fallback util and tests T7; then E2E T8.
4. Run T10 regression checks and finalize phase debug plan.

**Pause here to review and adjust before starting implementation.**
