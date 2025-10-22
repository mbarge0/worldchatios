# Phase 04 — Regression Checklist (Supermodule C: AI Assistant & Smart Replies)

Date: 2025-10-22

## Scope
Ensure Supermodules A–B remain fully functional after introducing AI Assistant and Smart Replies. Validate C-specific resilience.

## References
- Master Manifest: `/docs/operations/regression/00_master_regression_manifest.md`
- Plan: `/docs/operations/phases/recent/phase-04-01-plan.md`
- Build: `/docs/operations/phases/recent/phase-04-02-build.md`

## Checklist

### Phase A — Platform, Identity & Data Services
- [ ] A.R1 App launch + Firebase init succeeds (cold/warm)
- [ ] A.R2 Auth flows (login/signup/logout) stable; errors inline
- [ ] A.R3 Profile bootstrap + avatar upload; UI reflects change
- [ ] A.R4 Presence lifecycle updates on fg/bg

### Phase B — Messaging & Collaboration
- [ ] B.R1 Conversations list realtime updates (insert/update/delete)
- [ ] B.R2 Send/receive delivery states p95 < 500ms during AI calls
- [ ] B.R3 Presence & Typing indicators (typing <200ms; debounce ok)
- [ ] B.R4 Inline translation + cache works; failures degrade gracefully
- [ ] B.R5 Foreground notifications route to chat correctly
- [ ] B.R6 Image send/receive <3s; thumbnails render; errors non-blocking
- [ ] B.R7 Offline queue/replay; history persists after relaunch
- [ ] B.R8 Rapid-burst (20+) maintains order; no loss

### Phase C — AI Assistant & Smart Replies
- [ ] C.R1 askAI() p95 < 3s; context-relevant; fallback on error
- [ ] C.R2 Smart replies: 3 suggestions <1.5s; tap inserts editable text
- [ ] C.R3 Caching & rate limits enforced; graceful limit messaging
- [ ] C.R4 Timeout/failure UX shows friendly error; chat unaffected

## Notes
- Record evidence (screens, logs) next to each item.

