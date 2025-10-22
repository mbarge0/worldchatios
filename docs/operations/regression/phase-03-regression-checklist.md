# Phase 03 — Regression Checklist (Supermodule B — Messaging & Collaboration)

## Scope
- Validate newly implemented Phase B features and confirm no regressions to Phase A.

## Checks

### A — Platform & Identity (Smoke)
- [ ] A.R1 App launch and Firebase init stable (cold/warm)
- [ ] A.R2 Login/logout flows route correctly; invalid creds show inline error
- [ ] A.R3 Profile bootstrap/avatar paths unaffected
- [ ] A.R4 Presence lifecycle updates on foreground/background

### B — Messaging & Collaboration
- [ ] B.R1 Conversations list realtime updates (insert/update/delete; empty state)
- [ ] B.R2 Send/receive with delivery states (sending→sent p95 < 500ms; delivered/read < 2s)
- [ ] B.R3 Presence (header) & Typing (RTDB <200ms; clears on idle)
- [ ] B.R4 Inline translation + cache (translated line appears <1s; fallback rendered)
- [ ] B.R5 Foreground notifications received; tap routes to the correct conversation
- [ ] B.R6 Image send/receive (upload <3s; renders; errors non-blocking)
- [ ] B.R7 Offline queue/replay (airplane → queue; reconnect → auto-send; no duplicates)
- [ ] B.R8 Rapid‑fire (20+) no loss; order by server timestamp

## Notes
- Multi-device tests recommended for B.R2/B.R3.
- Use timer-based queue flush (5s) for B.11; consider reachability hook later.
