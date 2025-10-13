# Phase 02 — Authentication (MVP)

## 1. Phase Overview

- **Phase number/name/date**: Phase 02 — Authentication; Oct 13, 2025
- **Previous phase summary**: Module #1 delivered a stable foundation: Firebase clients initialized (`lib/firebase/client.ts`), Sentry wired (`lib/observability/sentry.ts` via `app/layout.tsx`), test harness ready (Vitest/RTL + Playwright), env schema defined (`config/env.ts`). Stability is high; smoke E2E passes. See handoff for details.
- **Objectives & deliverables (this phase)**:
  - Firebase Auth: Email/Password + Magic Link (passwordless)
  - Auth gate for `/c/[canvasId]` (redirect unauthenticated users to login)
  - Display name fallback: derive from email prefix for cursors/labels
  - Tests: unit for auth hooks; E2E login flow (two contexts)

## 2. Scope

### Included
- Implement authentication flows using Firebase Auth SDK (Email/Password, Magic Link)
- Minimal auth UI: login/register + passwordless link request; sign-out
- Session state via existing `lib/firebase/client.ts` + `lib/hooks/useAuth.ts`
- Route guard ensuring only authenticated users can access `/c/[canvasId]`
- Display name fallback utility consumed by presence/cursor label logic
- Unit tests (hooks/utilities) and E2E for login + gated route

### Explicitly excluded / deferred
- Social logins (Google/Apple/etc.)
- Roles/permissions, invites, per-canvas ACLs
- Profile editing UI beyond display name fallback
- Advanced error and email template customization

## 3. Risks and Assumptions

### Assumptions
- Firebase project and SDK initialization are complete from Module #1
- Environment variables for Firebase are present locally and in Vercel
- App Router architecture remains as documented; login route available or to be added

### Risks & mitigations
- Magic Link requires correct action URL configuration in Firebase Console → validate domain and link handling before E2E
- Next.js routing guard complexity (server vs client) → start with a simple client-side guard; consider middleware if needed
- Existing `useAuth.test.ts` has a React `act()` warning → address by properly awaiting auth state updates in tests

## 4. Testing Focus

- **Unit/Integration**
  - `lib/hooks/useAuth.ts`: sign-in/out, magic-link initiation, auth state subscription
  - Display name fallback utility: email prefix → human-readable label
- **E2E (Playwright)**
  - Two-browser contexts: unauthenticated redirected to `/login`
  - Login success path (Email/Password); Magic Link happy path (mock/preview if needed)
  - Authenticated users can access `/c/[canvasId]`

Example test file paths:
- `tests/unit/auth/useAuth.test.ts` (expand existing)
- `tests/e2e/auth/login.spec.ts`

## 5. Implementation Plan

1) Verify Firebase Auth settings
- Confirm Email/Password and Email link (passwordless) are enabled in Firebase Console
- Ensure app domain/action URL is configured for Magic Link

2) Auth UI & flows
- Add `/app/login/page.tsx` with Email/Password and Magic Link options
- Add sign-out control in global shell or a minimal account menu

3) Hook and state wiring
- Implement or refine `lib/hooks/useAuth.ts` to expose: `user`, `loading`, `signInWithEmailPassword`, `sendMagicLink`, `signOut`
- Resolve existing test `act()` warning by awaiting state transitions

4) Route guard for `/c/[canvasId]`
- Introduce a lightweight guard component (client) to redirect to `/login` if not authenticated
- Optionally add middleware if server-side protection is later required

5) Display name fallback
- Implement a small utility (e.g., `lib/utils.ts`) to derive display name from email prefix
- Ensure presence/cursor labeler consumes this fallback when profile display name is absent

6) Tests
- Expand unit tests for auth hook + fallback utility
- Add Playwright E2E covering unauthenticated redirect and successful login → canvas access

## 6. Expected Outcome (Definition of Done)

- Users can authenticate via Email/Password and request Magic Link
- Unauthenticated users are redirected away from `/c/[canvasId]` to `/login`
- Cursor labels fall back to a sensible display name derived from email
- Unit tests pass locally and in CI; E2E login flow green

## 7. Checkpoint Preparation

Before moving to the next phase:
- Validate Firebase Auth (both methods) against local and preview deployment
- Confirm E2E: unauthenticated redirect, login success, canvas accessible when authenticated
- Ensure no regressions in existing smoke tests; Sentry shows no new errors

Suggested commit message:
"feat(auth): implement Firebase Email/Password + Magic Link, route guard, and tests"


