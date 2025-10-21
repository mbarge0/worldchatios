## WorldChat Tech Stack (Gauntlet AI)

### Platform
- **iOS:** Swift 5.9+, SwiftUI, iOS 16+
- **Architecture:** MVVM with Combine
- **Local Storage:** SwiftData (offline-first mirror of Firestore schema)
- **Dependency Manager:** Swift Package Manager (no CocoaPods)

### Backend
- **Firebase**
  - Firestore (real-time database)
  - Authentication (Email/Password for MVP)
  - Cloud Functions (Node.js 18) for AI calls, translation, notifications
  - Cloud Storage (profile images)
  - Cloud Messaging (FCM) for push notifications
  - Crashlytics (stability)

### AI/ML Integration
- **Translation:** Google Cloud Translation API (via Cloud Functions)
- **LLM/Agent:** OpenAI GPT-4 (via Cloud Functions)
- **RAG:** Conversation history retrieval from Firestore within Functions
- **Caching:** Firestore `translations/` collection with SHA256 cache keys

### Networking & Realtime
- **Firestore listeners** for live updates (messages, presence)
- **Realtime Database** for low-latency typing indicators
- **URLSession** for any custom HTTPS requests if needed

### Messaging Core
- **Schema:** `conversations/{conversationId}/messages/{messageId}`
- States: `sending → sent → delivered → read`
- Optimistic UI inserts to SwiftData first, then reconcile with Firestore ack
- Presence (`users/{uid}/presence`) and read receipts (`readBy` array)

### Push Notifications
- APNs + Firebase Cloud Messaging
- Cloud Function trigger on message create → send device-targeted notification

### Audio & Media
- **AVFoundation** (AVSpeechSynthesizer) for TTS and word highlighting callbacks
- Image picking via UIKit interoperability

### Build Targets & Tooling
- Xcode 15+
- TestFlight for beta distribution
- Instruments, XCTest, Firebase Emulator Suite (optional for local dev)

---

## Adaptations from Foundry Core (Web → Native iOS)

Foundry Core provides conventions, docs, and tooling tuned for web/Next.js. For this sprint, we’ll keep the documentation, planning, and evidence capture flows while adapting build and runtime to Xcode.

- **Keep as-is:**
  - `docs/` structure, PRD, requirements, rubric, evidence capture scripts where useful
  - Operational checklists, iteration logs, showcase system

- **Adapt/Replace:**
  - Web `app/` (Next.js) folders are not used by iOS app runtime; treat as documentation or future web client seed
  - Node-based dev scripts remain for Cloud Functions; add a `functions/` directory (Firebase) at repo root
  - Add `WorldChat/` Xcode workspace as the primary app; SwiftPM manages Firebase SDK
  - Replace web env loaders with Xcode build settings and Firebase `GoogleService-Info.plist`

- **Add:**
  - `functions/` (Firebase): TypeScript Cloud Functions for `translateMessage`, `generateSmartReplies`, `askAI`, `sendNotification`
  - `README_iOS.md`: setup steps for Xcode, Firebase config, provisioning, TestFlight
  - `Configs/` (optional): any local JSON/Plists beyond `GoogleService-Info.plist`

---

## Environment & Secrets
- API keys only in Cloud Functions env vars (`gcloud functions deploy --set-env-vars`)
- iOS client holds no AI keys
- `GoogleService-Info.plist` added to the iOS target (not committed if using multiple envs)

---

## Data Models (iOS SwiftData)
- `UserEntity`: uid, displayName, photoURL, primaryLanguage, secondaryLanguages, lastSeen
- `ConversationEntity`: id, type, participants, participantLanguages, lastMessage, lastMessageAt
- `MessageEntity`: id, conversationId, senderId, text, timestamp, status, translations (JSON), readBy, mediaURL

---

## Cloud Functions (TypeScript) – High-Level
- `translateMessage()` Firestore trigger on new message → lookup cache → translate via Google → write `translations`
- `generateSmartReplies()` HTTPS callable → GPT-4 with last N messages + user style → return 3 suggestions
- `askAI()` HTTPS callable → GPT-4 with RAG context for Q&A
- `sendNotification()` Firestore trigger → FCM to recipients with preview (translated where possible)

---

## MVP Tonight (24h) – Must-Haves
- Auth (email/password)
- One-on-one chat with Firestore listeners
- Message persistence: SwiftData mirror + reload after force quit
- Optimistic UI + delivery states
- Presence + typing indicators
- Read receipts
- Basic group chat (3 participants)
- Foreground push notifications
- Two devices demo-able via simulator + physical device

## Final by Sunday – Additions
- Automatic inline translation via Cloud Function + cache
- Per-user translation in groups
- Audio playback with word highlighting
- Dedicated AI assistant chat (RAG) and smart replies
- Crashlytics, polish, performance, TestFlight build

---

## Versions & Dependencies
- Swift 5.9+, iOS 16+
- Firebase iOS SDK >= 10.18 (SwiftPM)
- Cloud Functions Node.js 18, TypeScript 5+
- OpenAI GPT-4, Google Cloud Translation API

SwiftPM example:
```swift
dependencies: [
    .package(url: "https://github.com/firebase/firebase-ios-sdk", from: "10.18.0")
]
```

---

## Testing & Observability
- XCTest for unit tests, targeted integration tests on message flow
- Firebase Emulator Suite (optional) for local Firestore/functions
- Crashlytics for crash-free rate; basic Analytics events for delivery/latency

---

## Risks & Mitigations (Condensed)
- Env/setup: use SwiftPM, avoid CocoaPods
- Realtime consistency: start simple with Firestore listeners; reconcile via server timestamps
- Translation cost/latency: aggressive cache; fall back to original text
- AI latency: stream where possible, timeouts and friendly errors
