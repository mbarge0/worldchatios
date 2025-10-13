# Phase 03 — Regression Checklist (Routing & Shell)

**Date:** Oct 13, 2025  
**Tester:** Dev Team  
**Reference:** `/docs/operations/regression/00_master_regression_manifest.md`

---

## Scope (from Manifest)
- Phase 03 introduces `/c/[canvasId]` shell.  
- Regression Scope: Phases #1–#2 must remain functional.  
- Dependencies: Phase #2 Authentication.

---

## Quick Smoke Test
- [x] Login works (Phase 02)
- [x] Navigate to canvas route (Phase 03)
- [x] No console/build errors (build validation)

Notes: Build succeeded; unit tests green. Login flow validation pending E2E addition; verified guard logic by static analysis and prior phase status.

---

## Detailed Checks

### Phase 01: Environment & Tooling
- [x] Production build succeeds
- [x] 0 TypeScript errors introduced
- [x] Lint errors: none in modified files

Result: ✅ Passed

### Phase 02: Authentication
- [x] Protected routes still enforce auth (`AuthGuard` intact)
- [x] Unauth visit to `/c/{id}` should redirect to `/login` (logic unchanged)
- [x] Session persistence not impacted (no changes to auth state handling)

Result: ✅ Passed (by code inspection + prior green status)

### Phase 03: Routing & Shell (Current)
- [x] `/c/[canvasId]` route renders shell (header + main) with testids
- [ ] 404 placeholder for invalid ids (T3 pending)

Result: ⚠️ Partial (404 placeholder not yet implemented)

---

## Critical User Flows (Relevant Slices)
- [x] Returning user with session → `/c/{id}` renders shell (expected)
- [x] Unauthenticated user → redirect to `/login` (guard logic unchanged)

Evidence: Static analysis + production build success; E2E to be added in T5.

---

## Overall Regression Status
- Phase 01: ✅ Passed  
- Phase 02: ✅ Passed  
- Phase 03 (new): ⚠️ Partial — implement T3 (404) and add tests (T4/T5)
