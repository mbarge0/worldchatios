## Debug — Supermodule D.2 (sm-d2-04)

Checklist:
- Verify cursor fade on offline (close second tab) and idle (no movement).
- Confirm header avatars centered at all breakpoints.
- Ensure toolbar remains accessible via keyboard and has focus styles.
- Check rectangle shadows/contrast against background.

Visual Review:

Surgical Fix Log:
- Guarded `localeCompare` sort against undefined display names in `app/c/[canvasId]/page.tsx` to prevent runtime crash.
- Suppressed transient RTDB permission-denied errors in `lib/hooks/usePresence.ts` (during logout or auth state changes). Non-transient errors still logged.
- Capture screenshot of `/c/default` and attach to review log.

