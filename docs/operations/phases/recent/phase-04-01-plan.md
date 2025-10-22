# Phase 04 — Supermodule C: AI Assistant & Smart Replies (Post‑MVP)

Date: 2025-10-22

---

## Start

### Phase Overview
- Phase: 04 — Supermodule C: AI Assistant & Smart Replies (Post‑MVP)
- Mode: Start (Consolidated Planning begins here)
- References: PRD (`/docs/foundation/prd.md`), Architecture (`/docs/foundation/architecture.md`), Dev Checklist (`/docs/foundation/dev_checklist.md`), Coding Rules (`/docs/operations/coding_rules.md`)

### Previous Phase Summary (from Phase 03 Reflect)
- Delivered: Conversations list, chat view, optimistic send, delivery/read receipts, presence (Firestore), typing (RTDB), inline translation render, basic images, offline queue/replay, foreground notifications, profile editing with avatars, unified brand theming.
- Stability: Linter clean; listeners/lifecycles are explicit; core two‑device flows pass manually.
- Open items: Translation language should use profile primary language; image thumbnails/caching can be improved; background push routing pending backend Function; device validations (latency, burst) recommended.
- Environment: Firebase configured (Auth, Firestore, Storage, Realtime DB, FCM); iOS 16+, Xcode 15+; app builds and runs.

### Objective for this Phase
Add post‑MVP AI capabilities safely on top of stable messaging:
- Server: `askAI()` (RAG over last N messages) and `generateSmartReplies()` (3 bilingual suggestions using user style) as Cloud Functions with caching and rate limiting.
- Client (UIKit):
  - AI Assistant modal accessible from chat.
  - Smart reply pills above the keyboard; tap to insert editable text.
- Reliability: Graceful timeouts/fallbacks; do not block chat if AI is unavailable.

### Constraints
- Maintain architectural consistency (Functions boundary for external AI APIs; client holds no AI keys).
- Preserve stability of Supermodules A and B (Auth, Profiles, Messaging, Translation, Notifications, Offline).
- Follow repo conventions for files, naming, and docs; UIKit remains the client framework for this module.

### Scope
- Included (Phase 04):
  - C.1 Confirm model, quotas, prompts, and guardrails; spec doc.
  - C.2 Implement `askAI()` Function (OpenAI) with RAG context from last N messages.
  - C.3 Implement `generateSmartReplies()` Function using style profile.
  - C.4 Client UI: AI modal and smart reply pills (UIKit) with insertion/edit.
  - C.5 Caching (Firestore/Memory) and rate limiting; logs/metrics.
  - C.5a Client UX: tone selector for smart replies; long‑press message → “Ask AI (explain)”; prefetch on keyboard focus.
  - C.5b Observability & auth: latencyMs + cached flags; Functions verify Firebase ID token (and App Check if enabled).
  - C.6 Timeout/failure UX with retry; non‑blocking degradation.
  - C.7 Regression mapping and verification for A–B.
- Excluded/Deferred:
  - Background notification polish (owned by Phase B follow‑ups).
  - Conversation summarization, OCR, voice messages (future phases).
  - Advanced personalization/LLM fine‑tuning; multi‑provider routing.

### Risks and Assumptions
- Risks: API latency/downtime; quota limits; cost spikes; over‑fetching context; UI crowding above keyboard.
- Mitigation: Timeouts (≤30s), retries guarded, TTL caches, rate limits, narrow context window (e.g., last 20 messages), minimal UI and dismissible surfaces.
- Assumptions: OpenAI and Firebase quotas available; user primary language present in profile; stable messaging foundations intact (Phase 03 complete).

### Testing Plan (Phase 04)
- Unit: formatting/parsing of AI payloads; style profile updates; input sanitation.
- Integration: Cloud Functions (askAI, smartReplies) with golden prompts; Firestore context retrieval; cache/rate‑limit logic.
- UI/E2E: AI modal access from chat; response within p95 targets; smart replies appear <1.5s; tap‑to‑insert editable; failure fallback non‑blocking.

### Step‑by‑Step Implementation Plan
1) C.1 Author AI spec: prompts, models, quotas, guardrails, rate limits, cache strategy.
2) C.2 Implement `askAI()` Function: fetch last N messages, compose prompt, call OpenAI, return response; add caching.
3) C.3 Implement `generateSmartReplies()` Function: context + style profile → 3 bilingual suggestions; add TTL cache + rate limits.
4) C.4 UIKit UI: add AI entry point from chat; present modal; render messages; input/send; pills above keyboard with insertion.
5) C.5 Observability: logs, basic metrics; error categories.
6) C.5a Client UX: tone selector; long‑press Ask AI; prefetch on keyboard focus.
7) C.5b Auth: verify ID token/App Check in Functions; client handles 401/429 gracefully.
8) C.6 Resilience: timeouts, retries, friendly errors, offline behavior.
9) C.7 Regression checks: validate A–B critical paths unaffected.

### Expected Outcome (Definition of Done)
- Functions deployed and gated; UIKit UI integrated; AI responses within targets (3s p95 assistant, 1.5s smart replies) under nominal load; cache and rate limits active; regression suites for A–B remain green; documentation updated in this file and AI spec.

### Checkpoint Readiness Summary
- Dependencies aligned per Dev Checklist: requires A.4 (Firebase setup) and B.4 (chat in place). Confirmed present from Phase 03.
- Proceed to Plan step.

---

## Plan

### Phase Context
- Phase: 04 — Supermodule C: AI Assistant & Smart Replies
- Date: 2025-10-22
- Reason: Entering Planning Loop to sequence C.1–C.7, align risks, and define regression scope.

### Current Status
- Messaging stack is stable (Phase 03). Foreground notifications and inline translation rendering are working; device validations pending but non‑blocking for C.
- No AI Functions exist yet; UI entry points for AI are not present.

### Issues and Blockers
- OpenAI quotas and keys must be configured in Cloud Functions env.
- Cost and latency risks; require caching and rate limiting from day one.
- RAG context sizing: keep under token limits; prefer last 20 messages, trimmed.

### Scope Adjustments
- Keep Phase 04 limited to assistant modal + smart replies. Defer summarization and background notification polish.

### Risk Assessment
- Latency spikes → set 10–15s client timeout; 30s server hard timeout.
- Abuse/rate spikes → per‑user rate limiting and per‑conversation backoff.
- Context privacy → send only participant‑visible messages; respect security rules.

### Dependency Graph (ASCII)
```
C.1 Spec/Quotas
  ├─▶ C.2 askAI() Function
  │     └─▶ C.4 AI Modal UI
  └─▶ C.3 smartReplies() Function
        └─▶ C.4 Smart Reply Pills UI

C.5 Caching/Rate Limits ─┬─▶ C.2
                         └─▶ C.3

C.6 Timeout/Fail UX ─▶ C.4

C.7 Regression Plan ─▶ All
```

### Task Breakdown (maps to Dev Checklist C.1–C.7)
- T1 (C.1) AI spec and guardrails
  - Acceptance: Spec doc exists; models, prompts, quotas, rate limits defined.
  - Effort: S
  - Dependencies: A.4, B.4
- T2 (C.2) Implement `askAI()`
  - Acceptance: p95 <3s, relevant answers; cached common Q&A.
  - Effort: M
  - Dependencies: T1
- T3 (C.3) Implement `generateSmartReplies()`
  - Acceptance: 3 bilingual suggestions <1.5s; style applied.
  - Effort: M
  - Dependencies: T1
- T4 (C.4) UIKit UI: AI modal + pills
  - Acceptance: Modal accessible from chat; pills insert editable text.
  - Effort: M
  - Dependencies: T2, T3
- T5 (C.5) Cache + Rate limiting
  - Acceptance: TTLs and per‑user/per‑conv caps enforced; logs present.
  - Effort: S
  - Dependencies: T2, T3
- T6 (C.6) Timeout/fallback UX
  - Acceptance: Friendly error; retry; chat remains responsive.
  - Effort: S
  - Dependencies: T4
- T7 (C.7) Regression verification
  - Acceptance: A/B core flows green; no listener regressions.
  - Effort: S
  - Dependencies: T4–T6

### Critical Path
T1 → (T2 and T3 in parallel) → T4 → (T5, T6) → T7

### Regression Plan (per Master Manifest)
- Impacted systems: Phase A (Auth, profiles, presence lifecycle), Phase B (messaging send/receive, translation cache, notifications, offline queue).
- Checks to add:
  - B.R2 delivery states remain within latency targets during AI calls.
  - B.R4 translation cache unaffected by AI context reads.
  - B.R7 offline queue/replay unaffected by AI UI integration.
  - A.R2/A.R3 auth/profile unaffected by AI modal navigation.

### Updated Success Criteria
- Assistant responds p95 <3s; Smart replies <1.5s; cache hits recorded; rate limits enforced; no degradation to Phase A/B KPIs.

### Next Steps
1) Author and commit AI spec (T1).
2) Build Functions stubs (T2, T3) with mocked outputs; wire logs.
3) Implement UIKit UI (T4) with loading/error states.
4) Add caching/rate limiting (T5) and resilience (T6).
5) Run regression checks (T7) and document results.

---

## Design

### Phase Context
- Phase: 04 — Supermodule C
- Date: 2025-10-22
- Design Scope: AI Assistant modal and Smart Reply pills within existing UIKit chat flow.
- References: PRD 6.5 and 6.4; Architecture supermodule map; brand theming from Phase 03.

### Visual Objectives
- Clarity and minimalism; never obstruct message reading or typing.
- Maintain brand: dark navy base, gold accents, light blue neutrals.
- WCAG AA contrast and Dynamic Type compliance; motion subtle and responsive.

### Layout Description (Textual Wireframes)

1) Chat Screen (with keyboard open)
```
[NavBar]
[Messages (scrollable)]
[Smart Reply Pills Row]
  ( [Pill 1]  [Pill 2]  [Pill 3]  )  → horizontal scroll, 8pt gaps
[Composer Bar]
  [Text input ...]    [Send]
  [AI Button ○] (floating, bottom-right above keyboard safe area)
```
Notes:
- Pills row sits directly above composer, inside safe area; height ~44pt; horizontally scrollable.
- AI Button: 44pt circular, elevated; tap opens AI modal.

2) AI Assistant Modal (Full-screen, sheet style)
```
[Modal Header]
  [Close]        AI Assistant        [Options]
[Conversation Context Banner] (inline info: “Using last 20 messages”) 
[Assistant Transcript]
  [User Q]  [AI A] blocks with timestamps
[Input Row]
  [Question textfield ...]   [Ask]
  [Latency / status inline]
```
States:
- Loading: skeleton bubbles for AI response.
- Error: inline non-blocking banner with Retry.
- Empty: helper suggestions (“What does ‘che bello’ mean?”).

### Component Specifications
- Smart Reply Pill
  - Container: rounded pill, 14pt vertical / 16pt horizontal padding.
  - Primary line: translated text, semibold 15pt.
  - Secondary line: original text, regular 13pt, 70% opacity.
  - States: default, focused (on selection), disabled (loading insert).
  - Interaction: tap fills composer; haptic light.
- AI Button
  - 44pt circle; gold fill; navy icon (sparkles or chat-bubble).
  - Shadow: y=2, blur=8, opacity 15%.
  - Accessibility label: “Open AI Assistant”.
- AI Transcript Cell
  - User: right-aligned bubble (brand blue), text white.
  - AI: left-aligned bubble (light neutral), text navy.
  - Copy affordance via long-press.
  - Loading: gradient shimmer placeholder.
  - Error: red icon + retry text button inline.
- Input Rows
  - Min height 44pt; 8pt grid spacing; clear placeholder text.

### Color & Typography System
- Colors (reusing Phase 03 tokens):
  - Navy: #0E1B2E (bg/text on light surfaces)
  - Gold: #F2C94C (CTA/pills focus)
  - Light Blue: #D9E8FF (AI bubble)
  - Gray 600: #6B7280 (secondary text)
- Typography:
  - Titles: 17–20pt semibold (Dynamic Type aware)
  - Body: 15pt regular
  - Secondary: 13pt regular, 70% opacity
  - Minimum line height: 1.2x for bilingual lines

### Motion & Interaction
- Pills appear with fade+slide up (150ms, ease-out) when keyboard opens; reduce motion setting disables animations.
- AI response reveals per paragraph with 150ms fade; skeleton shimmer 1.1s.
- Focus ring on pills/input: 2pt outline, accessible color.

### Responsive & Accessibility
- iPhone 12–15 portrait: single-column layout.
- Dynamic Type: wrap pill text to two lines max; truncate with ellipses.
- VoiceOver labels:
  - Pills read as “Smart reply suggestion: [translated]. Double-tap to insert.”
  - AI modal controls labeled with traits (button, header).
- Contrast: ensure ≥4.5:1 for text on backgrounds.

### Design Assets Summary
- Components: SmartReplyPill, AITranscriptCell (user/AI variants), AIActionButton, AIModalHeader, ComposerPillsRow.
- Icons: chat-bubble/sparkles; error/retry; loading shimmer asset.

### Next Steps & Open Questions
- Confirm final copy for empty states and error messages.
- Confirm OpenAI model and token budget caps for latency targets.
- Validate pill height and tap targets on device.

Pause here for any design/scope clarifications before Build.

