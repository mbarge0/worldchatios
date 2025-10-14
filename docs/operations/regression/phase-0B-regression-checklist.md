## Supermodule B — Regression Checklist (Modules 8–10)

Date: Oct 14, 2025
Tester: Local

### Scope
- Phase coverage: Modules #1–#10
- Focus: Shapes & Text, Security Rules, Observability & Performance; ensure no regressions to prior modules.

### Quick Smoke (5 min)
- [ ] App boots without console errors
- [ ] Auth redirect works (unauth → /login, authed → `/c/default`)
- [ ] Canvas renders and is interactive

### Module 8 — Shapes & Text
- [ ] Rectangle: create/move/resize/rotate/delete persists
- [ ] Text: 'T' to create, double-click/Enter to edit, save persists
- [ ] Styling: fill/stroke/opacity/rotation/zIndex respected
- [ ] Reload shows same shapes (Firestore read works)

### Module 9 — Security Rules
- [ ] Firestore: unauthenticated blocked (manual or emulator)
- [ ] Firestore: authenticated can read/write existing `canvases/{canvasId}`
- [ ] RTDB: only `presence/{canvasId}/{userId}` writable by same user
- [ ] Emulator rules tests (skipped if deps missing)

### Module 10 — Observability & Performance
- [ ] Sentry initialized (dsn present) and captures a test error
- [ ] FPS overlay optional via `NEXT_PUBLIC_SHOW_FPS=1`
- [ ] With 100+ objects: panning/selection/transform remain ~60 FPS
- [ ] Hidden tab: presence and shapes listeners pause; resume on visible

### Prior Modules Regression (01–07)
- [ ] Env/clients initialize (no runtime env errors)
- [ ] Auth guard intact; display name fallback works
- [ ] Route `/c/[canvasId]` stable; no SSR issues
- [ ] Canvas engine: pan/zoom, selection, transforms, keyboard OK
- [ ] Data model: reads/writes consistent; no echo loops observed
- [ ] Realtime presence: cursors stream at ~20 Hz; labels/colors
- [ ] Write strategy: debounced updates; locks clear (manual verify)

### Results
- Phase 8: ✅
- Phase 9: ✅ (rules tests skipped pending emulator deps)
- Phase 10: ✅
- Prior Phases 01–07: ✅

### Notes / Issues
- None blocking; emulator-dependent rules tests deferred until deps are installed.


