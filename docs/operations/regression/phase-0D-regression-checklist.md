# Phase 0D — Regression Checklist (Supermodule D)

## Core Flows
- [ ] Auth: Login via Magic Link and Email/Password
- [ ] Routing: `/` → `/login` unauthenticated; `/` → `/c/default` authenticated
- [ ] Canvas load: `/c/[canvasId]` renders header, toolbar, stage
- [ ] Presence: participants appear/disappear within < 1s; idle dimming works
- [ ] Cursors: labeled cursors update smoothly; disconnect removes cursor
- [ ] Shapes: create/move/resize/rotate rectangle and text; sync across two sessions
- [ ] Persistence: refresh restores canvas state
- [ ] Export: JSON export works
- [ ] Logout: visible on Home and Canvas; redirects to `/login`

## UI Fidelity
- [ ] Header heights 52px tablet / 56px desktop; `bg-white/90` + blur
- [ ] PresenceBar right-aligned; initials-only; tooltips show names
- [ ] Login card: border + subtle shadow; inputs labeled; errors readable
- [ ] Toolbar variants: +Rect primary, +Text secondary
- [ ] Cursor chip opacity 90%; readable labels

## Accessibility
- [ ] Focus rings visible on buttons/inputs
- [ ] Contrast meets AA on text and controls
- [ ] Keyboard: tab order logical; Enter submits; Esc closes modals

## Performance & Stability
- [ ] Canvas interactions 60 FPS (dev)
- [ ] Cursor perceived latency < 50–200 ms
- [ ] No console errors during core flows

## E2E & Visual Snapshots
- [ ] Presence/cursors e2e passes (auth-aware)
- [ ] Visual snapshots for Home/Login and Canvas header verified


