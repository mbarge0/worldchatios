# Phase Start — Module #1: Environment & Tooling (MVP)

---

## 1) Phase Overview
- **Phase Number & Name:** Module #1 — Environment & Tooling (MVP)
- **Date:** Oct 13, 2025
- **Previous Phase Summary:** Foundation documents created and aligned — PRD, Architecture, Development Checklist, and Master Regression Manifest.
- **Objectives & Deliverables:**
  - Firebase SDKs (Auth, Firestore, RTDB) initialized
  - Environment variables configured locally and on Vercel
  - Sentry client SDK added and verified
  - Vitest + React Testing Library + Playwright scaffolding and basic tests running

---

## 2) Scope
**Included:**
- Firebase clients setup and config loader
- Sentry initialization and a test capture
- Testing harness setup (unit/integration/E2E), example specs, CI-friendly scripts

**Excluded/Deferred:**
- Feature implementation (auth UI, canvas, realtime logic)
- Production deployment beyond validating env configuration

---

## 3) Risks and Assumptions
**Assumptions:**
- Node and pnpm installed; Vercel project ready
- Firebase project available and web app config accessible
- Sentry project DSN available

**Risks & Mitigations:**
- Env drift between local and Vercel → Use `vercel env pull` and a single `.env.example`
- Missing Firebase config → Gate startup; add clear error and README section

---

## 4) Testing Focus
- **Unit/Integration:**
  - Rendering sanity for shell components
  - Utility/config loaders
  - Example Firebase client mocking
- **E2E (Playwright):**
  - App boots and renders landing/canvas shell
  - Placeholder auth gate behavior validated (non-blocking for now)

Example paths:
- `tests/unit/*`, `tests/e2e/*`, `lib/firebase/*`, `lib/store/*`

Success criteria:
- `pnpm test` green locally and in CI
- `pnpm e2e` basic boot test passes
- Sentry captures a manual test event

---

## 5) Implementation Plan
1. Add `.env.example`; populate Firebase keys and Sentry DSN placeholders
2. Configure Firebase clients: Auth, Firestore, RTDB; export typed singletons
3. Initialize Sentry client with environment-based toggles
4. Add Vitest/RTL and Playwright configs, scripts, and sample tests
5. Document setup in README and verify in a clean environment

Dependencies: none (foundation phase)

---

## 6) Expected Outcome
- Clean boot locally with Firebase clients initialized
- Sentry client captures a test event
- Unit and E2E suites run successfully

---

## 7) Checkpoint Preparation
- Verify `.env.local` present with Firebase config and Sentry DSN
- Ensure Vercel env values added (no secrets committed)
- Confirm `pnpm test` and `pnpm e2e` both pass
- Suggested commit message: `phase(module-1): init env, firebase clients, sentry, and test harness`


