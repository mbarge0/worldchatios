# 🧭 Master Regression Manifest

## Overview
This document defines all regression testing expectations across the project lifecycle. It identifies the features introduced by each phase and specifies which prior systems must remain functional after new development.

---

## Phase Summary Table 
Each phase is listed with its respective core features, regression scope, and dependencies at a high level

| Phase | Core Features Introduced | Regression Scope | Dependencies |
|-------|---------------------------|------------------|---------------|
| Phase A — Platform, Identity & Data Services (MVP) | App shell (SwiftUI), Firebase config (Auth/Firestore/Storage/Functions/FCM), Auth (email/password), profiles (name/avatar/languages), base SwiftData cache | App builds/launches; Firebase init stable; login/signup/logout; profile read/write; auth state restore | Apple dev setup, Firebase project/configs, SwiftPM |
| Phase B — Messaging & Collaboration (MVP) | Conversations list (listener), 1:1 chat send/receive, delivery states, read receipts, presence (Firestore), typing (RTDB), inline translation (Function + cache), foreground notifications (FCM), basic images (Storage), offline queue & replay (SwiftData) | Phase A intact; message ordering under rapid sends; translations degrade gracefully; offline recovery w/out duplicates; notification tap routes to chat | Firestore, RTDB, Cloud Functions, FCM, Storage, server timestamps |
| Phase C — AI Assistant & Smart Replies (Post‑MVP) | askAI() with RAG over recent messages; generateSmartReplies() (3 bilingual suggestions); caching & rate limiting; client UI (AI modal, pills) | Phases A–B intact; AI timeouts/non‑200s don’t block chat; rate limits enforced | Cloud Functions, OpenAI API, Firestore context/cache |
| Phase D — Speech & Learning Analytics (Post‑MVP) | AVSpeechSynthesizer playback with word highlighting & speed control; basic usage/latency analytics; experiment flags | Phases A–C intact; audio failures isolated; no chat performance regression | AVFoundation, analytics pipeline (Firebase Analytics) |

---

## Phase Details

### Phase A — Platform, Identity & Data Services (MVP)
**Introduced Features:**
- Xcode/SwiftUI app shell, NavigationStack, SessionStore
- Firebase config via SwiftPM (`GoogleService-Info.plist`)
- Email/password login, signup, logout
- `users/{uid}` bootstrap; displayName, avatar (Storage), language prefs
- Base SwiftData cache for profile

**Regression Scope:**
- Reliable app launch (cold/warm)
- Firebase initialization w/out runtime errors
- Auth state persists across relaunch; profile read/write consistent

**Dependencies:**
- Apple developer tooling, Firebase project & configs

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

**Regression Scope:**
- Phase A intact (auth/profile unaffected)
- No message loss under rapid sends (20+); ordering by server timestamp
- Translation/API failures do not block chat; original text shown
- Offline → online sync without duplication; history persists across force‑quit
- Notification receipt and routing works while foregrounded

**Dependencies:**
- Firestore, RTDB, Cloud Functions (translate/notify), FCM, Storage, reachability

---

### Phase C — AI Assistant & Smart Replies (Post‑MVP)
**Introduced Features:**
- `askAI()` Cloud Function with last N messages as context (RAG)
- `generateSmartReplies()` Cloud Function (3 bilingual suggestions using style profile)
- Client UI: AI modal access from chat; smart reply pills above keyboard
- Caching and rate limiting

**Regression Scope:**
- Phases A–B intact under AI load/latency
- AI timeouts/non‑200s do not block send/receive or translation
- Rate limiting/caching prevents overload; retries bounded

**Dependencies:**
- Cloud Functions, OpenAI API, Firestore context collections/cache

---

### Phase D — Speech & Learning Analytics (Post‑MVP)
**Introduced Features:**
- AVSpeechSynthesizer playback (play/pause, 0.75x/1x/1.25x)
- Word‑by‑word highlighting synchronization in SwiftUI
- Basic usage/latency analytics; experiment flags

**Regression Scope:**
- Phases A–C intact
- Audio failures isolated; UI remains responsive; no scroll/jank regressions in chat

**Dependencies:**
- AVFoundation; analytics pipeline (Firebase Analytics or equivalent)

---

## Notes
- This manifest defines what must be verified, not what was verified.
- Regression outcomes are documented per-phase in corresponding debug files.
- Update this manifest only when the phase structure or dependencies change.
