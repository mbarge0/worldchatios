## Build — Supermodule D: Multiplayer Cursors, Presence Awareness & UI Refresh

### Phase Context
- Session: Begin Build
- Date: Oct 15, 2025
- Goal: Implement PresenceBar and CursorLayer per design; integrate into Canvas header and stage; adhere to tokens and accessibility.

### Build Objectives
- PresenceBar: header-right, initials-only avatars, idle dimming.
- CursorLayer: labeled cursors with 90% chip opacity, per-user colors, linear interpolation.
- Canvas integration: header height 56/52, responsive ≥ 768 px, tooltips for presence.

### Implementation Log
1) Scaffold build doc and tasks.
2) Add `components/canvas/CursorLayer.tsx` for remote cursor rendering.
3) Add `components/layout/PresenceBar.tsx` and integrate in `app/c/[canvasId]/page.tsx`.
4) Update `CanvasStage.tsx` to remove inline cursor rendering and use `CursorLayer`.
5) Validate presence data from `usePresence` hook.
6) Surgical fix: Add `AuthHeader` with `Logout` (uses `useFirebaseAuth.signOut()` and redirects to `/login`). Integrated into Home (`app/page.tsx`) and Canvas (`app/c/[canvasId]/page.tsx`). Added unit test `tests/unit/layout/authheader.render.test.tsx`.

### Testing Validation
- Manual: two local sessions verify avatars update <1s; cursors labeled and track smoothly.
- Unit: add minimal render tests for PresenceBar (initials) and CursorLayer (label prop rendering).
- Unit (surgical fix): AuthHeader renders email and Logout button.

### Bugs & Fixes
- None yet.

### Checkpoint Summary
- Branch: uiuxpolish
- Status: Building PresenceBar + CursorLayer

### Next Steps
- Implement and wire components; run unit tests; proceed to integration verification.


