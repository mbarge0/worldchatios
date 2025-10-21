## User Flows

### 1) Overview
WorldChat (SwiftUI + Firebase) guides users from onboarding into real-time, AI‑assisted conversations. The app uses Firebase Auth for identity, Firestore listeners for live data, Storage for media, and Cloud Functions for AI/translation. SwiftUI navigation is driven by `@State` and `@EnvironmentObject` (e.g., `SessionStore`, `ChatStore`) with optimistic UI and offline‑first behavior via SwiftData (planned).

---

### 2) Flow 1 — Onboarding & Authentication

Screens: Splash (optional) → Login → Signup → Conversations List

1. App Launch
   - SwiftUI `App` checks `SessionStore.isAuthenticated` (bound to Firebase Auth state listener).
   - If authenticated → navigate to Conversations List; else → present Login.
2. Login
   - User enters email/password; `AuthViewModel.login()` calls Firebase Auth `signIn`.
   - Success → `SessionStore.isAuthenticated = true`; fetch user profile (`users/{uid}`) and set `EnvironmentObject`.
   - Failure → show inline error (invalid credentials, network).
3. Signup
   - User enters email/password/name; optional avatar upload to Storage.
   - `AuthViewModel.signup()` creates Firebase Auth user → writes `users/{uid}` with displayName, languages.
   - On success → set `SessionStore.isAuthenticated = true` and route to Conversations List.
4. Redirect
   - `NavigationStack` transitions to Conversations List with fade/slide.
   - Background: subscribe to user presence updates; write `users/{uid}.lastSeen` and `presence`.

Firebase interactions
- Auth: `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`
- Firestore: upsert `users/{uid}`; optional read of profile
- Storage: optional avatar upload; store `profilePictureURL`
- Presence: write `presence.status = online` on foreground, update lastSeen on background

SwiftUI updates
- `SessionStore` publishes auth state → view tree switches root screen
- Errors shown via `Alert` or inline `Text` with `.foregroundStyle(.red)`

---

### 3) Flow 2 — Conversations List

Screen: Conversations List (List of threads)

1. Subscribe
   - `ChatListViewModel.startListening()` attaches Firestore listener on `conversations` where `participants` contains `uid`, ordered by `lastMessageAt` desc.
   - Emits updates as `@Published var conversations`.
2. Display
   - `List` renders rows: title (participant name), last message preview, timestamp, unread indicator.
   - Empty state if `conversations.isEmpty` (CTA to start new conversation).
3. Actions
   - Open chat: tap a row → push `ChatView(conversationId)`.
   - New conversation: tap “+” → user picker modal (query `users`), create conversation doc with participants array, then navigate to Chat.

Firebase interactions
- Firestore: real-time `onSnapshot` on conversations; read participant profiles for display

SwiftUI updates
- Conversations list updates in real time through `@Published` changes
- Navigation via `NavigationLink`/programmatic `path.append(conversationId)`

---

### 4) Flow 3 — Chat Experience

Screen: Chat View

1. Subscribe
   - `ChatViewModel.startListening(conversationId)` attaches listener on `messages` subcollection ordered by `timestamp` asc.
   - Also subscribes to typing indicators (RTDB `typingIndicators/{conversationId}/{uid}`) and presence for header.
2. Send Message
   - User types in `TextField` → on submit:
     - Optimistic insert into local array (`status = sending`).
     - Write to Firestore: `messages/{messageId}` with `senderId`, `text`, `timestamp = serverTimestamp`.
     - Cloud Function trigger: add `translations.{targetLang}`.
     - Update status to `sent` on server ack, `delivered` on recipient receipt, `read` when recipient opens.
3. Receive Message
   - Listener pushes new/updated docs; UI inserts with animation.
   - If `translations[userPreferredLanguage]` exists → show inline beneath original; else show original + retry icon.
4. Typing Indicators
   - On keypress, set RTDB timestamp for current user; debounce 1s clear.
   - Header/inline “typing…” updates based on other participants’ keys.
5. AI Injection (stub for MVP, full in post‑MVP)
   - Placeholder action to “Ask AI” opens AI view (post‑MVP: calls `askAI()` with last N messages).

Timing & state
- Target: delivery P95 < 500ms; typing < 200ms; translation < 1s render after message create.
- Status lifecycle: `sending → sent → delivered → read`.

Firebase interactions
- Firestore: write message; listen to messages; update `readBy` on appear
- Functions: translate message on create; (post‑MVP) askAI, smartReplies
- RTDB: typing indicators per user

SwiftUI updates
- `@Published var messages` drives `ScrollViewReader` auto-scroll to bottom
- `@State var inputText` bound to input; clear on send
- `@EnvironmentObject` for user preferences (language) to choose translation key

---

### 5) Flow 4 — Settings & Profile

Screen: Settings

1. Profile
   - Show editable fields: display name, avatar, primary language (+ secondary).
   - Image picker uploads to Storage; update `users/{uid}.profilePictureURL`.
2. Preferences
   - Language selection updates local state and Firestore user doc.
3. Session
   - Sign out → Firebase `signOut()`; `SessionStore.isAuthenticated = false`; navigate to Login.

Firebase interactions
- Firestore: update `users/{uid}`
- Storage: image upload, get download URL
- Auth: sign out

SwiftUI updates
- Forms bound to `@State` / `@EnvironmentObject` user model; show `ProgressView` during uploads

---

### 6) Edge Cases & Error Handling

- Network offline
  - Sending: queue message locally (planned SwiftData) with `status = sending`; retry on reconnect.
  - Reading: render cached messages; show offline banner.
- Auth expired
  - Firebase Auth listener emits unauthenticated → route to Login; preserve navigation state.
- Empty states
  - No conversations: show friendly CTA to start a new one.
  - New chat with no messages: informative placeholder.
- AI timeout (post‑MVP)
  - Show “AI temporarily unavailable” toast; allow retry; log event.
- Translation failure
  - Display original text + retry icon; don’t block chat rendering.
- Storage failures
  - Avatar upload failure shows inline error; keep previous image.

---

### 7) Future Flows (Planned)

- Voice input (dictation) and voice messages
- Image upload in chat (gallery/camera) with previews
- Group chat creation and management (member list, per-user translations)
- Message search and filters
- AI Assistant (RAG) and Smart Replies pills
- Conversation export and account deletion
- Background notifications and deep linking
