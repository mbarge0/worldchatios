# Foundry Core v2 — Project Context

---

## 1) Purpose & Scope
Foundry Core v2 is a reusable development framework for structured, AI-assisted, multi-phase projects with built-in verification, automation, and documentation systems. It provides a stable project skeleton, phase prompts, and operational tooling (debug, evolvr, visual verification, motion, and showcase) to accelerate new builds.

References: `/docs/foundation/prd.md`, `/docs/foundation/architecture.md`, `/docs/foundation/dev_checklist.md`, `/docs/operations/order_of_operations.md`.

---

## 2) Architecture Summary
- Framework: Next.js (App Router), React, TypeScript
- Styling: Tailwind (base) + preferred UI libraries (optional)
- State: Lightweight local state; downstream apps can choose state strategy
- Integrations: OpenAI (optional), Firebase/Supabase scaffolding (templates only)
- Observability: Sentry (optional)
- Tooling: Evolvr loop, Visual verification, Motion system, Showcase system

---

## 3) Current Snapshot
- Goal: Provide a clean, app-agnostic baseline that compiles
- Included: Phase prompts (super-phase model), automation scripts, verification tools
- Next adopter steps: Fill `.env.local`, wire real routes, extend verification selectors, implement app-specific docs

---

## 4) Active Systems and Prompts
- Systems: Debug (`pnpm debug`), Visual/Evolvr, Motion, Showcase, Evidence capture
- Prompts: Super-phase prompts in `/prompts/literal/02_superphases/` and system prompts in `/prompts/system/`
- Storage policy: New reports append to `/docs/operations/phases/recent/`; archive completed sets to `/archive/`

---

## 5) Risks & Considerations
- Ensure downstream apps generalize verification selectors and routes
- Keep motion subtle and accessible
- Maintain doc consistency with super-phase model and archive policy

---

## 6) Checkpoints and Links
- Order of Operations: `/docs/order_of_operations.md`
- Foundation: `/docs/foundation/*`
- Operations: `/docs/operations/*`
- Prompts (system): `/prompts/system/*`
- Prompts (literal): `/prompts/literal/*`
