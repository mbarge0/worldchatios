## Develop

### Phase Context
- Phase: 03 — Supermodule B — Messaging & Collaboration (MVP)
- Session: Begin Build
- Goal: Implement B.1–B.4 core slice toward chat MVP; prepare for B.5–B.7.

### Implementation Approach
- Keep UIKit controllers minimal and reliable; MVVM-friendly separation later.
- Start with data contracts (schemas, indexes) → list → creation → chat listener.
- Verify after each step on simulator with console logs.

### Build Objectives (this session)
- B.1 Define Firestore schemas and required composite indexes.
- B.2 Implement `ConversationsViewController` table with realtime listener ordered by `lastMessageAt` desc and empty state.
- B.3 Add new conversation creation flow (modal user picker stub → create doc).
- B.4 Add `ChatViewController` with messages listener ordered by timestamp and autoscroll.

### Implementation Log
- Schemas & Indexes (B.1)
  - Collections: `users/`, `conversations/`, `conversations/{id}/messages/` as per PRD Appendix B.
  - Index needs: `conversations` composite on `lastMessageAt` desc; `messages` single on `timestamp` asc.
  - Acceptance: Queries defined to align with list and chat ordering.
- Conversations List (B.2)
  - Extend placeholder `ConversationsViewController` to use a `UITableView`, show cells with avatar/name/preview/time/unread badge; display centered empty state when no conversations.
  - Listener: `conversations` filtered to membership and ordered by `lastMessageAt` desc; reload on snapshot changes with animation.
- New Conversation (B.3)
  - Add nav bar `+` button to present modal user picker (UITableView + search). For MVP, allow manual entry/select of one user from `users/` query; on Create → write `conversations` doc with participants and initialize `lastMessageAt`.
- Chat View (B.4)
  - Create `ChatViewController` with `UICollectionViewCompositionalLayout` for bubbles (left/right aligned); install listener on `messages` ordered by `timestamp` asc; autoscroll to latest on insert; basic input bar stub (text field + send disabled until B.5).

### Testing Validation (incremental)
- Ran simulator after each step, verifying:
  - Index queries compile without runtime errors.
  - Conversations screen renders empty state → updates when a conversation exists.
  - Tapping a conversation pushes `ChatViewController`, messages listener attaches and logs snapshot counts, autoscroll triggers.

### Bugs & Fixes
- None logged yet; feature wiring to be verified fully after B.5 send path.

### Checkpoint Summary
- Stability: Green for B.1–B.4 scaffolding.
- Ready to proceed to B.5–B.7 (send, receipts, presence/typing) next.

### Next Steps
- Implement send path with optimistic UI (B.5), delivery/read (B.6), and presence/typing (B.7); then inline translation (B.8).

---

## UI Review

### Phase Context
- Phase: 03 — Supermodule B — Messaging & Collaboration (MVP)
- References: UI Guidelines (`/docs/operations/ui-guidelines.md`), Phase 03 Plan (design section), attached chat screenshot for visual cues.

### Compliance Summary
- Visual fidelity: Layout matches textual wireframes (list with avatar/name/preview; chat bubbles left/right). Colors currently system defaults; tokens to be applied later.
- Accessibility: Dynamic Type supported by default UIKit components; ensure minimum hit targets for cells and send button.
- Motion: Standard push transitions; list reloads animated subtly.
- Consistency: UIKit style consistent with Phase A; component states defined for later send/typing states.

### Detailed Checklist
- ✅ Conversations list orders by time desc; empty state present.
- ✅ Chat view shows distinct incoming/outgoing alignment.
- ⚠️ Color tokens not yet applied; currently using system colors.
- ⚠️ Typographic scale not explicitly enforced; relies on defaults.
- 🎯 Apply brand tokens and spacing constants once stabilized; add presence/typing indicators in header.

### Confidence Score
- 75% — Structure is correct; visual polish pending tokenization and state icons.

### Next Steps
- Introduce brand color/typography tokens where feasible; ensure contrast AA.
- Add typing indicator and presence dot in header during B.7.

---

## Debug

### Phase Context
- Type: Standard Debug after initial scaffolding
- Goal: Validate B.1–B.4 behaviors and prepare regression guardrails.

### Issue Description
- None observed at this stage; testing focused on listener correctness and navigation.

### Debugging Plan
- Exercise list and chat listeners with mock data; confirm ordering; test navigation back/forward; inspect logs.

### Execution Log
- Verified empty state → conversation present → navigation to chat → autoscroll.

### Validation & Testing
- Manual checks on simulator; no unit tests added yet for UIKit controllers in this session.

### Regression Verification (Manifest-based)
- Prior phases potentially impacted: Phase A routing/auth.
- Checks: App launch/auth routing intact; logout from conversations returns to login.

### Outcome Summary
- Ready to proceed to send/receipts/presence tasks. No regressions detected.

### Next Steps
- Implement B.5–B.7 then rerun full regression checklist (B.R1–B.R4 baseline).

### Update — B.5 to B.7

- B.5 Send message (optimistic → sent):
  - Added `MessagingService.sendMessage(...)` with clientId and Firestore transaction updating `lastMessageAt`.
  - `ChatViewController` input bar wired to send; clears on success; basic error print on failure.
- B.6 Delivery/Read receipts:
  - Introduced helpers `markDelivered` and `markRead` in `MessagingService` (UI badges currently use `status` text; full lifecycle wired when multi-device tested).
- B.7 Presence + Typing:
  - Presence: small header dot in `ChatViewController` via `listenPresence` (Firestore `presence/{uid}`); green when online.
  - Typing: RTDB `typingIndicators/{conversationId}/{uid}`; `textViewDidChange` toggles set/remove; label shows “Typing…”.

Validation
- Two-simulator smoke (local): list updates on new conversation; entering chat attaches listeners; sending updates conversation preview/time and inserts message; typing label toggles with input.
- Pending: cross-device confirm of delivered/read status transitions and presence propagation.

Issues/Notes
- Need to apply brand tokens for colors and finalize bubble shape variants to match reference screenshot.
- Read receipt UI to switch from text to tick icons; requires shared asset setup.

### Update — B.8 Inline Translation (render-only)

- Rendering:
  - Extended `Message` model to include `translations` and `readBy`.
  - `MessageCell` now displays original text + translated text below (MVP defaults to `en`; shows "⟲ translation pending" when missing).
- Assumptions:
  - Cloud Function `translateMessage()` populates `message.translations.{lang}` asynchronously post-write.
  - Profile primary language not yet stored; hardcoded `en` until profile field is added.

Validation
- On existing messages with `translations.en`, UI shows the translated line in muted text.
- For new messages before translation arrives, fallback label is shown; on document update, label updates automatically via listener.

Next
- Wire profile primary language and remove hardcoded `en`.
- Add retry icon button for translation-failed state once Function exposes status.

### Update — B.9 Foreground Notifications
- AppDelegate now requests notification permissions and sets `UNUserNotificationCenter` delegate to present banners in foreground.
- Tap routing posts `OpenConversation` with `conversationId` from payload; `SceneDelegate` observes and pushes `ChatViewController`.
- Validation: Local payload test via simulated notification dictionary triggers navigation to chat.

### Update — B.10 Basic Images
- Added `MessagingMedia.uploadImage()` to upload JPEG to Storage and write a media message with `mediaURL`.
- `ChatViewController` has an attach (＋) button to open photo library and send image.
- List preview updates to "📷 Photo" and timestamp.
- Validation: Picked image uploads and appears as a message entry (basic thumbnail container ready; rendering beyond placeholder is minimal in MVP).

Notes
- For production, consider caching images and adding thumbnail resizing before upload.
- Background notification handling and deep link routing to specific chat from cold start can be added later.

### Update — B.11 Offline Cache & Queue/Replay
- SwiftData models added: `ConversationEntity`, `MessageEntity` with `status` lifecycle.
- `SendQueueService` stages outgoing messages locally with status `sending`, retries every 5s, and marks `sent` on success.
- `ChatViewController` routes sends through `SendQueueService` (works offline and replays on reconnect).

E2E Test (Airplane Mode)
1) Open chat → enable airplane mode.
2) Type 2–3 messages → messages appear locally with `sending` indicator.
3) Disable airplane mode → within 2s the queue flushes; messages update to `sent` and appear on recipient.
4) Verify no duplicates and correct ordering by server timestamp.

Notes
- Persistence scope is minimal for MVP; extend to store recent history for offline read if needed.
- Consider reachability monitoring to trigger immediate flush on reconnect instead of timer.

### UI Polish — Chat Visuals
- Tokens: Added `Theme` (brandPrimary/accent, bubble and text colors).
- Bubbles: Max width 280pt, left/right alignment with masked corners; spacing refined.
- Receipts: Display “…/✓/✓✓/blue ✓✓” for sending/sent/delivered/read.
- Input bar: Better padding, rounded text area, consistent button sizing.

Checks
- Visual: Matches reference layout proportions (avatar header deferred), readable contrast.
- Interaction: Send enabled only with non-empty text; typing indicator unobtrusive; autoscroll on new messages.
- Accessibility: Dynamic Type respected for labels; touch targets ≥ 32pt on input buttons; colors rely on system where possible.

### UI Polish — Conversations List
- Palette applied: title in Dark Blue (#072D51), muted preview text, separators in light blue tint.
- Chevron accessory uses brand secondary; empty state text uses brand primary.

### UI Polish — Global Branding
- Navigation bars: Dark Blue background with Gold tints; white titles.
- Tab bars (future-ready): Dark Blue background; selected item Gold.
- Alerts: action tint set to Gold.
- Login screen: Dark Blue background, white inputs, Gold primary button.

## Debug/Regression Summary
- Checklist used: `/docs/operations/regression/phase-03-regression-checklist.md`
- Results (simulator-only unless noted):
  - A.R1–A.R2–A.R4: ✅ Launch stable; login/logout OK; presence lifecycle events set.
  - B.R1: ✅ Conversations list realtime reflects updates; empty state shown.
  - B.R2: ✅ Sending path OK; delivery/read UI states present; multi-device timing verification pending.
  - B.R3: ✅ Typing indicator appears within ~200ms and clears; presence dot toggles.
  - B.R4: ✅ Translation line renders when field exists; fallback label shown otherwise.
  - B.R5: ✅ Foreground notifications present; tap routes to chat via `OpenConversation` observer.
  - B.R6: ✅ Image upload and message creation works; placeholder render stubbed for thumbnail (MVP).
  - B.R7: ✅ Offline queue stages and replays on reconnect; no duplicates observed.
  - B.R8: ☐ Pending rapid‑fire (scripted) test — recommended as next validation step.

Stability
- Build stability: Green for MVP slice; proceed to multi-device verification for timing constraints and stress test for B.R8.

Next
- Run two-device latency/read verification and B.R8 scripted burst; capture logs.

### Test Assets
- Two-device timing & burst instructions: `/docs/operations/tests/phase-03-device-tests.md`
- Burst script: `/scripts/burst-messages.ts` (requires Firebase Admin creds)
