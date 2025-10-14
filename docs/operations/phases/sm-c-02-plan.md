## Supermodule C — Plan (Modules 11–12)

Work Breakdown

Module 11 — Deployment & Environment Prep
- [ ] Finalize production env contract in config/env.ts and README
- [ ] Document .env.production keys (Firebase + optional Sentry) and validation
- [ ] Verify Firestore + RTDB rules against production project
- [ ] Deployment path (Vercel): build, env, project linking, preview/prod
- [ ] Post-deploy smoke checklist

Module 12 — Cross-Module QA & Final Polish
- [ ] Toolbar: mouse-first create for Rect/Text (persist + sync)
- [ ] Presence UI: avatars of online users with tooltip/name
- [ ] Cursor labels: stable color tag + displayName
- [ ] Layout polish: header density, spacing, responsiveness
- [ ] Regression suite (Modules 1–10): shape ops, sync, auth, rules
- [ ] QA checklist execution and sign-off

Acceptance Criteria
- Toolbar buttons create shapes centered or near viewport and persist
- Presence updates propagate < 1s across two sessions; disconnect clears
- Cursor labels readable on light canvas; color is stable per user
- Layout clean on mobile/desktop; no overlap with Stage interactions
- Build passes on Vercel; production env validated by config/env.ts
- No console errors in smoke test; Sentry DSN optional and non-blocking

Technical Notes
- Presence: RTDB onDisconnect + periodic heartbeat; throttle cursor updates (~20Hz)
- Cursor labels: Konva Label/Tag for background; white text for contrast
- Env: config/env.ts uses @t3-oss/env-nextjs to validate client keys
- Deployment: prefer Vercel; ensure NEXT_PUBLIC_* vars exist in project env

Test Plan
- Two-browser real-time test for presence + cursor tracking
- Create via toolbar in one session; verify in second immediately
- Delete a shape; ensure rules allow authorized users only
- Build locally; deploy preview on Vercel; run smoke test URL

Out-of-Scope
- Feature additions beyond MVP (pen tools, images, comments)
- Comprehensive access control model beyond current rules

Milestones (suggested)
- Day 1–2: Toolbar + presence + cursor labels
- Day 3: Layout polish; env hardening
- Day 4: Deploy to Vercel; rules verification
- Day 5: QA checklist + regression; fix pass

References
- Start doc: /docs/operations/phases/sm-c-01-start.md
- Deployment guide: to be added in sm-c-deploy.md (or README update)


