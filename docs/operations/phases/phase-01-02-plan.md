# Planning Loop — Module #1: Environment & Tooling (MVP)

---

## 1) Phase Context
- **Phase:** Module #1 — Environment & Tooling (MVP)
- **Date:** Oct 13, 2025
- **Progress Summary:** Foundation docs complete (PRD, Architecture, Dev Checklist, Master Regression Manifest). Phase Start created. Execution pending.
- **Reason for Planning:** Break work into prioritized, testable tasks; define dependencies and regression expectations before execution.

---

## 2) Current Status
- Not started: Firebase clients setup, Sentry initialization, test harness.
- Ready inputs: Firebase project, Vercel project, Sentry DSN (assumed available).

---

## 3) Issues and Blockers
- None identified; risk of env drift between local and Vercel.
- Mitigation: single `.env.example`, `vercel env pull`, README setup.

---

## 4) Scope Adjustments
- No changes to scope; keep to MVP environment goals.
- Defer feature code until Module #2+.

---

## 5) Risk Assessment
- Missing/invalid Firebase config → Gate startup with clear error; add emulator fallback later.
- Sentry misconfiguration → Add health check route or dev-trigger to verify event capture.

---

## 6) Regression Plan
- Potentially affected prior modules: none (first implementation module), but subsequent modules rely on stable env/tooling.
- Based on `/docs/operations/regression/00_master_regression_manifest.md`:
  - Ensure testing harness runs consistently (foundation for #2–#16).
  - Post-phase, verification must not break foundation docs or checklist references.
- Must remain functional after this phase:
  - Repository boot with envs
  - Test suites (unit/e2e) run
  - Sentry capture does not crash the app

---

## 7) Updated Success Criteria
- `.env.local` present and valid; Vercel envs configured
- Firebase clients (Auth, Firestore, RTDB) initialize without errors
- Sentry captures a test event in dev
- `pnpm test` and `pnpm e2e` pass locally (and in CI when added)

---

## 8) Task Summary (Priority, Effort, PRD/Checklist Mapping)

| ID | Task | Priority | Effort | Maps To |
|---|---|---|---|---|
| T1 | Create `.env.example` and document envs | P0 | S | Dev Checklist Module #1 |
| T2 | Configure Firebase clients (Auth, Firestore, RTDB) | P0 | M | PRD Auth/Realtime; Arch Stack |
| T3 | Add Sentry client initialization and test trigger | P0 | S | Dev Checklist Module #10 |
| T4 | Add Vitest + RTL config and sample unit test | P0 | S | Dev Checklist Module #1 |
| T5 | Add Playwright setup and sample E2E | P0 | S | Dev Checklist Module #12 |
| T6 | Add CI-friendly scripts and docs | P1 | S | Dev Checklist Module #1 |

Legend: Effort S=Small, M=Medium, L=Large

---

## 9) Dependency Graph

```
T1 -> T2 -> T4 -> T5 -> T6
T1 -> T3
```

---

## 10) Task Breakdown

### T1: Create `.env.example` and document envs
- Acceptance: `.env.example` includes Firebase keys and Sentry DSN placeholders; README updated
- Steps: add file; note `vercel env pull`; add setup section
- Outputs: `.env.example`, README section

### T2: Configure Firebase clients (Auth, Firestore, RTDB)
- Acceptance: clients initialize; exported typed singletons; no runtime errors
- Steps: add `lib/firebase/client.ts`; read env; init app; export `auth`, `db`, `rtdb`
- Outputs: `lib/firebase/*`

### T3: Add Sentry client initialization and test trigger
- Acceptance: a test error appears in Sentry; local toggle avoids noise in tests
- Steps: `lib/observability/sentry.ts`; init in app entry; add dev-only trigger
- Outputs: `lib/observability/sentry.ts`

### T4: Add Vitest + RTL config and sample unit test
- Acceptance: `pnpm test` passes; sample test renders component
- Steps: add `vitest.config.ts`, `vitest.setup.ts`; example test in `tests/unit`
- Outputs: config files; sample test

### T5: Add Playwright setup and sample E2E
- Acceptance: `pnpm e2e` passes; app shell renders
- Steps: `playwright.config.ts`; simple e2e in `tests/e2e`
- Outputs: config; sample e2e

### T6: Add CI-friendly scripts and docs
- Acceptance: `pnpm test` and `pnpm e2e` usable in CI; docs updated
- Steps: package scripts; CI notes in README
- Outputs: updated `package.json`, README notes

---

## 11) Critical Path
`T1 → T2 → T4 → T5 → T6` (T3 in parallel after T1)

---

## 12) Checkpoint Schedule
- CP1: T1 complete (env example + docs)
- CP2: T2 complete (Firebase clients init)
- CP3: T4+T5 complete (tests green)
- CP4: T3 complete (Sentry verified)

---

## 13) Next Steps
- Begin execution with T1 and T2 in sequence; run T3 in parallel after T1
- Prepare MR/PR with clear commits per task


