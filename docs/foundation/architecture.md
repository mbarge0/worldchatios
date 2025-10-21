## System Overview

WorldChat is a SwiftUI iOS application that delivers real-time, multilingual messaging with offline resilience and automatic translation. The system comprises a Swift client using MVVM and SwiftData, synchronized with Firebase services (Auth, Firestore, Storage, Cloud Functions, FCM). MVP centers on reliable messaging, translation, notifications, and offline sync; Post‑MVP layers AI experiences, speech/learning, and richer analytics.

---

## Supermodule Architecture Map

| Supermodule | Purpose | MVP Scope | Post‑MVP Scope |
| --- | --- | --- | --- |
| Platform, Identity & Data Services | App shell, Firebase setup, auth, profiles, local cache, configuration | SwiftUI app setup, Firebase (Auth/Firestore/Storage/Functions/FCM), SwiftData offline cache, auth flows, profiles (name/avatar), language preferences, deployment/config | SSO providers, advanced config profiles, admin tooling |
| Messaging & Collaboration | Real-time chat (1:1/group), delivery, read receipts, presence/typing, translation, notifications, media | Firestore listeners, delivery states (`sending → sent → delivered → read`), read receipts, presence & typing (RTDB), inline translation (Cloud Function + cache), APNs/FCM notifications, basic images | Advanced media (voice/video), search, reactions/threads, background notification polish |
| AI Assistant & Smart Replies | GPT‑4 experiences: dedicated assistant and context-aware bilingual reply suggestions | — | askAI() with RAG on recent messages; smartReplies() generating 3 bilingual suggestions; caching/rate limiting |
| Speech & Learning Analytics | Pronunciation, learning UX, and insights/experiments | — | AVSpeechSynthesizer TTS with word highlighting & speed control; usage/latency analytics; experiments/feature flags |

Notes:
- Translation and notifications are part of Messaging & Collaboration for MVP to keep the surface area small and deliver the multilingual chat experience end‑to‑end.
- AI features are split into two focused supermodules to isolate model usage from learning UX and analytics.

---

## System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                       iOS App (SwiftUI)                      │
├──────────────────────────────────────────────────────────────┤
│ Views            │ ViewModels (MVVM)     │ Services           │
│ - ChatListView   │ - ChatViewModel       │ - FirestoreClient  │
│ - ChatView       │ - AuthViewModel       │ - StorageClient    │
│ - ProfileView    │ - TranslateViewModel  │ - Audio (post-MVP) │
│ - SettingsView   │ - NotificationsVM     │ - Reachability     │
├──────────────────────────────────────────────────────────────┤
│ Local Storage: SwiftData (UserEntity, ConversationEntity, MessageEntity) │
└──────────────────────────────────────────────────────────────┘
                       ↕ HTTPS / Realtime Listeners
┌──────────────────────────────────────────────────────────────┐
│                        Firebase Backend                       │
├──────────────────────────────────────────────────────────────┤
│ Firestore (RT DB)  │ Cloud Functions (Node 18) │ Storage │ FCM │ Auth │
│ - users/           │ - translateMessage()      │        │     │      │
│ - conversations/   │ - sendNotification()      │        │     │      │
│ - messages/        │ - (post-MVP) askAI()      │        │     │      │
│ - translations/    │ - (post-MVP) smartReplies()         │     │      │
│ Realtime DB: typingIndicators/{conversationId}/{uid}        │     │      │
└──────────────────────────────────────────────────────────────┘
                       ↕ External APIs (Functions only)
┌──────────────────────────────────────────────────────────────┐
│           Google Cloud Translation API │ OpenAI GPT-4 (post-MVP)         │
└──────────────────────────────────────────────────────────────┘
```

---

## Core Entities and Data Model

- Users (`users/{uid}`): email, displayName, profilePictureURL, primaryLanguage, secondaryLanguages[], lastSeen, fcmToken
- Conversations (`conversations/{conversationId}`): type (one-on-one|group), participants[], participantLanguages{ uid: lang }, lastMessage, lastMessageAt, createdAt
- Messages (`conversations/{conversationId}/messages/{messageId}`): senderId, text, timestamp, status (sending|sent|delivered|read), translations{ lang: text }, readBy[], mediaURL?
- Translation Cache (`translations/{cacheKey}`): sourceText, sourceLanguage, targetLanguage, translatedText, createdAt, usageCount
- Typing Indicators (RTDB): `typingIndicators/{conversationId}/{uid} = timestamp`
- (Post‑MVP) AI Chats (`aiChats/{userId}/queries/{queryId}`): conversationId, userQuery, aiResponse, timestamp, contextIds[]

Indexing & constraints:
- Firestore composite: `conversations.lastMessageAt` desc for chat list
- `messages.timestamp` asc for per-conversation retrieval; server timestamps canonicalize ordering
- Security rules restrict reads/writes to participants; translation cache readable by participants only

---

## Data Flow

- Send Message (MVP):
  1) Client creates optimistic `MessageEntity` (status=sending) → SwiftData
  2) Write to Firestore → server timestamp → status=sent; notify participants via FCM
  3) Cloud Function trigger → translateMessage() → write translations field
  4) Recipients render original + inline translation; status progresses to delivered/read

- Receive & Render (MVP):
  1) Firestore listener emits new message snapshot → insert/update SwiftData
  2) If `translations[recipientLang]` present, show inline; else show original with fallback icon

- Typing Indicator (MVP):
  1) On keypress, client sets RTDB path with debounced timestamp
  2) Other clients subscribe to RTDB node to toggle typing UI

- Offline Queue & Sync (MVP):
  1) If offline, stage message in SwiftData queue (status=sending)
  2) On reconnect, batch-write pending messages; reconcile by server timestamps and IDs

- Notifications (MVP):
  1) Firestore trigger on message create → sendNotification() → FCM payload with conversationId
  2) App opens to routed conversation on tap

- (Post‑MVP) AI Assistant & Smart Replies:
  - askAI(): fetch last N messages as RAG context → GPT-4 → return response
  - smartReplies(): last 10 messages + user style → 3 bilingual suggestions

---

## Dependencies and Integrations

- iOS: Swift 5.9+, SwiftUI, Combine, SwiftData, AVFoundation (post‑MVP)
- Firebase: Auth, Firestore, Realtime Database (typing), Storage, Cloud Functions, FCM, Crashlytics
- External: Google Cloud Translation API (MVP), OpenAI GPT‑4 (post‑MVP)
- Package mgmt: Swift Package Manager (Firebase iOS SDK ≥ 10.18)

---

## Security, Testing, and Observability

Security:
- API keys remain server-side in Cloud Functions env vars
- Firestore/Storage rules enforce participant-scoped access; deny non-members
- TLS/HTTPS enforced; no E2E encryption for MVP (PRD-aligned)

Testing Coverage:
- Unit: ViewModels (Auth, Chat, Notifications), message state transitions, translators/formatters
- Integration: Firestore listeners (message CRUD), RTDB typing debounce, Functions (translateMessage, sendNotification)
- E2E Scenarios (per PRD): real-time messaging (2 devices), offline queue/replay, group chat with per-user translation, typing & read receipts, foreground notifications

Observability:
- Crashlytics enabled from MVP
- Minimal analytics: message delivery latency, translation served, notification tap-through; expand post‑MVP

---

## Performance & Scaling Targets

- Messaging latency: P95 < 500ms; Typing < 200ms; Translation display < 1s
- App launch: < 2s cold start, < 500ms warm
- Offline resilience: 100% queued messages send on reconnect
- MVP scale: 1,000 concurrent users, 100+ msgs/sec aggregate; translation cache ≥ 90% hit for common phrases
- Optimization: server timestamps, batched writes, snapshot listeners scoped to active conversations, image upload size limits

---

## Risks & Unknowns

- Firebase quota/throughput during spikes → Mitigate with listener scoping, cache, and batching
- Translation cost/latency variability → Cache aggressively; degrade gracefully to original text
- Typing indicators false positives/lag → Debounce (1s) and immediate clears on idle
- Push delivery variances (APNs) → Foreground guarantees MVP; background delivery targeted by final
- AVSpeechSynthesizer language coverage (post‑MVP) → Detect/hide unsupported voices

---

## Design Notes

- Modularity: 4 supermodules; MVP contains the first two (Platform, Identity & Data Services; Messaging & Collaboration). Post‑MVP adds AI Assistant & Smart Replies and Speech & Learning Analytics.
- MVVM with Combine; SwiftData as local source of truth; Firestore as canonical store
- Idempotent writes and optimistic UI; server timestamps dictate ordering
- Cloud Functions as integration boundary for all third-party services and push delivery
- Reference implementation patterns informed by community SwiftUI+Firebase chat repos (e.g., [WhatsAPPClone-Swiftui](https://github.com/omarthamri/WhatsAPPClone-Swiftui))

---

## Next Steps

1. Initialize Firebase project resources and add `GoogleService-Info.plist` to Xcode; configure Auth, Firestore, Storage, FCM
2. Implement Messaging Core slice end-to-end (send/receive, delivery states, read receipts, typing, presence) with SwiftData cache
3. Add translateMessage() Cloud Function and inline translation render; then wire foreground notifications

References: see PRD at `/docs/foundation/prd.md` and Tech Stack at `/docs/foundation/tech_stack.md`.
