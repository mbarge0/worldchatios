## Design — Supermodule D.1 (sm-d1-02)

Design Notes:

1) Multiplayer Cursors
- Use `CursorLayer` to render remote cursors with linear interpolation.
- Add opacity fade based on `ts` age; remove if too old.
- Keep labels with user display name; color derived from presence color.

2) Presence in Header
- Extend `PresenceBar` avatars; pass `color` from presence participants.
- Tooltip via title attribute for simplicity.

3) Left Vertical Toolbar
- Position: absolute left-4 top-4, floating card with rounded corners.
- Buttons: Rectangle (Square icon), Text (Type icon), same handlers.
- Keep keyboard shortcuts in `CanvasStage`.

4) UI Refresh
- Header: app title on left, presence + auth controls on right.
- Background: `bg-slate-50`; canvas area `bg-white`.
- Login: centered card already conforms; minor polish later if needed.

Accessibility
- Maintain focus states (Tailwind ring) on buttons.
- Tooltips via title, sufficient color contrast.

