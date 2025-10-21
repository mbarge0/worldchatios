# 🧭 Master Regression Manifest

## Overview
This document defines all regression testing expectations across the project lifecycle. It aligns with the numbered, dependency‑aware development checklist and uses Supermodule prefixes:
- A — Platform, Identity & Data Services (MVP)
- B — Messaging & Collaboration (MVP)
- C — AI Assistant & Smart Replies (Post‑MVP)
- D — Speech & Learning Analytics (Post‑MVP)

---

## Phase Summary Table 
Each phase is listed with its respective core features, regression scope, and dependencies at a high level.

| Phase | Core Features Introduced | Regression Scope | Dependencies |
|-------|---------------------------|------------------|---------------|
| Phase A — Platform, Identity & Data Services (MVP) | App shell (SwiftUI), Firebase config (Auth/Firestore/Storage/Functions/FCM), Auth (email/password), profiles (name/avatar/languages), base SwiftData cache | App builds/launches; Firebase init stable; login/signup/logout; profile read/write; auth state restore | Apple dev setup, Firebase project/configs, SwiftPM |
| Phase B — Messaging & Collaboration (MVP) | Conversations list (listener), 1:1 chat send/receive, delivery states, read receipts, presence (Firestore), typing (RTDB), inline translation (Function + cache), foreground notifications (FCM), basic images (Storage), offline queue & replay (SwiftData) | Phase A intact; message ordering under rapid sends; translations degrade gracefully; offline recovery w/out duplicates; notification tap routes to chat | Firestore, RTDB, Cloud Functions, FCM, Storage, server timestamps |
| Phase C — AI Assistant & Smart Replies (Post‑MVP) | askAI() with RAG over recent messages; generateSmartReplies() (3 bilingual suggestions); caching & rate limiting; client UI (AI modal, pills) | Phases A–B intact; AI timeouts/non‑200s don’t block chat; rate limits enforced | Cloud Functions, OpenAI API, Firestore context/cache |
| Phase D — Speech & Learning Analytics (Post‑MVP) | AVSpeechSynthesizer playback with word highlighting & speed control; basic usage/latency analytics; experiment flags | Phases A–C intact; audio failures isolated; no chat performance regression | AVFoundation, analytics pipeline (Firebase Analytics) |

---

## Phase Details (Numbered Regression Checklist)

### Phase A — Platform, Identity & Data Services (MVP)
**Introduced Features:**
- Xcode/SwiftUI app shell, NavigationStack, SessionStore
- Firebase config via SwiftPM (`GoogleService-Info.plist`)
- Email/password login, signup, logout
- `users/{uid}` bootstrap; displayName, avatar (Storage), language prefs
- Base SwiftData cache for profile

**A — Numbered Regression Items**
- A.R1 [Functional] App launch and Firebase init
  - Depends On: A.1–A.4 (dev checklist)
  - Acceptance: Cold/warm launch succeeds; Firebase config loads w/out runtime errors
  - Testing: Smoke launch; logs
- A.R2 [Functional] Auth flows (login/signup/logout)
  - Depends On: A.5–A.6
  - Acceptance: Valid creds succeed; invalid creds show inline error; logout returns to Login
  - Testing: Unit (AuthViewModel), E2E relaunch restore
- A.R3 [Integration] Profile bootstrap and avatar upload
  - Depends On: A.6–A.7
  - Acceptance: `users/{uid}` created/updated; Storage upload URL saved; UI reflects change
  - Testing: Firestore CRUD + Storage upload
- A.R4 [Functional] Presence updates lifecycle
  - Depends On: A.10 (and B usage)
  - Acceptance: Foreground → online; background → lastSeen updates
  - Testing: Simulator foreground/background toggles

---

### Phase B — Messaging & Collaboration (MVP)
**Introduced Features:**
- Conversations list listener (ordered by `lastMessageAt` desc)
- Chat send/receive with status lifecycle `sending → sent → delivered → read`
- Read receipts; presence (Firestore); typing indicators (RTDB, 1s debounce)
- Inline translation via Cloud Function + Firestore cache
- Foreground notifications via FCM; tap to route to conversation
- Basic image send/receive (Storage)
- Offline queue & replay (SwiftData), relaunch restoration; server‑timestamp ordering

**B — Numbered Regression Items**
- B.R1 [Integration] Conversations list realtime updates
  - Depends On: A.R2, B.2–B.4
  - Acceptance: List reflects inserts/updates/deletes; empty state renders correctly
  - Testing: Listener integration
- B.R2 [E2E] Send/receive with delivery states
  - Depends On: B.4–B.6
  - Acceptance: `sending → sent` p95 < 500ms; delivered/read update within 2s
  - Testing: Two devices; latency logs
- B.R3 [Integration] Presence & Typing indicators
  - Depends On: A.R4, B.7
  - Acceptance: Typing <200ms; clears after idle debounce; presence shown in header
  - Testing: Two devices; RTDB verification
- B.R4 [Integration/E2E] Inline translation + cache
  - Depends On: A.4, B.5, B.8
  - Acceptance: Translation appears <1s; failure shows fallback; cache hits recorded
  - Testing: Function emulator + device
- B.R5 [Device/E2E] Foreground notifications and routing
  - Depends On: A.4, B.5, B.9
  - Acceptance: Preview received; tap opens correct conversation
  - Testing: Device test
- B.R6 [Integration] Media (images) send/receive
  - Depends On: A.7, B.10
  - Acceptance: Upload <3s; thumbnail renders; error paths non‑blocking
  - Testing: Storage + UI
- B.R7 [E2E] Offline queue/replay and relaunch persistence
  - Depends On: A.8, B.11
  - Acceptance: Airplane mode sends queue; auto‑send on reconnect; no duplication; history restored after force‑quit
  - Testing: E2E offline scenario
- B.R8 [Stress] Rapid‑fire messaging (20+)
  - Depends On: B.5–B.6
  - Acceptance: No loss; ordering by server timestamp maintained
  - Testing: Scripted burst

---

### Phase C — AI Assistant & Smart Replies (Post‑MVP)
**Introduced Features:**
- `askAI()` Cloud Function with last N messages as context (RAG)
- `generateSmartReplies()` Cloud Function (3 bilingual suggestions using style profile)
- Client UI: AI modal access from chat; smart reply pills above keyboard
- Caching and rate limiting

**C — Numbered Regression Items**
- C.R1 [Integration] askAI() with conversation context
  - Depends On: B.R2–B.R4, C.2
  - Acceptance: p95 < 3s; responses relevant to recent messages
  - Testing: Integration + golden prompts
- C.R2 [Integration/UI] Smart replies generation and UI pills
  - Depends On: C.3–C.4
  - Acceptance: 3 bilingual suggestions <1.5s; taps insert editable text
  - Testing: Integration + UI
- C.R3 [Resilience] Caching and rate limiting
  - Depends On: C.5
  - Acceptance: TTLs applied; rate limits respected; graceful degradation on limit
  - Testing: Logs/metrics; simulated overload
- C.R4 [Resilience] AI timeout/failure fallback
  - Depends On: C.2–C.4
  - Acceptance: User sees friendly error; retry available; chat remains unaffected
  - Testing: Simulated latency/failure

---

### Phase D — Speech & Learning Analytics (Post‑MVP)
**Introduced Features:**
- AVSpeechSynthesizer playback (play/pause, 0.75x/1x/1.25x)
- Word‑by‑word highlighting synchronization in SwiftUI
- Basic usage/latency analytics; experiment flags

**D — Numbered Regression Items**
- D.R1 [Functional/UI] TTS playback controls
  - Depends On: D.2
  - Acceptance: Play/pause; speeds switch without distortion
  - Testing: UI + device
- D.R2 [Functional/UI] Word highlighting synchronization
  - Depends On: D.3
  - Acceptance: Highlighting stays in sync (no visible drift)
  - Testing: Visual check + logs
- D.R3 [Integration] Analytics events and flags
  - Depends On: D.4
  - Acceptance: Usage/latency events recorded; flags toggle features reliably
  - Testing: Console/QA
- D.R4 [Resilience] Unsupported voices/audio error handling
  - Depends On: D.2
  - Acceptance: Audio button hidden/disabled where unsupported; errors non‑blocking
  - Testing: Negative tests

---

## Notes
- This manifest defines what must be verified, not what was verified.
- Regression outcomes are documented per-phase in corresponding debug files.
- Update this manifest only when the phase structure or dependencies change.
