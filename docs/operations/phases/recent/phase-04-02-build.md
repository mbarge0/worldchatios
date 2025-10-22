# Phase 04 — Supermodule C: AI Assistant & Smart Replies — Build/Review/Debug

Date: 2025-10-22

---

## Build

### Phase Context
- Phase: 04 — Supermodule C (Post‑MVP)
- Session: Begin Build
- Goal: Implement C.1–C.4 baseline (specs, Functions stubs, UIKit UI), with resilience and no regressions to A/B.

### Build Objectives
- Server:
  - C.2 `askAI()` Function: retrieve last N messages; call OpenAI; return answer; add coarse cache hooks.
  - C.3 `generateSmartReplies()` Function: last 10 messages + style profile → 3 bilingual suggestions; add TTL cache + rate limiting placeholders.
- Client (UIKit):
  - AI access button from chat → full-screen modal.
  - Smart reply pills above keyboard; tap inserts editable text.

### Implementation Approach
- Keep AI calls strictly server-side in Cloud Functions; client uses a thin `AIService` with timeouts and friendly errors.
- Start with client mocks to validate UI and flows; swap in real endpoints once Functions are live.
- Constrain RAG context to last 20 messages (trimmed) to protect latency and cost.
- Add per-user/per-conversation request guards in client to avoid spamming.
- Preserve chat performance: AI requests run off main thread; UI is non-blocking.

### Implementation Log
1) Review & Contracts
   - Reviewed PRD §§6.4–6.5, architecture map, and Plan doc `phase-04-01-plan.md`.
   - Defined DTOs:
     - askAI: `{ conversationId, userId, lastN=20 } -> { answer, tokensUsed, latencyMs, cached }`
     - generateSmartReplies: `{ conversationId, userId, lastN=10 } -> { suggestions:[{original, translated}], tokensUsed, latencyMs, cached }`
   - Verification: Contracts align with C.2/C.3 acceptance criteria.
2) Client Service Stubs (planned)
   - Create `AIService` with methods `askAI(conversationId)` and `generateSmartReplies(conversationId)` returning mock data with artificial delay (success/timeout/error modes).
   - Add 10s client timeout and error mapping: timeout → “AI temporarily unavailable, try again.”
   - Verification: Unit tests on stub timing, error mapping.
3) UIKit Integration Points (planned)
   - `ChatViewController`: add 44pt floating AI button above keyboard safe area; tap → present `AIModalViewController`.
   - Add `SmartReplyPillsView` just above composer; horizontally scrollable, 8pt gaps.
   - Verification: Manual — layout renders correctly on iPhone 12/14 simulators; safe area respected.
4) AIModal (planned)
   - Header with Close/Title/Options; transcript list with user/AI bubbles; input row with Ask.
   - Loading skeleton for AI response; error banner with Retry.
   - Verification: Manual — open/close, submit mock query, show loading then mock answer.
5) Wire to Service (planned)
   - Replace mocks gradually: feature flag to target mock vs. live endpoint.
   - Add basic analytics logs: latencyMs, cached flag.
   - Verification: Integration — responses populate UI; pills insert editable text into composer.
6) Resilience & Guards (planned)
   - Debounce smart reply requests on keyboard show; cancel on hide.
   - Rate limiting UI: if limited, show small inline note; do not block chat.
   - Verification: Simulated rapid toggles; ensure no freezes or crashes.

### Testing Validation
- Unit (planned): `AIService` timeout, error mapping; DTO parsing.
- Integration (planned): Chat VC ↔ `AIService` mocks; pill tap inserts text; modal ask → response flow.
- E2E (planned): Two-device chat unaffected while AI requests in flight.

### Bugs & Fixes
- None at this planning/build kickoff stage.

### Checkpoint Summary
- Build kickoff complete; contracts and UI plan ready; proceed to implement stubs and UI.

### Next Steps
1) Implement UIKit components: AI button, modal, and pills row with mock data injection.
2) Add service layer stubs for `askAI` and `generateSmartReplies` with timeout/error handling.
3) Replace mocks with real endpoints when Functions are available; then re‑run tests.

---

## UI Review

### Phase Context
- References: UI Guidelines (`/docs/operations/ui_guidelines.md`), Phase 04 Design in `phase-04-01-plan.md`.

### Compliance Summary
- Visual fidelity: Aligns with brand tokens (navy/gold/light blue) and 8pt grid.
- Accessibility: Designs specify Dynamic Type, focus rings, and minimum tap targets.
- Interactivity: Pills tap-to-insert; AI modal supports loading and retry.

### Detailed Checklist
- ✅ Pills row above composer, ~44pt height, horizontal scroll, 8pt gaps.
- ✅ Pill typography: 15pt primary, 13pt secondary @ 70% opacity.
- ✅ AI button 44pt circular with gold fill and navy icon.
- ⚠️ Confirm exact contrast ratios for light/dark modes.
- ⚠️ Validate VoiceOver labels for pills and AI modal actions.
- ⚠️ Verify Dynamic Type scaling does not overflow pills; cap at two lines with ellipsis.
- ✅ Motion: 150–200ms ease for appearances; respect Reduce Motion.

### Confidence Score
- 85% visual compliance pending device check for contrast and Dynamic Type wrapping.

### Next Steps
- Verify on device; adjust pill truncation and spacing if needed.
- Finalize iconography and a11y labels.
 - Confirm tab order and accessibility focus in modal; ensure dismiss via swipe and Escape.

---

## Debug

### Phase Context
- Type: Standard Debug (post-build validation once wired).

### Issue Description
- Pending until live integration; expected areas: latency timeouts, cache misses, rate limiting triggers.

### Initial Diagnosis
- Ensure service timeouts and retries are bounded; UI fallbacks non‑blocking.

### Debugging Plan
- Simulate success/timeout/error via mocks; log timings; validate pills insertion and modal usability.

### Validation & Testing
- Unit: service call wrappers, payload shaping.
- Integration: client ↔ mock Functions; then real Functions.
- E2E: open modal from chat, ask question, receive response; open keyboard, see 3 pills <1.5s.

### Regression Verification
- Use Master Manifest to confirm A/B features unaffected: delivery states latency, translation cache, offline queue.

### Outcome Summary
- Will document after live integration.


