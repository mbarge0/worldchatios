## Debug — Supermodule D (sm-d-05)

### Phase Context
- Phase: Supermodule D — Multiplayer Cursors, Presence Awareness & UI Refresh
- Date: Oct 15, 2025
- Session Type: Standard Debug (post-build verification)
- References:
  - Design Spec: `/docs/operations/phases/sm-d-03-design.md`
  - Build Log: `/docs/operations/phases/sm-d-04-build.md`
  - Regression Checklist: `/docs/operations/regression/phase-0D-regression-checklist.md`
  - Prior Debug Report: `/docs/operations/phases/phase-0D-debug.md`

### Summary of Findings
- Unit tests: all green locally (14 passed, 4 skipped).
- E2E (Playwright): green after accepting initial visual snapshot baselines (5 passed, 2 skipped placeholders).
- UI Review: high compliance; optional polish items noted (canvas faint grid, avatar overflow behavior).
- Logout surgical fix validated (Home + Canvas header) with redirect to `/login`.

### Working Features (✅)
- PresenceBar in header-right with initials-only avatars and idle dimming
- Labeled cursors with 90% chip opacity and smooth interpolation
- Canvas header elevation and responsive heights (52/56 px)
- Login page: centered card with proper spacing, labels, and states
- Logout: visible on Home and Canvas, redirects to `/login`

### Issues/Notes (⚠️)
- Optional polish: subtle grid background on canvas surface (non-blocking)
- Optional responsiveness: horizontal overflow handling for PresenceBar on tablet widths

### Fixes Applied (🧩)
- Test stability: added router/auth mocks and adjusted duplicate-title queries to `getAllByTitle`
- Baseline creation for visual snapshot tests

### Stability & Readiness
- Stability Confidence: High
- Ready to proceed to Reflection phase


