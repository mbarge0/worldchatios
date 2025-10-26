# Development Checklist (Numbered) — WorldChat (SwiftUI + Firebase)

## 1) Overview
Numbered, dependency-aware checklist derived from PRD and Architecture. Organized by Supermodule with phase sections [Plan], [Build], [Debug], [Validate]. Each task includes Dependencies, Acceptance, and Testing.

Supermodules:
- A — Platform, Identity & Data Services (MVP)
- B — Messaging & Collaboration (MVP)
- E — Group Chat Support (MVP+)
- C — AI Assistant & Smart Replies (Post‑MVP)
- D — Speech & Learning Analytics (Post‑MVP)
- X — Cross-Module & Shared

---

## 2) Supermodule A — Platform, Identity & Data Services (MVP)
Description: App shell, Firebase setup, auth, profiles, language prefs, local cache, config.

[Plan]
- A.1 Define environment setup doc (Xcode, SwiftPM, Firebase project)
  - Dependencies: none
  - Acceptance: README_iOS includes steps; clean build succeeds
  - Testing: manual build/run
- A.2 Confirm Firebase services and iOS capabilities matrix
  - Dependencies: Firebase project created
  - Acceptance: Auth/Firestore/Storage/FCM/Functions enabled
  - Testing: console verification

[Build]
- A.3 (Revised) Initialize UIKit app with SceneDelegate and Firebase Auth routing
  - Dependencies: A.1
  - Acceptance: App launches to LoginViewController or ConversationsViewController based on auth
  - Testing: UI smoke test
- A.4 Integrate Firebase via SwiftPM; add `GoogleService-Info.plist`
  - Dependencies: A.2
  - Acceptance: Firebase config prints success; no runtime errors
  - Testing: launch logs
- A.5 Implement email/password signup/login/logout
  - Dependencies: A.4
  - Acceptance: login/signup works; logout returns to Login
  - Testing: unit (AuthViewModel), E2E relaunch restore
- A.6 Create `users/{uid}` bootstrap on signup (displayName, languages)
  - Dependencies: A.5
  - Acceptance: Firestore doc written; read on login
  - Testing: integration (Firestore CRUD)
- A.7 Avatar upload to Storage; persist URL in profile
  - Dependencies: A.6
  - Acceptance: image upload + URL saved; UI refreshes
  - Testing: integration (Storage), UI
- A.8 Local cache foundation with SwiftData models (UserEntity)
  - Dependencies: A.3
  - Acceptance: profile persisted locally; reload shows cached data
  - Testing: unit/integration

[Debug]
- A.9 Handle auth errors (network, invalid creds) with inline messaging
  - Dependencies: A.5
  - Acceptance: error surfaces within 1s; no crash
  - Testing: manual + unit
- A.10 Verify presence updates (status online/offline, lastSeen)
  - Dependencies: A.3, B.7 (presence used in chat header)
  - Acceptance: presence doc updates on foreground/background
  - Testing: simulator toggles

[Validate]
- A.11 Regression map: Phase A entries satisfied
  - Dependencies: A.3–A.8
  - Acceptance: login/signup, profile read/write, avatar upload, auth restore
  - Testing: specified in A‑tasks

---

## 3) Supermodule B — Messaging & Collaboration (MVP)
Description: Conversations, messages, delivery states, read receipts, presence/typing (RTDB), inline translation (Function + cache), notifications, basic images, offline cache.

[Plan]
- B.1 Define Firestore schemas and indexes (conversations/messages)
  - Dependencies: A.2
  - Acceptance: indexes created; queries optimized
  - Testing: emulator/console

[Build]
- B.2 Implement Conversations List listener ordered by `lastMessageAt` desc
  - Dependencies: A.3, B.1
  - Acceptance: real-time updates; empty state UX
  - Testing: integration (listener)
- B.3 Implement new conversation creation (user picker → conversation doc)
  - Dependencies: A.6, B.2
  - Acceptance: new thread visible immediately
  - Testing: E2E
- B.4 Implement Chat View listener on messages ordered by timestamp
  - Dependencies: B.2, B.3
  - Acceptance: smooth scroll; autoscroll to latest
  - Testing: integration + UI
- B.5 Send message with optimistic UI (`status = sending`), server ack to `sent`
  - Dependencies: B.4
  - Acceptance: `sending → sent` under 500ms p95
  - Testing: E2E latency logs
- B.6 Delivery and Read Receipts (`delivered`, `readBy[]`)
  - Dependencies: B.5
  - Acceptance: sender sees state transition under 2s
  - Testing: integration two devices
- B.7 Presence (Firestore) + Typing (RTDB) with 1s debounce
  - Dependencies: A.10, B.4
  - Acceptance: typing appears <200ms; clears quickly
  - Testing: integration two devices
- B.8 Inline translation via Cloud Function + Firestore cache
  - Dependencies: A.4, B.5
  - Acceptance: translation appears <1s; failure shows fallback icon
  - Testing: Function emulator; cache hit observed
- B.9 Foreground notifications via FCM (Function trigger)
  - Dependencies: A.4, B.5
  - Acceptance: message preview received; tapping routes to chat
  - Testing: device test
- B.10 Basic image send/receive via Storage
  - Dependencies: A.7, B.4
  - Acceptance: upload <3s; thumbnail displays
  - Testing: integration
- B.11 Offline cache and queue/replay with SwiftData (MessageEntity)
  - Dependencies: A.8, B.5
  - Acceptance: airplane mode send → auto-send on reconnect; no duplicates
  - Testing: E2E offline scenario

[Debug]
- B.12 Handle rapid-fire sends (20+) without loss or reordering
  - Dependencies: B.5–B.6
  - Acceptance: all messages delivered; order by server timestamp
  - Testing: scripted burst
- B.13 Graceful translation/API failures
  - Dependencies: B.8
  - Acceptance: original text shown; UI non-blocking
  - Testing: stub failure

[Validate]
- B.14 Regression map: Phase B items satisfied
  - Dependencies: B.2–B.13
  - Acceptance: PRD Appendix D scenarios 1–5, 9–10 green
  - Testing: scenarios set

---

## 3a) Supermodule E — Group Chat Support (MVP+)
Description: Expand from 1:1 to multi-participant group conversations while preserving real-time sync, translation, and voice playback. Reuse existing view models, message models, and Firestore schema where possible. Add full conversation lifecycle management.

[Build]
- E.1 Firestore group conversation setup (schema, indexes, helpers)
  - Dependencies: B.1
  - Acceptance: `conversations/{id}` supports `type: "group"`, `participants[]`, `participantLanguages{[uid]: langCode}`, and `title`; composite indexes added for list and message queries; helper APIs implemented to create and fetch group conversations; reads/writes scale to ≥10 participants with no hotspots.
  - Testing: emulator + index verification; load test with 10 users; unit tests for helpers
- E.2 Frontend handling (Conversation List + ChatVC)
  - Dependencies: B.2–B.4, A.6
  - Acceptance: conversations with `type: "group"` render with group title in header and stacked/inline participant avatars; maintain UI parity with 1:1 (bubbles, language ribbons) while accommodating multiple senders; smooth real-time updates and message animations preserved.
  - Testing: UI/E2E on 2–3 simulators
- E.3 Message handling (per-recipient translations, receipts)
  - Dependencies: B.5–B.8
  - Acceptance: on send, message is translated for every other participant’s language; messages render correctly per sender with proper original/translated ordering; read receipts (`readBy[]`), checkmarks, and timestamps update for all participants within 2s.
  - Testing: integration across 3 devices; Function logs validate translation fanout
- E.4 Voice playback support (multi-participant)
  - Dependencies: D.2, B.4
  - Acceptance: voice playback works per message regardless of sender language; uses existing 1:1 voice logic with per-message `receiverLang`; play/stop button visibility consistent for sender and receiver cells.
  - Testing: manual/UI across en/it/fr users
- E.5 Demo scenario: “European friends”
  - Dependencies: E.1–E.4
  - Acceptance: Firestore demo group created titled “European friends” with ≥3 users (English, Italian, French); real-time translation and message sync verified for all; each user sees messages in their own language and can hear translated/original voice playback appropriately.
  - Testing: scripted E2E with 3 accounts
- E.6 Conversation lifecycle management (populate, sync, delete, stability)
  - Dependencies: B.2, B.4–B.6
  - Acceptance: any conversation where current `uid` ∈ `participants` auto-populates in list with `title`, `lastMessage`, `lastMessageAt`; fix blank new-chat issue (messages subcollection loads in real time); on new send, update `lastMessage` and `lastMessageAt` for all; deletion behavior: 1:1 allows local soft delete (per-user hide), group removes user from `participants` and deletes doc when none remain; listener cleanup implemented; backgrounding/reconnection stable (no duplicates or stale UIs).
  - Testing: E2E multi-device; foreground/background cycles; memory/leak checks
- E.7 Profile images in profile and chats
  - Dependencies: A.7, B.2–B.4
  - Acceptance: uploaded avatar populates and persists on user profile page; sender avatars render in conversation list and message cells for any conversation they participate in; caching with initials fallback.
  - Testing: integration/UI; offline avatar cache sanity

[Debug]
- E.8 High fan-out performance and contention
  - Dependencies: E.3
  - Acceptance: p95 send→translated <1.5s for 6–10 participants; no index/throughput errors in logs.
  - Testing: burst script; emulator/device logs
- E.9 Listener cleanup and reconnection regression
  - Dependencies: E.6
  - Acceptance: after 10 background/foreground cycles and network toggles, no duplicate listeners, blank states, or missed updates.
  - Testing: simulator cycles; instrumentation logs

[Validate]
- E.10 Regression map: Group chat scenarios green
  - Dependencies: E.1–E.9
  - Acceptance: Gauntlet Week‑2 demo-ready across create → sync → translate → voice → delete; no regressions to 1:1 flows.
  - Testing: E2E scripted scenarios

---

## 4) Supermodule C — AI Assistant & Smart Replies (Post‑MVP)
Description: Dedicated AI assistant (RAG over recent messages) and context-aware bilingual reply suggestions.

[Plan]
- C.1 Confirm model and quotas; define prompts and guardrails
  - Dependencies: A.4, B.4
  - Acceptance: spec doc checked-in
  - Testing: review

[Build]
- C.2 Implement `askAI()` Function with last N messages as context (RAG)
  - Dependencies: C.1
  - Acceptance: p95 response <3s; relevant answers; recent-context RAG (last 20–40 msgs)
  - Testing: integration + golden prompts
- C.3 Implement `generateSmartReplies()` with user style profile + tone control
  - Dependencies: C.1
  - Acceptance: 3 bilingual suggestions <1.5s; respects tone (casual/neutral/formal)
  - Testing: integration
- C.4 Client UI: AI modal and smart reply pills above keyboard
  - Dependencies: C.2, C.3, B.4
  - Acceptance: accessible from chat; editable insertion; pills render on keyboard focus
  - Testing: UI/E2E
- C.5 Caching and rate limiting in Functions
  - Dependencies: C.2, C.3
  - Acceptance: TTLs applied (smart replies ≥1h, Q&A ≥24h); per-user/per-conversation caps
  - Testing: logs/metrics
- C.5a Client enhancements: prefetch, tone selector, long‑press Ask AI
  - Dependencies: C.3, C.4
  - Acceptance: prefetch on keyboard focus; tone selector present; long‑press message → “Ask AI (explain)” action
  - Testing: UI/E2E + latency logs
- C.5b Observability & auth hardening
  - Dependencies: C.2–C.5
  - Acceptance: latencyMs + cached flags logged; Functions verify Firebase ID token and (if enabled) App Check; 401/429 handled gracefully
  - Testing: logs/metrics; negative auth tests

[Debug]
- C.6 AI timeout and fallback UX
  - Dependencies: C.2–C.4
  - Acceptance: user sees friendly error; retry available
  - Testing: simulated latency

[Validate]
- C.7 Regression map: Phase C items satisfied
  - Dependencies: C.2–C.6
  - Acceptance: PRD scenarios 7–8 green; rate limiting checks
  - Testing: as above

---

## 5) Supermodule D — Speech & Learning Analytics (Post‑MVP)
Description: TTS playback with word highlighting and basic analytics/experiments.

[Plan]
- D.1 Validate language voice availability for target locales
  - Dependencies: none (AVFoundation)
  - Acceptance: support matrix documented
  - Testing: manual probe

[Build]
- D.2 Implement AVSpeechSynthesizer wrapper and delegate callbacks
  - Dependencies: D.1
  - Acceptance: play/pause; speeds 0.75x/1x/1.25x
  - Testing: unit/UI
- D.3 Implement word highlighting sync in SwiftUI
  - Dependencies: D.2
  - Acceptance: zero drift with speech
  - Testing: visual check + logs
- D.4 Add usage/latency analytics and experiment flags
  - Dependencies: A.4
  - Acceptance: events recorded; flag toggles work
  - Testing: console/QA

[Debug]
- D.5 Handle unsupported voices and audio errors
  - Dependencies: D.2
  - Acceptance: audio button hidden/disabled appropriately
  - Testing: negative test

[Validate]
- D.6 Regression map: Phase D items satisfied
  - Dependencies: D.2–D.5
  - Acceptance: audio isolated; no chat performance regression
  - Testing: as above

---

## 6) Supermodule X — Cross-Module & Shared
[Build]
- X.1 Error handling standards and user-facing messages
  - Dependencies: A.3, B.4
  - Acceptance: consistent copy; toast/alerts standardized
  - Testing: UI audit
- X.2 Crashlytics and logging hygiene
  - Dependencies: A.4
  - Acceptance: no noisy logs; errors captured
  - Testing: crash simulation
- X.3 Documentation: README_iOS, setup, Ops playbooks current
  - Dependencies: A.1–A.2
  - Acceptance: fresh setup reproducible end-to-end
  - Testing: clean machine run-through
- X.4 Test data & scripts for burst messaging and offline scenarios
  - Dependencies: B.5, B.11
  - Acceptance: scripts produce repeatable conditions
  - Testing: local runs

---

## 7) Testing Coverage Map
- Unit: AuthViewModel, ChatViewModel, translation formatting, notifications routing
- Integration: Firestore listeners, RTDB typing, Functions (translate/sendNotification/AI)
- E2E: MVP scenarios 1–5, 9–10; Post‑MVP scenarios 6–8
- Gaps: background notifications (post‑MVP), advanced media/search

---

## 8) Validation Mapping
| Task | Regression Phase | Test Type | Status |
|------|------------------|-----------|--------|
| B.5/B.6 Messaging send/receive + delivery states | Phase B | Functional/E2E | ☐ |
| B.8 Inline translation Function + cache | Phase B | Integration/E2E | ☐ |
| B.11 Offline queue & replay | Phase B | E2E | ☐ |
| B.9 Foreground notifications | Phase B | Device/E2E | ☐ |
| E.3 Group chat per-user translations | Phase E | Integration/E2E | ☐ |
| C.2 askAI() assistant | Phase C | Integration | ☐ |
| C.3/C.4 Smart replies pills | Phase C | Integration/UI | ☐ |
| D.2/D.3 TTS with highlighting | Phase D | UI/Functional | ☐ |

---

## 9) Completion Definition
- 100% of MVP tasks done; 90% pass rate on unit/integration; all E2E MVP scenarios green
- Demo: two devices real-time chat; offline scenario; inline translations; basic images
- No P1 bugs open; Crash-free rate >99%
