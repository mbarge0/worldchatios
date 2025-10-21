## Start

### Phase Overview
- Phase: 03 — Supermodule B — Messaging & Collaboration (MVP)
- Date: 2025-10-21
- Previous Phase Summary (from Phase 01 — Reflect & Handoff): We stabilized the MVP auth flow by migrating to UIKit lifecycle, centralized Firebase configuration in `AppDelegate`, and routed via `SceneDelegate` based on `Auth.auth().currentUser`. `LoginViewController` and a placeholder `ConversationsViewController` are in place; sign-out returns to login. Stability is high for current scope.

### Dependencies & Alignment
- Aligned Inputs:
  - PRD core for Messaging (PRD §6.1, 6.8, 6.9, 6.10)
  - Architecture map (Messaging & Collaboration MVP scope)
  - Dev Checklist — Supermodule B tasks (B.1–B.11)
  - Regression Manifest — Phase B regression set (B.R1–B.R8)
  - Existing UIKit shell and auth from Supermodule A
- Preconditions (from Phase A outcomes):
  - Firebase configured and initializes cleanly (Auth/Firestore available)
  - Auth sign-in flow working; user session established for routing
  - UIKit lifecycle (`AppDelegate`/`SceneDelegate`) stable

### Objectives & Deliverables (This Phase)
- Objectives:
  - Deliver end-to-end one-on-one messaging: conversations list, chat thread, send/receive with delivery states, read receipts, presence, typing, inline translation, foreground notifications, and basic images; establish offline queue/replay foundation.
- Deliverables:
  - Firestore schemas and required indexes for `conversations` and `messages` (B.1)
  - Conversations List (ordered by `lastMessageAt` desc) with empty state (B.2)
  - New conversation creation flow (user picker → thread) (B.3)
  - Chat View message listener with smooth scroll and autoscroll (B.4)
  - Send message with optimistic UI and server ack to `sent` (B.5)
  - Delivery and Read receipts surfaced in UI (B.6)
  - Presence (Firestore) + Typing indicator (RTDB) with debounce (B.7)
  - Inline translation via Cloud Function + cache rendering (B.8)
  - Foreground notifications routing to conversation (B.9)
  - Basic image send/receive (Storage) (B.10)
  - Offline cache and queue/replay with SwiftData groundwork (B.11)

### Scope
- Included: B.1–B.7 as immediate MVP slice; B.8–B.11 targeted if time permits within MVP week, otherwise staged behind feature flags.
- Excluded/Deferred: Group chat scaling UX polish, background push reliability beyond foreground path, advanced media and search, AI features (Supermodule C).

### Risks & Assumptions
- Assumptions: Active Firebase project with Firestore/RTDB/Functions/FCM/Storage enabled; iOS entitlements set. Two simulators available for E2E.
- Risks:
  - Listener and batching patterns could inflate reads → mitigate via query scoping and pagination.
  - Translation latency variability → cache-first design; show graceful fallback when missing.
  - Typing indicator flapping → enforce 1s debounce and immediate clear on idle.

### Testing Focus (Phase B)
- Unit: message state transitions, formatters (timestamps, delivery/read badges)
- Integration: Firestore listeners (conversations/messages), RTDB typing debounce, Function translation write-backs, Storage uploads
- E2E/Device: two-device send/receive latency, read receipts, presence/typing, offline queue/replay, notification tap routing

### Checkpoint Readiness (Short Summary)
- Dependencies verified via previous phase; objectives map directly to Dev Checklist §3 (B.1–B.11) and PRD §6.1/6.8/6.9/6.10. Scope is constrained to 1:1 chat MVP with inline translation and basic media. Ready to proceed to Planning Loop.

---

## Plan

### Priority Order & Dependencies
- Critical path:
  1) B.1 Firestore schemas + indexes
  2) B.2 Conversations List listener → empty state
  3) B.3 New conversation creation (enables B.4 testability)
  4) B.4 Chat View listener + autoscroll
  5) B.5 Send message (optimistic → sent)
  6) B.6 Delivery/Read receipts
  7) B.7 Presence (Firestore) + Typing (RTDB)
  8) B.8 Inline translation (Function + cache)
  9) B.9 Foreground notifications routing
  10) B.10 Images (Storage)
  11) B.11 Offline cache & queue/replay (SwiftData)

- ASCII dependency sketch:
```
B.1 → B.2 → B.3 → B.4 → B.5 → B.6 → B.7 → B.8 → B.9
                          └────────────→ B.10
                     B.5 ─────────────→ B.11 (needs A.8 groundwork)
```

### Effort Estimates (relative)
- B.1 0.5d, B.2 0.5d, B.3 0.5d, B.4 1.0d, B.5 0.75d, B.6 0.5d,
- B.7 0.75d, B.8 0.75d, B.9 0.5d, B.10 0.5d, B.11 1.0d

### Mapping to PRD/Checklist
- All tasks map to Dev Checklist §3 (B.1–B.11) and PRD §6.1 (Messaging), §6.8 (Presence/Typing), §6.9 (Notifications), §6.10 (Offline).

### Regression Planning (Manifest-aligned)
- Impacted prior systems: Phase A shell/auth/presence lifecycle
- Add checks per Manifest:
  - B.R1 Conversations list realtime (depends A.R2)
  - B.R2 Send/receive with delivery states
  - B.R3 Presence & Typing indicators (depends A.R4)
  - B.R4 Translation + cache (depends A.4)
  - B.R5 Foreground notifications routing (depends A.4)
  - B.R6 Media send/receive (depends A.7)
  - B.R7 Offline queue/replay (depends A.8)
  - B.R8 Rapid‑fire ordering stability

### Success Criteria
- p95 `sending → sent` < 500ms; typing < 200ms; translation visible < 1s; offline queued messages auto-send without duplicates; foreground notification tap routes correctly.

### Next Steps
- Create indexes and schema validation docs; implement Conversations List and new conversation flow; proceed down critical path with per-step manual checks and logs.

---

## Design

### Interface Principles (UIKit)
- Keep it simple and reliable using native UIKit controls; MVVM-friendly view controllers; consistent 8pt spacing grid; high-contrast, low-latency animations (120–200ms).

### Screens & Layout (Textual Wireframes)

1) Conversations List (`ConversationsViewController`)
```
[UINavigationController]
 └─ Conversations (UITableView)
     - NavBar: Title, + button (new chat)
     - Cell: Avatar • Name
             Last message preview · time · unread badge
     - Empty state: icon + "Start a conversation"
```

2) New Conversation Flow
```
[Modal UINavigationController]
 └─ User Picker (UITableView + UISearchController)
     - Search field (debounced)
     - Cells: Avatar • DisplayName • Primary language tag
     - [Cancel] [Create]
```

3) Chat View (`ChatViewController`)
```
[UINavigationController]
 └─ Chat
     - Header: Avatar • Name • Presence dot • (Typing…)
     - UICollectionView (compositional layout)
         Bubble (outgoing/incoming)
           - Original text
           - Translated text (smaller, secondary color)
           - Status: sending/sent/delivered/read (tick icons)
           - Media thumbnail (if image)
     - InputBar:
         [ + ] [ TextView (grows 1–4 lines) ] [ Send ]
         (Typing indicator below input when other party typing)
```

### Colors, Typography, Spacing
- Colors: primary #4F46E5, accent #22D3EE, error #EF4444, bg light #FFFFFF / dark #0B0B0F, text primary #0B0B0F / #FFFFFF, secondary #A1A1AA.
- Typography: SF Pro; Title 28/34 semibold; Heading 20/26 semibold; Body 17/22; Caption 13/18.
- Spacing: 8pt grid; cells 12–16pt vertical rhythm; bubbles min 8pt insets.

### Component States
- Buttons: default/disabled/loading; send button disabled when text empty.
- Cells: selected highlight; unread badge count; swipe to delete (deferred).
- Input: placeholder, focused, error; image attach shows thumbnail chip before send.
- Message bubble: states for `sending/sent/delivered/read`; failure shows retry icon.
- Presence/Typing: green/gray presence; typing animates ellipsis with 200ms fade.

### Motion & Accessibility
- Motion: 120–180ms ease-in-out for inserts/updates; reduced motion respects system setting.
- Accessibility: Dynamic Type, VoiceOver labels for bubbles (read original then translation), hit targets ≥ 44pt, contrast ≥ AA.

### Open Questions / Assumptions
- User directory source for picker (MVP: manual test list vs. Firestore `users` search)?
- Translation field key naming and fallback iconography specifics.
- Foreground-only notifications scope for MVP; background routing later.

### Ready-to-Build Summary
- Defined layouts, states, and tokens for Conversations and Chat; confirms UIKit approach consistent with current app shell. Proceed to Build after confirming open questions.
