# Phase 05 — Regression Checklist (Supermodule E: Group Chat Support)

Date: 2025-10-26

---

## Scope
- Validate that Group Chat Support integrates without regressions to Phases A–D.
- Focus on membership-based conversations, translation fan-out, receipts, lifecycle, and avatars.

## A — Platform, Identity & Data Services
- [ ] A.R1 App launch and Firebase init
- [ ] A.R2 Auth flows (login/signup/logout)
- [ ] A.R3 Profile bootstrap and avatar upload
- [ ] A.R4 Presence lifecycle (fg/bg)

## B — Messaging & Collaboration
- [ ] B.R1 Conversations list realtime updates
- [ ] B.R2 Send/receive with delivery states
- [ ] B.R3 Presence & Typing indicators
- [ ] B.R4 Inline translation + cache behavior
- [ ] B.R5 Foreground notifications and routing
- [ ] B.R6 Media (images) send/receive
- [ ] B.R7 Offline queue/replay and relaunch persistence
- [ ] B.R8 Rapid‑fire messaging (20+)

## C — AI Assistant & Smart Replies
- [ ] C.R1 askAI() integration unaffected (if enabled)
- [ ] C.R2 Smart replies UI unaffected
- [ ] C.R3 Caching and rate limiting (no interference)
- [ ] C.R4 AI timeout/fallback isolation

## D — Speech & Learning Analytics
- [ ] D.R1 TTS playback controls unaffected
- [ ] D.R2 Word highlighting sync unaffected (if present)
- [ ] D.R3 Analytics events and flags (no noise)
- [ ] D.R4 Unsupported voices error handling

## E — Group Chat Support (Phase 05 specific)
- [ ] E.1 Schema and indexes created; helpers pass unit tests
- [ ] E.2 List/chat render group (title, avatars, sender attribution)
- [ ] E.3 Fan‑out translation correct per participant language; receipts ok
- [ ] E.4 Voice playback works in multi‑participant context
- [ ] E.5 Demo “European friends” validates real‑time sync and voice
- [ ] E.6 Lifecycle: auto‑populate, blank new‑chat fix, lastMessage fields, deletion rules, listener cleanup
- [ ] E.7 Profile images persist and render in chats
- [ ] E.8 Performance p95 targets (<1.5s) at 6–10 participants
- [ ] E.9 Reconnection stability; no duplicate listeners/blank states
- [ ] E.10 Validation suite green; no regressions to 1:1 flows

## Evidence
- Link screenshots, logs, and test outputs under `/docs/operations/phases/recent/` for this phase.
