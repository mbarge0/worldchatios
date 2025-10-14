## Supermodule C — Phase 0C Regression Checklist

Reference: `/docs/operations/regression/00_master_regression_manifest.md`

Date: {{today}}
Tester: {{name}}

### Scope
- Validate new features in Supermodule C (toolbar, presence avatars, cursor labels) and ensure no regressions across prior modules (01–10).

### Environment & Build
- [ ] `pnpm build` succeeds (no TS/ESLint errors)
- [ ] Env vars present (NEXT_PUBLIC_FIREBASE_*, etc.)
- [ ] No console errors in dev

### Authentication (Module 2)
- [ ] Auth guard on `/c/[canvasId]` routes works
- [ ] Session persists across refresh

### Routing & Shell (Module 3)
- [ ] `/c/[canvasId]` renders canvas shell
- [ ] Invalid `canvasId` handled gracefully (no crash)

### Canvas Engine & UI (Module 4)
- [ ] Pan/zoom smooth
- [ ] Selection single/multi works
- [ ] Transform handles move/resize/rotate
- [ ] Keyboard: Delete/Esc/Arrow nudge

### Data Model & Persistence (Module 5)
- [ ] Shapes persist to Firestore
- [ ] Reload restores shapes

### Realtime Sync & Presence (Module 6)
- [ ] Shapes sync across two sessions (<100ms typical)
- [ ] Presence entries appear/remove on connect/disconnect
- [ ] Cursor updates visible (~20Hz)

### Conflict Handling & Writes (Module 7)
- [ ] Locks set during transform and clear on mouseup
- [ ] Debounced updates apply during drag; final commit persists

### Shapes & Text (Module 8)
- [ ] Rect: create/move/resize/rotate/delete
- [ ] Text: create/edit/move/resize/rotate/delete

### Security Rules (Module 9)
- [ ] Authorized writes allowed; unauthorized blocked
- [ ] RTDB presence path write restricted by userId

### Observability & Performance (Module 10)
- [ ] Optional Sentry DSN does not break build if unset
- [ ] Hidden-tab unsubscribe logic behaves

### Supermodule C (Modules 11–12)
- [ ] Toolbar +Rect creates a persisted rectangle
- [ ] Toolbar +Text creates persisted text
- [ ] Presence avatars display for online users (<1s)
- [ ] Cursor labels show displayName with colored tag
- [ ] Header layout clean; toolbar doesn’t obstruct canvas
- [ ] Deployment guide followed on Preview (if applicable)
- [ ] QA checklist items verified (`sm-c-qa-checklist.md`)

### Critical User Flows
- [ ] Two-browser real-time presence + cursor labels
- [ ] Toolbar create → shape appears in both sessions
- [ ] Delete shape → persists and syncs

### Results
Overall: ✅ PASSED / ⚠️ PARTIAL / ❌ FAILED

Issues Found:
- [ ] None
- [ ] [Describe]

Notes:
- [Observations]


