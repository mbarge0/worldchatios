# Project Context — WorldChat (SwiftUI + Firebase)

## 1. Project Overview
WorldChat is an AI-powered iOS messaging app that enables real-time multilingual conversations for international travelers and expats. The product goal is WhatsApp‑grade reliability with automatic, inline translation and post‑MVP AI assistance that teaches through conversation. Target users: iPhone users (iOS 16+) communicating across languages who need accurate, fast, and culturally aware messaging.

## 2. Architecture Summary
- Client: SwiftUI (MVVM with Combine), Swift 5.9+, iOS 16+
- State: `@State`, `@EnvironmentObject`; SwiftData (offline cache, planned MVP)
- Backend: Firebase (Auth, Firestore, Realtime Database for typing, Storage, Cloud Functions, FCM)
- AI/Translation: Google Cloud Translation via Functions (MVP), OpenAI GPT‑4 via Functions (post‑MVP)
- Supermodules:
  - MVP: Platform, Identity & Data Services; Messaging & Collaboration (includes translation + notifications)
  - Post‑MVP: AI Assistant & Smart Replies; Speech & Learning Analytics
- Data entities: Users, Conversations, Messages (status lifecycle and per‑recipient translations), Translation Cache, Typing Indicators

## 3. Active Sprint / Phase
- Sprint: Week 1 Gauntlet AI (MVP → Final)
- Timeline: MVP tonight; Final submission Sunday 10:59 PM CT
- Deliverables (MVP):
  - Auth (email/password), profile bootstrap
  - 1:1 messaging with delivery states, read receipts, presence, typing
  - Inline translation (Cloud Function + cache)
  - Offline read + queue/replay (SwiftData), foreground notifications
- In progress: Core UI setup, messaging prototype, Cloud Functions scaffolding

## 4. Known Issues / Blockers
- APNs background notifications pending setup; MVP uses foreground notifications
- Offline cache write‑back ordering must be reconciled by server timestamps
- Translation failures must gracefully fall back to original text
- Typing indicators debounce/clear tuning to avoid false positives
- TestFlight review timing risk; contingency: local build + screen recording

## 5. Prompts and Workflows in Use
- System: Architecture Loop (`/prompts/system/00_b_architecture_loop.md`), Context Loop (`/prompts/system/00_d_context_generation.md`), Regression Manifest (`/prompts/system/utilities/10_regression_manifest.md`)
- Literal: Foundation planning, architecture planning, design guidelines, regression checklist (under `/prompts/literal/01_foundation/`)
- Core docs: `docs/foundation/architecture.md`, `tech_stack.md`, `user_flows.md`, `docs/operations/regression/00_master_regression_manifest.md`

## 6. Checkpoint Tag
- Last stable checkpoint: Phase 02 (Messaging & Collaboration MVP groundwork established)
- Commit/tag reference: set at creation time of regression manifest and architecture rewrite

# End of context.md — generated [timestamp]
