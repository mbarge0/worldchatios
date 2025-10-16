# Phase-XX — Consolidated Plan (Start · Plan · Design)

Supermodule — AI Agent, LangChain Orchestration, Voice & Brand UX (Modules B1–B5)

Date: {{today}}

References:
- Previous phase: `/docs/operations/phases/sm-d2-04-debug.md`
- PRD/Architecture: `/docs/foundation/prd.md`, `/docs/foundation/architecture.md`
- Dev Checklist (Supermodule B): `/docs/foundation/dev_checklist.md`
- Regression Manifest: `/docs/operations/regression/00_master_regression_manifest.md`

---

## Start Step (Phase Starter)

### Phase Overview
- Phase: XX — Supermodule B (AI Agent, LangChain Orchestration, Voice & Brand UX)
- Goal: Deliver an interactive AI agent with OpenAI tool use via server proxy and LangChain orchestration, integrated chat and voice interfaces, unified AI state, and brand-aligned UI polish.
- Deliverables (map to Dev Checklist):
  - B1 OpenAI Integration: Server-side proxy `/api/openai`, function calling to canvas tools, per-user rate limit (3 QPS), secure env.
  - B2 LangChain Orchestration: Multi-turn agent with tool selection, short-term memory (idle timeout 10m), debug-only chain logs.
  - B3 Chat Interface: Collapsible right-side drawer on canvas, sticky input, assistant avatar, inline action/error surfacing, “Undo last AI action”.
  - B4 Voice I/O: Web Speech API input → populates chat; Speech Synthesis output with adjustable rate/pitch; keyboard-accessible voice toggle.
  - B5 Shared AI State & Brand UI: Persist AI session context (conversation + tool history) per user+canvas in Firestore; apply Matt Barge palette; relocate toolbar left; zoom smoothness; a11y pass.

### Previous Phase Summary Alignment
- From `sm-d2-04-debug.md`:
  - Verified presence/toolbar accessibility and cursor/visual polish behaviors; fixed crash on `localeCompare` in `app/c/[canvasId]/page.tsx` and suppressed transient presence errors in `lib/hooks/usePresence.ts`.
- Implication for this phase:
  - Canvas route and presence hooks are stable, suitable for integrating a chat drawer and AI-generated actions.
  - We must keep presence and transforms performant while adding agent-driven operations.

### Scope
- Included:
  - Server proxy to OpenAI with function calling for existing canvas action helpers (`lib/ai/actions.ts`).
  - LangChain/LangGraph orchestration with short-lived memory; debug logs gated behind dev flag.
  - Chat drawer UX on `/c/[canvasId]` including assistant identity and action review/undo.
  - Voice input (Web Speech API) and speech synthesis for assistant replies.
  - Firestore persistence of AI session context (per user+canvas), brand palette application, toolbar relocation, zoom/placement polish, a11y/contrast check.
- Explicitly excluded/deferred:
  - Non-browser STT/TTS, server-side audio processing, streaming STT.
  - Advanced agents (multi-agent, tools beyond canvas scope) and long-term knowledge base.
  - Cross-browser voice parity beyond Chrome/Edge for initial pass.

### Risks and Assumptions
- Assumptions:
  - `lib/ai/actions.ts` exposes idempotent actions (A5) and can be safely invoked by the agent.
  - OpenAI API available and keyed via `OPENAI_API_KEY` in `.env.local`; keys never exposed client-side.
  - Firestore read/write quotas are sufficient for session context.
- Risks & Mitigations:
  - Voice API variability (Safari/Firefox): gate with capability checks; document fallback to text.
  - Tool misuse from LLM: strict schema validation + safe guards in tool handlers; dry-run mode in dev.
  - Performance regression from orchestration: debounce, background processing where possible; respect <100ms tool latency target for UI updates.
  - Privacy/logging: ensure no secrets/PII in debug logs; redact prompts when needed.

### Testing Focus
- Unit: tool schema handlers, LangChain pipeline units, voice utilities.
- Integration: chat UI ↔ API proxy ↔ agent tool calls; AI state persistence; speech toggle wiring.
- E2E: "Draw a circle" → object appears; reload restores messages; voice input/output verified.
- Suggested paths:
  - `tests/unit/ai/tools.spec.ts`, `tests/unit/ai/langchain.spec.ts`, `tests/unit/voice/voice-utils.spec.ts`
  - `tests/e2e/ai-agent.spec.ts`, `tests/e2e/chat-voice.spec.ts`

### Implementation Plan (High-Level)
1) B1: Create `/api/openai` route with function-calling and 3 QPS/user rate limit; wire env; add error handling.
2) B2: Add orchestration (LangChain/LangGraph), configure short memory (idle 10m), debug-only reasoning logs.
3) B3: Build chat drawer UI on canvas page; assistant avatar/bubbles; show action/error; "Undo last AI action" button.
4) B4: Add voice input (Web Speech API) and speech synthesis; keyboard-accessible toggle and status.
5) B5: Persist AI session context in Firestore; apply brand palette; move toolbar left; zoom/placement polish; run a11y/contrast checks.

### Expected Outcome (Definition of Done)
- End-to-end: user → chat/voice → agent selects tool → canvas updates → response rendered.
- Voice input/output reliable on Chrome/Edge.
- Brand palette applied consistently; toolbar relocated; 60 FPS maintained; <100ms tool latency typical.
- No secrets exposed; errors handled gracefully.

### Checkpoint Preparation
- Verify env configured and proxy secured; confirm Firestore rules unchanged by new collections.
- Establish debug logging policy (dev-only); set feature flags where applicable.
- Suggested commit message: "phase-XX: plan start complete for Supermodule B (B1–B5)"

---

## Plan Step (Planning Loop)

### Phase Context
- Current position: Entering Supermodule B; MVP modules (#1–#12) stable; A1–A5 abstractions exist (notably `lib/ai/actions.ts`).
- Date: {{today}}

### Task Priority, Dependencies, Effort (Estimates)
1. B1 OpenAI Integration — P0 — Depends: Env/Secrets — Effort: 6–8h
2. B2 LangChain Orchestration — P0 — Depends: B1, A5 actions — Effort: 8–12h
3. B3 Chat Interface — P1 — Depends: Canvas route, store — Effort: 8–10h
4. B4 Voice I/O — P1 — Depends: B3 input plumbing — Effort: 6–8h
5. B5 Shared State & Brand UI — P1 — Depends: B3, Data layer — Effort: 8–12h

### Mapping to PRD/Checklist
- Dev Checklist Supermodule B (B1–B5): all tasks map directly to new section in `dev_checklist.md`.
- PRD Sections: AI agent interactions, canvas tool control, chat/voice UX.
- Architecture: App Router API routes, Firestore persistence, canvas actions abstraction.

### Current Status
- Canvas and presence stable per last debug; action helpers exist; chat components exist in repo (message list/input) and will be adapted for agent drawer on canvas.

### Issues and Blockers
- Rate limiting mechanism choice (edge vs API route local): select per Next.js runtime available.
- LangChain/LangGraph version compatibility in Next.js App Router.
- Voice API availability across browsers; plan fallback UX.

### Scope Adjustments
- Keep memory ephemeral (10 min idle reset) to avoid unexpected cross-session behavior.
- Limit toolset to canvas actions already abstracted (create/move/resize/rotate/text, get state); defer complex tooling.

### Risk Assessment (Updated)
- Performance: monitor tool latency; batch UI updates; keep rAF rendering.
- Security: server-only keys; validate tool args; sanitize logs.
- A11y: ensure drawer/voice toggle fully keyboard-accessible; maintain contrast.

### Regression Plan
- Potentially affected systems (from Master Regression Manifest and project modules):
  - #2 Authentication (auth gate must still function)
  - #4 Canvas Engine & UI (60 FPS, transforms, selection)
  - #5 Data Model & Persistence (schema adherence, reload restore)
  - #6 Realtime & Presence (cursor latency, listeners)
  - #7 Conflict Handling (locks, LWW)
  - #9 Security Rules (no new bypass via AI route/state)
  - #10 Observability & Performance (Sentry capture, batching)
  - #12 QA (MVP E2E stays green)
- Add regression checks to this phase’s Debug loop accordingly.

### Updated Success Criteria
- Unified acceptance from Supermodule B met; no MVP regressions; voice reliable on supported browsers.

### Next Steps
1. Implement B1 API proxy with rate limit + tests.
2. Implement B2 orchestration and memory; wire to tools.
3. Build B3 drawer UI and integrate with canvas actions; add undo.
4. Add B4 voice input/output; accessibility controls.
5. Add B5 persistence/brand polish; run a11y + perf checks.

---

## Design Step (Design Loop)

### Phase Context
- Phase: XX — Supermodule B (Design scope: Chat drawer, voice controls, brand theme, toolbar relocation, zoom polish)
- Date: {{today}}

### Visual Objectives
- Clear, accessible chat and voice interactions without obstructing canvas work.
- Strong, consistent personal brand palette across login, toolbar, and chat.
- Maintain responsiveness and performance (60 FPS interactions, subtle motion).

### Layout Description (Textual Wireframes)

Canvas Route `/c/[canvasId]` — Desktop

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header: Auth + PresenceBar                                                   │
├───────┬───────────────────────────────────────────────────────┬─────────────┤
│Toolbar│                    Canvas Stage                       │ Chat Drawer │
│(Left) │  (pan/zoom area; selection; transforms; guides)      │ (Right,     │
│       │                                                       │ collapsible)│
├───────┴───────────────────────────────────────────────────────┴─────────────┤
│ Sticky Status Bar (optional): connection/AI mode indicators                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

Chat Drawer (Right Panel)

```
┌──────── Chat Header ────────(Assistant avatar • Title • Voice toggle) ──────┐
│ Message List (bubbles: Assistant distinct style; action/error annotations)   │
│                                                                              │
│ Sticky Input Row: [Mic] [Text input…] [Send] [Undo last AI action]          │
└──────────────────────────────────────────────────────────────────────────────┘
```

Mobile/Tablet
- Drawer becomes full-screen overlay slide-in; toolbar collapses to icons.
- Input remains sticky; gestures respected (avoid conflicts with canvas pan).

### Component Specifications
- ChatDrawer: open/close (button + `Cmd/Ctrl+\``), resizable (desktop), focus trap, `aria-labelledby`.
- MessageList: virtualized for perf; assistant vs user bubble variants; inline action summaries.
- MessageItem: states (default, running tool, success, error); timestamp; retry on error.
- MessageInput: multiline with Shift+Enter; includes mic button; disabled while tool running (optional).
- VoiceToggle: keyboard accessible, role="switch", states: active/muted, live region status.
- Toolbar (Left): primary actions; ensure no overlap with macOS dock; tooltips with shortcuts.
- UndoLastAIAction: replays last command via stored tool history; confirm dialog on destructive ops.

Interaction & Motion
- Drawer open/close: 180–220ms, `ease-out` slide; focus moves to input on open.
- Button hover: 150ms color/opacity; active: scale 0.98; focus: 2px outline with brand color.

### Color & Typography System
- Brand Palette:
  - Dark Blue `#072d51`
  - Gold `#cfa968`
  - White `#ffffff`
  - Light Blue `#cdd2c5`
- Usage:
  - App background: near-white; Toolbar background: Dark Blue; Icons: White/Gold accents.
  - Assistant bubble: Light Blue background, Dark Blue text; User bubble: White background, Dark Blue text; Links/actions: Gold.
- Tailwind tokens (proposed):
  - `--brand-dk: #072d51; --brand-gold: #cfa968; --brand-lt: #cdd2c5; --brand-white: #ffffff`.
  - Map to `bg-brand-dk`, `text-brand-dk`, `accent-brand-gold` via CSS variables.
- Typography:
  - Base: system-ui/SF; Sizes: 14/16/18/20/24 per 1.25 scale; Weights: 400/600.

### Responsive & Accessibility Guidelines
- Breakpoints: md 768px, lg 1024px, xl 1280px; drawer full overlay <lg.
- Keyboard: all controls tabbable; shortcuts documented; Esc closes drawer.
- Contrast: meet WCAG AA (≥4.5:1 for text); verify with axe.
- Announcements: ARIA live regions for agent responses and voice status.

### Design Assets Summary
- Components to handoff: ChatDrawer, MessageList/Item variants, MessageInput with Mic, VoiceToggle, UndoLastAIAction button, Toolbar (left) variants, Theme tokens.
- Icons: Lucide for mic, send, undo; shadcn/ui primitives where applicable.

### Next Steps / Open Questions
- Confirm LangChain vs LangGraph final choice (DX and Next.js compatibility).
- Confirm voice feature support policy for Safari/Firefox and present inline messaging on unsupported browsers.
- Confirm undo behavior scope (single last command vs stack).

---

End of Consolidated Plan (Start · Plan · Design)


