# CollabCanvas — Project Context

---

## 1) Purpose & Scope
CollabCanvas is a Figma-like real-time collaborative design tool. The MVP delivers a multiplayer canvas (pan/zoom, rectangle and text, create/move/resize/rotate), labeled cursors, presence, autosave, and JSON export. The final phase adds an AI canvas agent (OpenAI function calling) that manipulates the canvas for all connected users.

References: `/docs/foundation/prd.md`, `/docs/foundation/architecture.md`, `/docs/foundation/dev_checklist.md`, `/docs/operations/regression/00_master_regression_manifest.md`.

---

## 2) Architecture Summary
- Framework: Next.js (App Router), React, TypeScript
- Rendering: Konva (react-konva)
- State: Zustand
- Backend: Firebase — Firestore (canvas/shapes), Realtime Database (presence/cursors)
- Auth: Firebase Auth (Email/Password + Magic Link)
- AI (Final): OpenAI (function calling via Next.js API)
- Hosting: Vercel; Observability: Sentry (client)

---

## 3) Current Sprint Snapshot (Week 1: Oct 13–19)
- Goal: Deliver MVP modules (#1–#12) and deploy on Vercel
- Completed: PRD, Architecture, Development Checklist, Master Regression Manifest
- Next: Module #1 Environment & Tooling → #2 Authentication → #3 Routing & Shell

---

## 4) Active Features, Tasks, and Prompts
- Active features in scope: pan/zoom, rectangle + text, create/move/resize/rotate, multi-select, presence + labeled cursors, autosave to Firestore, JSON export, auth gate
- Tasks underway: Module #1–#3 execution per `/docs/foundation/dev_checklist.md`
- Prompts in use: Product Loop, Architecture Loop, Checklist Loop, Regression Manifest Generator

---

## 5) Blockers & Known Issues
- None currently identified
- Risks: concurrency edge cases (LWW + locks), browser perf with 500+ nodes, AI latency limits

---

## 6) Checkpoints, Branches, and Links
- Branching: `foundation` active; feature branches per module; PRs into `main`
- Deployment: Vercel target (pending MVP deploy)
- Key links:
  - PRD: `/docs/foundation/prd.md`
  - Architecture: `/docs/foundation/architecture.md`
  - Dev Checklist: `/docs/foundation/dev_checklist.md`
  - Master Regression Manifest: `/docs/operations/regression/00_master_regression_manifest.md`
