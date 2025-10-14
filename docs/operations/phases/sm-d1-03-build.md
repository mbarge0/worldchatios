## Build — Supermodule D.1 (sm-d1-03)

Changes Implemented:

- `CursorLayer.tsx`: interpolate and fade-out cursors based on last `ts`.
- `PresenceBar.tsx` + `Avatar.tsx`: support colorized avatars via `bgColor`.
- `app/c/[canvasId]/page.tsx`: left vertical toolbar with icons; header presence; layout refresh.

Validation:
- Two sessions show cursors and presence updates.
- Toolbar buttons create shapes and sync via Firestore.
- Header displays avatars with names on hover.

