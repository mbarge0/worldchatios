# Phase 05 — Supermodule E: Group Chat Support (MVP+)

Date: 2025-10-26

---

## Build

### Implementation Approach (Aligned to Dev Checklist E.1–E.10)
- E.1 Firestore: add `type: "group"`, `participants[]`, `participantLanguages{[uid]: langCode}`, `title`; add composite indexes; implement helpers (create/fetch by membership).
- E.2 Frontend: Conversation List recognizes groups; Chat view renders group title, stacked avatars, sender attribution; maintain parity with 1:1.
- E.3 Messaging: adapt send to translate per participant language; verify `readBy[]`, timestamps; preserve message ordering.
- E.4 Voice: reuse current playback; ensure button visibility and per‑message language selection.
- E.6 Lifecycle: auto‑populate by membership; fix blank new‑chat; keep `lastMessage/lastMessageAt`; delete rules (1:1 soft delete; group membership removal → delete when 0 participants); listener cleanup/reconnect.
- E.7 Profile images: persist on profile and render avatars in list and message cells.
- E.5/E.8–E.10: Demo seed; performance and reconnection stability; validation.

### Step‑by‑Step Build Log (Incremental Verification)
1) E.1 Firestore group schema and helpers
   - Actions:
     - Define `conversations/{id}` fields: `type`, `participants`, `participantLanguages`, `title`, `lastMessage`, `lastMessageAt`.
     - Add composite indexes: `(participants array-contains, lastMessageAt desc)`; confirm messages subcollection queries remain indexed.
     - Implement helpers:
       - `createGroupConversation(title, participants[], participantLanguages{})`
       - `fetchUserConversations(uid)` → query by `participants` contains `uid`, order by `lastMessageAt` desc.
   - Verification:
     - Emulator/console: create and fetch; index console shows READY; scale test with ≥10 participants.

2) E.2 Frontend handling (list + chat)
   - Actions:
     - Update list VM/query to use membership filter; render group cells with stacked avatars + title; show lastMessage/lastMessageAt.
     - In Chat view, detect `type: group`; show sender mini avatar + name; maintain bilingual text order.
   - Verification:
     - Simulators (2–3): real‑time insert/update/delete propagate; animations remain smooth; headers show correct title and avatars.

3) E.3 Message handling (translation + receipts)
   - Actions:
     - On send, derive `targetLangs = participantLanguages.values - senderLang`; request per‑recipient translations (reuse Function/cache).
     - Ensure receipts: update `readBy[]` and timestamps; maintain client UI of `sending → sent → delivered/read`.
   - Verification:
     - 3 devices (EN/IT/FR): each sees own language on top; receipts update within 2s.

4) E.4 Voice playback (multi‑participant)
   - Actions:
     - Reuse voice playback logic; select voice based on viewer’s language or message target; maintain visibility rules.
   - Verification:
     - Manual: play/pause on mixed‑language messages across participants; no UI regressions.

5) E.6 Lifecycle & stability
   - Actions:
     - Auto‑populate list when `uid ∈ participants`.
     - Fix blank new‑chat: ensure messages listener attaches to the correct subcollection immediately after creation.
     - Update `lastMessage/lastMessageAt` on new send for all participants.
     - Deletion rules: 1:1 soft delete per‑user list; group → remove current user; if `participants` becomes empty → delete doc.
     - Listener cleanup: centralize detach on deinit/background; reconnect on foreground without duplicates.
   - Verification:
     - Background/foreground cycles: no duplicate listeners or blank states; message sync persists; deletion behaves as specified.

6) E.7 Profile images
   - Actions:
     - Confirm upload persists in profile; wire avatar URL into list cells and message cells; add caching and initials fallback.
   - Verification:
     - Profile page shows selected image after save; avatars appear in list/chat; offline fallback displays initials.

7) E.5 Demo scenario: “European friends”
   - Actions:
     - Seed Firestore with group (EN/IT/FR). Send cross‑language messages; verify translations + voice.
     - Script provided: `scripts/seedGroupDemo.ts`
       - Prereq: set `GOOGLE_APPLICATION_CREDENTIALS` or connect to Emulator (`FIRESTORE_EMULATOR_HOST=localhost:8080`).
       - Run: `npx ts-node scripts/seedGroupDemo.ts`
   - Verification:
     - Each user sees messages in their own language; voice playback aligns with user language; receipts/timestamps correct.

8) E.8–E.10 Performance & validation
   - Actions:
     - Burst send tests; reconnection stress; finalize validation checklist.
     - Performance: `scripts/burst-messages.ts <conversationId> <senderId> [count=20]`
       - Example (after seeding): `npx ts-node scripts/burst-messages.ts <convoId> demo-en 40`
     - Reconnection: background/foreground the app 10x; toggle network (simulator) and confirm no duplicate listeners or blank states.
   - Verification:
     - p95 send→translate <1.5s at 6–10 participants; no index/throughput errors; regression suite green.

---

## UI Review

### Phase Context
- Phase: 05 — Supermodule E
- References: Design spec (`/docs/operations/phases/recent/phase-05-01-plan.md`), UI Guidelines (`/docs/operations/ui_guidelines.md`), Build Log (this file)

### Compliance Summary
- Visual fidelity: Headers, stacked avatars, and sender attribution follow plan.
- Accessibility: Maintain Dynamic Type, contrast, focus rings; VoiceOver labels include sender, language, and time.
- Responsiveness: Single‑column iPhone portrait; truncation rules on long titles and participant lists.
- Interactivity: Bilingual bubbles maintain existing ordering; voice buttons consistent; animations subtle (150–200ms).
- Consistency: Reuses brand tokens and spacing from guidelines.

### Detailed Checklist
- ✅ Stacked avatars (max 3, 4px overlap, +n badge)
- ✅ Group header title with truncation and participant count a11y label
- ✅ Sender mini avatar + name in left‑aligned bubbles; right‑aligned for self
- ✅ Bilingual text blocks with correct order and typography
- ✅ Voice playback button visibility consistent across cells
- ⚠️ Verify long group titles at extreme lengths on smaller devices
- ⚠️ Validate avatar caching behavior under network throttling

### Confidence Score
- Visual compliance: 92%
- Priority fixes before QA: edge case truncation rules; avatar cache stress.

---

## Debug

### Phase Context
- Phase: 05 — Supermodule E
- Session Type: Standard Debug (post‑build validation)

### Validation & Testing Plan
- Unit
  - Participant language resolution; helper APIs; list cell view models.
- Integration
  - Membership queries and list listener; messages listener in group; `readBy[]` updates.
  - Translation fan‑out across 3 locales; avatar persistence and rendering.
- E2E
  - Demo group scenario; lifecycle deletion flows; background/foreground reconnection without duplicates.

### Regression Checklist (derived from Master Manifest)
- A — Platform
  - A.R2 Auth flows unaffected; navigation to conversations intact
  - A.R3 Profile bootstrap + avatar upload consistent
  - A.R4 Presence lifecycle maintained
- B — Messaging
  - B.R1 List realtime updates correct
  - B.R2 Send/receive states within latency targets
  - B.R4 Translation cache behavior intact
  - B.R7 Offline queue/replay unaffected

### Outcomes & Criteria
- Done when: E.1–E.7 acceptance pass; E.8–E.10 performance targets met; A/B regression checks green.
- Evidence: emulator logs, device screenshots, and run notes attached to this phase.

### Next Steps
- Address UI review issues; re‑run avatar caching under throttled network.
- Prepare reflection and checkpoint commit for Phase 05 completion.

---

## QA Runbook (Device/Simulator)

1) Seed Demo
- `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json` (or `export FIRESTORE_EMULATOR_HOST=localhost:8080`)
- `npx ts-node scripts/seedGroupDemo.ts`

2) Verify Group List and Header
- Open the app, confirm “European friends” shows with composite avatars and updates on new messages.
- Enter chat, confirm stacked avatars next to title, correct participant count.

3) Translation & Voice
- Log in as each demo user (`demo-en`, `demo-it`, `demo-fr`) and send messages.
- Each user should see their language on top, original below; voice speaks the top line language.

4) Receipts & Lifecycle
- Read receipts update for all participants; swipe to Leave (group) or Remove (1:1) works as specified.
- Background/foreground 10x, toggle network; no duplicate listeners or blank states.

5) Performance
- Get conversationId from console logs or Firestore.
- Run burst: `npx ts-node scripts/burst-messages.ts <conversationId> demo-en 40`.
- Confirm p95 send→translate <1.5s @ 6–10 participants; no index/throughput errors.

6) Regression Checklist
- Track results in `docs/operations/regression/phase-05-regression-checklist.md`.
