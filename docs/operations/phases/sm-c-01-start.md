## Supermodule C — Start

Phase window: Modules 11–12

Objective: Prepare the project for public-ready MVP by completing visual, multiplayer, and delivery polish.

Scope
- Toolbar UI for creating Rect / Text (mouse-first, complements shortcuts)
- Visible presence UI (avatars/list of online users)
- Multiplayer cursor labels with stable color + displayName
- Layout polish (header spacing, alignment, responsive)
- Environment-specific config for production Firebase
- Deployment configuration (Vercel preferred; Firebase rules verification)
- Cross-module QA and regression testing

Deliverables
- components/ui/Toolbar.tsx integrated into canvas header
- Presence avatars in canvas header (participants)
- Cursor labels rendered with color background and white text
- Production-ready env setup (.env.production guidance) and Firebase config verified
- Deployment docs and one-click deploy path
- QA checklist for Supermodule C and regression sweep (Modules 1–10)

Success Criteria
- Toolbar buttons create/persist shapes without errors
- Presence UI shows all connected users and updates < 1s
- Cursor labels show correct displayName + stable color
- Deployment succeeds with correct env; smoke test passes with no console errors
- Regression across Modules 1–10 passes

Risks & Mitigations
- UI clutter: keep toolbar compact; place presence in header; avoid overlapping canvas controls
- Presence accuracy: validate with two sessions; RTDB onDisconnect + heartbeat; TTL sanity
- Deployment parity: use .env.production; verify Firebase Rules pre-deploy; smoke test after deploy

Testing Focus
- Two-user session for presence + cursor labels
- Toolbar-originated shapes persist and sync across sessions
- Build + deploy smoke test (Sentry/FPS disabled by default in prod)

Initial Status
- Baseline features complete from Supermodule B (see phase-0B-05-reflect.md)
- Toolbar, presence avatars, and cursor label polish to implement
- Deployment and QA docs pending

Owners / Reviewers
- Owner: Engineering
- Reviewers: Product, QA

Links
- Previous handoff: /docs/operations/phases/phase-0B-05-reflect.md
- This plan: /docs/operations/phases/sm-c-02-plan.md


