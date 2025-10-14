# Supermodule A — Regression Checklist

## Metadata
- **Date:** Oct 14, 2025
- **Tester:** Dev
- **Scope:** Phases 01–04 regression for Supermodule A (Modules 5–7)

---

## Quick Smoke Test
- [ ] Login works (Phase 02)
- [ ] Navigate to `/c/[canvasId]` (Phase 03)
- [ ] Canvas stage renders; no console errors (Phase 04)

## Build Validation
- [ ] Production build succeeds (`next build`)
- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings

## Phase 01 — Environment
- [ ] Firebase clients initialize (Auth, Firestore, RTDB)
- [ ] Env vars loaded (including `NEXT_PUBLIC_FIREBASE_DATABASE_URL`)

## Phase 02 — Authentication
- [ ] AuthGuard still redirects unauthenticated users to login
- [ ] Dev override provides session for local testing

## Phase 03 — Routing & Shell
- [ ] `/c/[canvasId]` route reachable and protected
- [ ] Header and main layout intact

## Phase 04 — Canvas Engine & UI
- [ ] Stage renders full-viewport; pan/zoom smooth
- [ ] Selection (click/shift/marquee) works
- [ ] Transforms (move/resize/rotate) work
- [ ] Keyboard: Delete, Esc, Arrow nudge

## Supermodule A Features (5–7)
- [ ] Firestore schema and CRUD adapters functional
- [ ] Firestore listeners apply updates without errors
- [ ] RTDB presence node created and removed on disconnect
- [ ] Cursor broadcasting at ~20 Hz; labels/colors visible
- [ ] Debounced writes (~75 ms) during transforms; finalization on mouseup
- [ ] `lockedBy` applied during transforms and cleared (TTL 5s)

## Critical User Flows
- [ ] Two sessions on same canvas show each other cursors
- [ ] Moving a shape in one session reflects changes in the other (<100 ms typical)
- [ ] No FPS regression while presence and listeners active

## Results
- Phase 01: ✅/⚠️/❌
- Phase 02: ✅/⚠️/❌
- Phase 03: ✅/⚠️/❌
- Phase 04: ✅/⚠️/❌
- Supermodule A (5–7): ✅/⚠️/❌

## Notes
- [Observations, issues, and follow-ups]
