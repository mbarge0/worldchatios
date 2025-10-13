## Phase 04 — Regression Checklist

### Prior Phases Covered: 01–03

#### Quick Smoke
- [ ] Login works (Phase 02) — unauthenticated users see Sign in; authenticated can proceed
- [ ] Navigate to `/c/[canvasId]` (Phase 03) — route reachable/protected; no console errors
- [ ] Basic canvas renders (Phase 04) — stage wrapper visible (if authed)

#### Comprehensive (as applicable)
- Phase 01: Environment
  - [ ] Build succeeds; no TypeScript/ESLint errors
- Phase 02: Authentication
  - [ ] Redirect to login when unauthenticated
  - [ ] After auth, can access protected routes
- Phase 03: Routing & Shell
  - [ ] `/c/[canvasId]` renders header and main
  - [ ] Invalid ids return 404 (if implemented)

#### Phase 04 Specific Sanity
- [ ] Stage renders without layout shift; wheel zoom works
- [ ] Space+drag panning works smoothly
- [ ] Selection: click, Shift multi-select, marquee select
- [ ] Transforms: move, resize via corner handles, rotate handle
- [ ] Keyboard: Delete removes selected; Esc clears; Arrow nudges (Shift=10px)

#### Results
- Phase 01: [✅/⚠️/❌] Notes: [...]
- Phase 02: [✅/⚠️/❌] Notes: [...]
- Phase 03: [✅/⚠️/❌] Notes: [...]
- Phase 04: [✅/⚠️/❌] Notes: [...]

**Overall:** [✅ PASSED / ⚠️ PARTIAL / ❌ FAILED]


