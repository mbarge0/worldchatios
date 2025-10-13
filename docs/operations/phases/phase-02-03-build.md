# Phase 02 — Build Log (Authentication)

## Phase Context
- Date: Oct 13, 2025
- Begin Build session
- Goal: Implement Firebase Auth (Email/Password + Magic Link), login page, route guard for `/c/[canvasId]`, display name fallback.

## Build Objectives
- Implement `useFirebaseAuth` hook using Firebase Auth SDK
- Create `/app/login/page.tsx` for Magic Link and Email/Password flows
- Add `AuthGuard` client component and protect `/c/[canvasId]`
- Add `deriveDisplayName` utility

## Implementation Log
1. Created `lib/hooks/useFirebaseAuth.ts` with:
   - Auth state subscription via `onAuthStateChanged`
   - Email/Password: sign-in and sign-up
   - Magic Link: `sendSignInLinkToEmail` and completion via `signInWithEmailLink`
   - Uses `env.NEXT_PUBLIC_APP_URL` for action URL; stores email locally to complete
2. Added `/app/login/page.tsx`:
   - Toggle between Magic Link and Email/Password modes
   - Calls hook actions; displays messages/errors; auto-completes magic link on mount
3. Added `components/layout/AuthGuard.tsx`:
   - Redirects unauthenticated users to `/login`; shows `Spinner` while loading
4. Scaffolded protected route `/app/c/[canvasId]/page.tsx` using `AuthGuard`
5. Added `lib/hooks/displayName.ts` with `deriveDisplayName(email)`

## Testing Validation
- Lint: No errors for new/changed files
- Manual: Verified no type or lint failures; runtime validation to follow with E2E

## Bugs & Fixes
- None observed during static checks

## Checkpoint Summary
- Build stability: Good; compiles/lints expected to pass
- Ready for: Unit tests for auth hook and fallback; Playwright auth E2E; regression smoke

## Next Steps
- T7: Add unit tests (fix existing `act()` warning in Supabase tests or migrate to Firebase-based tests for the new hook)
- T8: Add Playwright tests for login + gated route
- T10: Run regression checks: build, smoke E2E, Sentry init path
