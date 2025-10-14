## Supermodule C QA Checklist

Functional
- [ ] Toolbar: +Rect creates persisted rect at expected position
- [ ] Toolbar: +Text creates persisted text; editable with Enter
- [ ] Selection: move/resize/rotate still works; delete obeys rules
- [ ] Presence: avatars show in two sessions within <1s
- [ ] Cursors: colored labels with correct displayName on both sessions

Sync/Rules
- [ ] Shapes sync across sessions with low latency
- [ ] Unauthorized writes blocked by Firestore rules
- [ ] RTDB presence entries cleaned up on disconnect

Layout/UX
- [ ] Header spacing and alignment consistent on mobile/desktop
- [ ] Toolbar does not obstruct canvas interactions
- [ ] FPS/Sentry optional flags don’t show in prod by default

Deployment
- [ ] Build succeeds on Vercel with env set
- [ ] Preview smoke test passes; no console errors
- [ ] Production smoke test passes; Sentry optional

Regression (Modules 1–10)
- [ ] Basic creation/edit/move/resize/rotate/delete
- [ ] Text editing modal and persistence
- [ ] Presence TTL / heartbeat sanity

