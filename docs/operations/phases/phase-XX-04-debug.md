# Phase-XX — Debugging Loop (Surgical Fix)

## Phase Context
- Phase: XX — Supermodule B (AI Agent, LangChain Orchestration, Voice & Brand UX)
- Session Type: Surgical Fix
- Context: Runtime error during AI tool execution for "Create a rectangle" resulting in `Cannot read properties of undefined (reading 'id')` from `/lib/ai/actions.ts` when `shape` is undefined.

## Issue Description
- Symptom: API `/api/openai` function-calling path invokes `createShape`/`createText` with missing `shape`.
- Error: `Cannot read properties of undefined (reading 'id')` (downstream when Firestore adapter attempts to access `shape.id`).
- Repro: Send prompt like "Create a rectangle"; OpenAI tool call omits `shape` object.

## Initial Diagnosis
- Root cause: `createShape` and `createText` in `lib/ai/actions.ts` assume a valid `shape` object and do not validate inputs or generate IDs.
- Related modules: `app/api/openai/route.ts` (tool calls), `lib/data/firestore-adapter.ts` (expects valid payloads).

## Debugging Plan
1. Harden `createShape` and `createText` to validate `canvasId` and `shape`.
2. If `shape` missing/invalid, create a safe default object and auto-generate `id` using `uuid`.
3. Keep change scope minimal; do not modify adapters or other tools.
4. Verify by sending prompts without structured tool args.

## Execution Log
- Edited `lib/ai/actions.ts`:
  - Added input validation and default fallbacks for both `createShape` and `createText`.
  - Auto-generate `id` via `uuidv4()` when missing.
  - Added conservative defaults (circle 100x100; text box with baseline styles).
- No changes to Firestore adapter or API route.

## Fix Implementation
- Type: Surgical Fix
- Files modified:
  - `lib/ai/actions.ts` (validate inputs, safe defaults, `uuidv4()`)
- Risk: Low; only broadens allowed inputs and prevents undefined access.

## Validation & Testing
- Unit/Manual: Trigger `/api/openai` with "Create a rectangle" → no crash; default shape created when `shape` missing.
- Regression spot checks:
  - Existing toolbar/UI create actions still work (they pass proper `shape`).
  - `moveShape`, `resizeShape`, `rotateShape` paths unaffected.
  - Chat drawer flows intact; session persistence unaffected.

## Regression Verification
- No side effects observed in: Auth (#2), Canvas (#4), Persistence (#5), Realtime (#6), Conflict (#7).
- Continue to track via `phase-XX-02-build.md` Debug section and `/docs/operations/regression/phase-XX-regression-checklist.md`.

## Outcome Summary
- Resolved: Yes. Invalid/missing `shape` no longer causes a runtime error; defaults applied.
- Next Steps: Consider enriching tool parameter schemas to bias models toward providing minimal valid shapes.


