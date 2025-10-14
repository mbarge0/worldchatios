## Post-Build Debugging Review — Supermodule D (Phase 0D)

### 1) Phase Context
- Phase: Supermodule D — Multiplayer Cursors, Presence Awareness & UI Refresh
- Date: Oct 15, 2025
- Session Type: Standard Debug (with one Surgical Fix for logout button)
- Discovery Context: Post-build validation prior to reflection

### 2) Issue Description
- Initial unit test failures after integrating `AuthHeader` and PresenceBar title queries.
- Snapshot baselines missing on first run of Playwright visual tests (expected on first creation).

### 3) Initial Diagnosis
- Failure 1: Missing `useRouter` mock in `next/navigation` for tests rendering `AuthHeader`.
- Failure 2: Presence tests querying `getByTitle` collided with multiple nodes using the same title.

### 4) Debugging Plan
- Add `useRouter` mock and mock `useFirebaseAuth` in tests.
- Update presence tests to use `getAllByTitle`.
- Re-run unit tests; then E2E with visual snapshots.

### 5) Execution Log
- Added mocks for `useRouter` and `useFirebaseAuth` in `canvas_header_presence.test.tsx`.
- Switched title queries to `getAllByTitle` in presence tests.
- Ran `pnpm test` until green.
- Ran Playwright E2E; accepted initial visual snapshot baselines; reran to green.

### 6) Fix Implementation
- Type: Surgical Fix (tests-only) and minor test mocks.
- Files changed (tests/docs only):
  - `tests/unit/layout/canvas_header_presence.test.tsx` (mock router/auth + query update)
  - `tests/unit/layout/presencebar.render.test.tsx` (query update)
  - `docs/operations/regression/phase-0D-regression-checklist.md` (new)

### 7) Validation & Testing
- Unit: 14 passed, 4 skipped — green.
- E2E: 5 passed, 2 skipped — green after snapshot baselines.
- Manual: Presence avatars and cursors observed; login/card layout verified.

### 8) Regression Verification
- Checklist: `/docs/operations/regression/phase-0D-regression-checklist.md` executed.
- ✅ Auth redirects (home → login unauth; home → canvas auth)
- ✅ Presence avatars and idle dimming
- ✅ Labeled cursors with interpolation
- ✅ Shapes basic CRUD and visibility
- ✅ Logout on Home and Canvas redirects to `/login`
- ⚠️ Optional polish: canvas faint grid (not required); avatar overflow scroll (tablet)

### 9) Outcome Summary
- Result: Resolved
- Follow-ups: Optional UI polish items deferred to post-MVP
- Lessons: Ensure router/auth mocks when adding header auth UI in tests; use `getAllBy*` for duplicate titles

### 10) Next Steps
- Stability Confidence: High
- Ready for Reflection phase
- No further blocking work identified


