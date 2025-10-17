# Phase XX — Supermodule B Regression Checklist

Date: {{today}}
Tester: {{name}}

References:
- Master Manifest: `/docs/operations/regression/00_master_regression_manifest.md`
- Phase Plan: `/docs/operations/phases/phase-XX-01-plan.md`
- Phase Build: `/docs/operations/phases/phase-XX-02-build.md`

---

## Smoke Test (5 minutes)
- [ ] Login works (Phase 02)
- [ ] Navigate to `/c/[canvasId]` (Phase 03)
- [ ] Presence visible (Phase 06)
- [ ] Create/move/resize/rotate shape (Phases 04, 08)
- [ ] No console errors

---

## Comprehensive Regression (20 minutes)

### Phase 02: Authentication
- [ ] Sign-in (Email/Password or Magic Link) works
- [ ] Auth guard redirects unauthenticated users
- [ ] Logout clears session

### Phase 03: Routing & Shell
- [ ] `/c/[canvasId]` loads; invalid ID 404

### Phase 04: Canvas Engine & UI
- [ ] Pan/zoom smooth at 60 FPS
- [ ] Selection single/multi works
- [ ] Transform handles functional
- [ ] Keyboard shortcuts work

### Phase 05: Data Model & Persistence
- [ ] Reload restores canvas state
- [ ] JSON export valid and round-trips

### Phase 06: Realtime & Presence
- [ ] RTDB presence online/offline toggles correctly
- [ ] Cursors stream with perceived <50 ms latency
- [ ] Firestore listeners propagate <100 ms

### Phase 07: Conflict Handling
- [ ] `lockedBy` shows during transform and clears
- [ ] Debounced writes maintain smoothness + final commit

### Phase 09: Security Rules
- [ ] Firestore/RTDB rules still enforce

### Phase 10: Observability & Performance
- [ ] Sentry captures errors (dev test)
- [ ] No performance regressions (60 FPS target)

### Supermodule B Specific
- [ ] B1: `/api/openai` proxy secured; 3 QPS/user enforced
- [ ] B2: Agent selects correct tool; memory clears after 10m idle
- [ ] B3: Chat drawer toggles; sticky input; assistant bubble style
- [ ] B3: “Undo last AI action” replays last tool command
- [ ] B4: Voice input populates text; speech synthesis audible; toggle accessible
- [ ] B5: AI session context persists per user+canvas; brand palette applied; toolbar left; zoom smooth
- [ ] A11y: axe passes with no critical issues

---

## Results
- Phase 02: ✅/⚠️/❌ Notes:
- Phase 03: ✅/⚠️/❌ Notes:
- Phase 04: ✅/⚠️/❌ Notes:
- Phase 05: ✅/⚠️/❌ Notes:
- Phase 06: ✅/⚠️/❌ Notes:
- Phase 07: ✅/⚠️/❌ Notes:
- Phase 09: ✅/⚠️/❌ Notes:
- Phase 10: ✅/⚠️/❌ Notes:
- Supermodule B: ✅/⚠️/❌ Notes:

Overall: ✅ PASSED / ⚠️ PARTIAL / ❌ FAILED

Issues Found: [List]

---

## Notes
- Observations, perf metrics, and any anomalies:


