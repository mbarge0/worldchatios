# Phase 05 — Supermodule E: Group Chat Support (MVP+)

Date: 2025-10-26

---

## Start

### Phase Overview
- Phase: 05 — Supermodule E: Group Chat Support (MVP+)
- Mode: Start (Consolidated Planning begins here)
- References: PRD (`/docs/foundation/prd.md`), Architecture (`/docs/foundation/architecture.md`), Dev Checklist (`/docs/foundation/dev_checklist.md`), Coding Rules (`/docs/operations/coding_rules.md`), Regression Manifest (`/docs/operations/regression/00_master_regression_manifest.md`)

### Previous Phase Summary (from Phase 04)
- Delivered: AI Assistant modal and Smart Reply pills planned and designed; Functions scope for `askAI()` and `generateSmartReplies()` with caching/rate-limits; clear constraints to not regress A–B messaging.
- Stability: Messaging foundations from Phase 03 remain intact (conversations, chat, optimistic send, delivery/read receipts, presence/typing, translations, images, offline queue, foreground notifications). Linter clean; listeners/lifecycle patterns explicit.
- Open items: Continue device validations for latency and burst; background push routing polish remains in B; confirm final AI copy and model quotas.
- Environment: Firebase configured (Auth/Firestore/Storage/RTDB/FCM). UIKit client established.

### Objective for this Phase
Expand WorldChat from 1:1 to multi‑participant group conversations while preserving real‑time sync, inline translation, and voice playback. Add full conversation lifecycle management (creation, auto‑population, message sync, and deletion) and ensure profile images render across profile and chat surfaces. Reuse existing view models, message models, and Firestore schema where possible.

### Constraints
- Maintain architectural consistency and reuse: keep existing Conversation and Message models, Chat view controller, and Function boundaries (translation).
- Do not regress Supermodules A and B behavior or performance (auth, profiles, messaging, translation, notifications, offline queue).
- Follow current repo conventions for files, naming, logging, and docs.

### Include in this Start Response
1. Concise goals/tasks for this phase aligned to Dev Checklist E.1–E.10.
2. Proposed component layout and data model adaptation for group conversations.
3. Testing plan with unit, integration, and E2E coverage.
4. Step‑by‑step implementation plan.

### Concise Restatement of Goals
- Firestore: add `type: "group"`, `participants[]`, `participantLanguages{[uid]: langCode}`, and `title`; helper APIs; indexes.
- Frontend: Conversation List + Chat view recognize `group`, show stacked avatars and title; parity with 1:1 interactions.
- Messaging: fan‑out translation per participant; receipts/timestamps correct for all.
- Voice: preserve TTS per message regardless of sender language.
- Lifecycle: auto‑populate by membership; fix blank new‑chat issue; `lastMessage/lastMessageAt` updates; soft delete for 1:1; participant removal and terminal delete for empty groups; robust listener cleanup.
- Demo: “European friends” group with EN/IT/FR, verifying real‑time translation and voice.
- Profile images: ensure upload→persist renders on profile and in chats.

### Proposed Architecture / Component Layout
- Data
  - Reuse `conversations/{id}` with new fields: `type`, `participants[]`, `participantLanguages{}`, `title`.
  - `messages` subcollection unchanged. For translations, continue using Function/cache; expand client send to fan‑out language targets.
  - Indexing: composite indexes for `participants` membership queries and `lastMessageAt` ordering.
- Client
  - `ConversationsViewController`: query by `participants` contains current `uid`, render group rows with stacked avatars and title; show `lastMessage`/`lastMessageAt`.
  - `ChatViewController`: detect `type: group`; render sender name/mini‑avatar on bubbles; preserve top/bottom bilingual ordering; voice buttons per message; receipts using `readBy[]`.
  - Shared view models: extend to compute per‑user language target map once per conversation.
- Functions/Services
  - Translation Function untouched; client supplies a list of target languages derived from `participantLanguages` minus sender.
  - Helper creation/fetch APIs ensure atomic creation and participant membership consistency.

### Testing Plan for Phase 05
- Unit
  - Participant language resolution; fan‑out target derivation per send.
  - Conversation helpers (create/fetch) and list cell view models.
- Integration
  - Conversation list listener by membership; messages listener with group rendering.
  - Translation fan‑out across 3 users; read receipts `readBy[]` updates.
  - Profile image persistence and chat avatar rendering.
- E2E
  - Create “European friends”; send/receive across EN/IT/FR; verify translations and voice playback per user language; lifecycle delete flows.
  - Background/foreground and reconnection without duplicate listeners or blank states.

### Step‑by‑Step Implementation Plan
1) E.1 Firestore schema + indexes + helpers for group conversations.
2) E.2 Frontend recognition of group in list and chat; header title + stacked avatars.
3) E.3 Message send fan‑out per participant language; receipts/timestamps across all.
4) E.4 Voice playback confirmation in multi‑participant context.
5) E.6 Lifecycle fixes: auto‑population, blank new‑chat fix, `lastMessage/lastMessageAt`, deletion rules, listener cleanup.
6) E.7 Profile image persistence and rendering in profile and chats.
7) E.5 Demo: seed and validate “European friends”.
8) E.8–E.10 Debug/perf + validation and regression verification.

### Checkpoint Readiness Summary
- Dependencies aligned: Requires A.4/A.6/A.7 (Firebase setup, profile+avatar), B.1–B.6/B.8 (schema, list, chat, send, receipts, translation), and D.2 (voice). All present from prior phases. Ready to proceed to Plan.

---

## Plan

### Phase Context
- Phase: 05 — Supermodule E: Group Chat Support (MVP+)
- Date: 2025-10-26
- Reason: Entering Planning Loop to prioritize E.1–E.10, confirm dependencies and regression scope.

### Current Status
- 1:1 messaging stable; translation, receipts, presence/typing, images, offline queue active.
- No group representation yet; UI assumes dyadic chats; avatars rendering in profile works but must be verified end‑to‑end in chat.

### Blockers / Unknowns
- Index requirements for membership queries (`array-contains` on `participants`) and combined sort with `lastMessageAt`.
- Performance under 6–10 participants for translation fan‑out and receipts.
- Existing listener cleanup patterns under rapid background/foreground cycles for multi‑participant threads.

### Scope and Priorities (maps to Dev Checklist)
- P0 — E.1 Firestore group schema, indexes, helpers (S–M)
- P0 — E.2 Frontend list/chat recognition with header and avatars (M)
- P0 — E.3 Message fan‑out translations + receipts validation (M)
- P0 — E.6 Lifecycle: auto‑populate, blank chat fix, lastMessage fields, deletion rules, listener cleanup (M–L)
- P1 — E.4 Voice playback scalability and UI parity (S)
- P1 — E.7 Profile image persistence and chat avatars (S–M)
- P1 — E.5 Demo: “European friends” seeded and validated (S)
- P2 — E.8–E.10 Perf, reconnection, validation (S)

### Dependency Graph (ASCII)
```
E.1 Schema/Indexes/Helpers
  ├─▶ E.2 Frontend list/chat recognition
  │     └─▶ E.6 Lifecycle fixes
  └─▶ E.3 Message fan‑out + receipts
        ├─▶ E.4 Voice playback validation
        └─▶ E.5 Demo scenario

E.7 Profile images ─▶ E.2 (avatars), E.5 (demo polish)
E.8/E.9 Perf/Reconnection ─▶ E.2–E.6
E.10 Validation ─▶ All
```

### Task Breakdown (ID, Effort, Acceptance)
- T1 (E.1) Firestore group setup — Effort: M
  - Acceptance: `type:"group"`, `participants[]`, `participantLanguages{}`, `title` stored; helper create/fetch; indexes live.
- T2 (E.2) Frontend handling — Effort: M
  - Acceptance: list shows groups with title + stacked avatars; chat renders sender names/mini‑avatars, parity with 1:1 animations.
- T3 (E.3) Message handling — Effort: M
  - Acceptance: per‑recipient translations appear; correct original/translated ordering; `readBy[]` and timestamps correct for all.
- T4 (E.4) Voice playback — Effort: S
  - Acceptance: play works per message for all languages; button visibility consistent.
- T5 (E.6) Lifecycle management — Effort: M–L
  - Acceptance: membership auto‑population; blank‑chat fixed; `lastMessage/lastMessageAt` update; soft delete for 1:1; remove user from group; delete when participants empty; listener cleanup stable through app cycles.
- T6 (E.7) Profile images — Effort: S–M
  - Acceptance: profile upload persists and reflects; avatars render in chats for senders; caching with initials fallback.
- T7 (E.5) Demo — Effort: S
  - Acceptance: “European friends” (EN/IT/FR) verified with real‑time translation and voice.
- T8 (E.8–E.10) Perf/Validation — Effort: S
  - Acceptance: p95 send→translate <1.5s @ 6–10 participants; reconnection no duplicates/blank; validation suite green.

### Risk Assessment and Mitigation
- Fan‑out latency: batch translation requests, debounce UI state; show sending states clearly.
- Index contention: pre‑create indexes; avoid hot documents by using per‑message docs and server timestamps.
- Listener leaks: centralize detach on deinit/background; defensive guards.
- Avatar loading spikes: caching + placeholder initials.

### Regression Planning (per Master Manifest)
- Impacted prior systems: Phase A (auth/profile/avatar/presence lifecycle), Phase B (list/messages/translation cache/notifications/offline).
- Checks to add:
  - B.R1/B.R2 list and delivery states remain within targets for group threads.
  - B.R4 translation cache unaffected; per‑user language render still correct.
  - B.R7 offline queue/replay unaffected by group routing.
  - A.R2/A.R3 login/profile untouched; presence lifecycle A.R4 remains accurate in group headers.

### Updated Success Criteria
- Group chats behave with parity to 1:1 for send, receipts, translation latency, voice playback, and animations; lifecycle and deletion behaviors correct; no regressions to A/B.

### Next Steps
1) Implement T1–T3 in order (schema → UI recognition → fan‑out).
2) Apply T5 lifecycle fixes and T4 voice validation.
3) Complete T6 profile images and T7 demo; run T8 regression/validation.

---

## Design

### Phase Context
- Phase: 05 — Supermodule E
- Date: 2025-10-26
- Design Scope: Conversation List and Chat UI updates for group conversations; avatars; headers; message cells; voice playback controls.
- References: PRD Section (Messaging & Group), Architecture map, Dev Checklist E.1–E.7.

### Visual Objectives
- Maintain parity with 1:1 aesthetics; introduce clear sender attribution and group identity.
- Keep animations smooth and unobtrusive; adhere to WCAG AA and Dynamic Type.

### Layout Descriptions (Textual Wireframes)

1) Conversation List Row (Group)
```
[Stacked Avatars]  [Title: European friends]
[LastMessage (translated/original preview)]          [Time]
[Participants: Alice, Marco, Chloé] (secondary, truncates)
```
States: unread (bold title, badge), muted (future), loading (skeleton), error (fallback avatar initials).

2) Chat Header (Group)
```
[<]  European friends           [...]
[Stacked Avatars Inline]  [n online]  (presence optional)
```
States: long titles ellipsize; avatars overlap with 4px offset.

3) Message Bubbles (Group)
```
[MiniAvatar]  Sender Name (13pt, 70% opacity)
┌─────────────────────────────────────┐
│ Top: Translated text (15pt, semibold)      │
│ Bottom: Original text (13pt, 70% opacity)  │
└─────────────────────────────────────┘   [Time ✓/✓✓]
[Play Voice] (if supported)
```
Rules: sender color accents differ subtly; own messages remain right‑aligned; others left‑aligned. Maintain existing bilingual ordering.

4) Composer + Read/Typing
```
[Typing indicator row (RTDB)]
[Composer Bar]
  [Text input ...]            [Send]
```
Typing shows for any participant; reduce noise with debounce (existing B.7).

### Component Specifications
- StackedAvatars
  - Max 3 visible; 24pt circles; 4px overlap; remaining count badge "+n".
  - Fallback: initials with brand colors.
- GroupTitleHeader
  - Title 17–20pt semibold; truncates middle if too long; accessibility label includes participant count.
- GroupMessageCell
  - Mini avatar 20pt; Sender Name label; bilingual text blocks; receipt/timestamp; voice button.
  - States: sending, sent, delivered, read; error retry.
- VoiceButton
  - Consistent placement; disabled if unsupported voice.

### Color & Typography System (reuse existing tokens)
- Colors: Navy #0E1B2E, Gold #F2C94C, Light Blue #D9E8FF, Gray 600 #6B7280.
- Typography: Titles 17–20pt semibold; Body 15pt; Secondary 13pt @ 70% opacity; line height ≥1.2x.

### Motion & Accessibility
- Appearances: fade+slide (150–200ms, ease‑out); reduce‑motion honored.
- Focus rings: 2pt accessible outlines on tappables.
- VoiceOver: announce sender name, language, and message time; avatars labeled with participant names and counts.
- Contrast: ≥4.5:1 text/background.

### Responsive Considerations
- iPhone portrait primary; ensure truncation rules and pill heights adapt to Dynamic Type.

### Next Steps & Open Questions
- Confirm final stacked avatar cap and overlap values on device.
- Confirm copy for sender label and timestamp format in group mode.
- Validate per‑message voice availability and fallback text.

---
