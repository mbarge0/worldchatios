## Start

### Phase Overview
- Phase: 02 — Supermodule A — Platform, Identity & Data Services (MVP)
- Date: 2025-10-21
- Previous Phase Summary: Fresh Xcode project created; Firebase installed via SwiftPM; Firestore write validated successfully; repo scaffolding and basic conventions established. Ready to begin the first development supermodule.

### Objectives & Deliverables
- Objectives:
  - Establish the app shell with `NavigationStack` and session management.
  - Configure Firebase (Auth, Firestore, Storage, Functions/FCM) and confirm runtime init.
  - Implement identity flows: email/password login, signup, logout.
  - Bootstrap `users/{uid}` profile with display name, avatar URL, and language preferences.
  - Add local caching foundation with SwiftData for user profile.
- Deliverables:
  - Running iOS app that conditionally routes to Login or Conversations based on auth state.
  - Working Auth (signup/login/logout), profile bootstrap, and avatar upload.
  - Verified Firebase initialization logs without runtime errors.
  - Local cache of profile persisted and restored on reload.

### Scope
- Included (maps to Development Checklist):
  - A.1 Environment setup doc
  - A.2 Firebase services & iOS capabilities matrix
  - A.3 App shell + `SessionStore`
  - A.4 Firebase integration via SwiftPM + `GoogleService-Info.plist`
  - A.5 Email/password auth flows
  - A.6 `users/{uid}` bootstrap on signup
  - A.7 Avatar upload to Storage and profile URL persistence
  - A.8 Local cache foundation (SwiftData)
  - A.9 Auth error handling UX
  - A.10 Presence lifecycle groundwork
  - A.11 Validation & regression mapping for Phase A
- Excluded/Deferred:
  - Messaging UI and listeners (covered in Supermodule B)
  - Inline translation/Functions beyond basic config
  - Notifications routing or advanced media beyond avatar

### Risks & Assumptions
- Assumptions:
  - Firebase project credentials are valid and iOS bundle IDs match.
  - Apple developer provisioning profiles/capabilities are available.
  - Network connectivity and permissions available for Storage uploads.
- Key Risks & Mitigations:
  - Firebase init runtime errors → add early init logs and guard checks; fail fast in debug.
  - Auth error UX regressions → centralize error mapping; use consistent inline messaging.
  - Local cache schema churn → define initial SwiftData model with room for extensions.

### Testing Focus (Phase A)
- Unit: `AuthViewModel`, profile model transformations, presence state transitions.
- Integration: Firebase init, Firestore CRUD for `users/{uid}`, Storage uploads.
- E2E: Cold/warm launch; auth state restore; login/signup/logout flows.
Example paths:
- Unit: `WorldChatTests/AuthViewModelTests.swift`
- Integration: `WorldChatTests/FirestoreIntegrationTests.swift`
- E2E/Device: `WorldChatUITests/AuthFlowsUITests.swift`

### Implementation Plan (High-level)
1) Confirm environment and Firebase services matrix (A.1–A.2).
2) App shell + `SessionStore` and conditional routing (A.3).
3) Firebase integration and runtime init verification (A.4).
4) Email/password auth flows (A.5) with inline error handling (A.9).
5) Profile bootstrap on signup (A.6) and avatar upload + URL persistence (A.7).
6) SwiftData local cache for profile (A.8).
7) Presence groundwork aligned to lifecycle (A.10).
8) Phase validation and regression checks (A.11).

### Expected Outcome / Definition of Done
- App launches cleanly; Firebase initializes reliably; auth flows and profile bootstrap function end-to-end; avatar upload persists and displays; local cache restores profile; presence groundwork verified via lifecycle events.

### Checkpoint Preparation
- Dependencies verified (Firebase project, Apple capabilities).
- Build target runs on simulator; logs confirm Firebase init.
- Suggested commit: "phase-02[A]: start — app shell, firebase init, auth plan staged"

---

## Plan

### Phase Context
- Phase 02 — Supermodule A — Platform, Identity & Data Services (MVP)
- Reason for planning: Consolidate Start→Plan→Design into a single execution plan for the first development supermodule.

### Current Status
- Setup complete: Xcode project initialized; Firebase linked; Firestore write succeeded.
- No user-facing auth/profile features yet — to be implemented in this phase.

### Issues & Blockers
- None blocking at present. Watch for provisioning/entitlements mismatches and Storage rules alignment with avatar uploads.

### Scope Adjustments
- None at kickoff. Presence to be implemented at a basic lifecycle level (A.10), detailed usage in Phase B.

### Risk Assessment
- Medium: Auth and profile flows impact app routing; ensure guarded transitions and state observation.
- Low: Firebase initialization since a write already validated; still add robust logging.

### Regression Plan (referencing Master Regression Manifest)
- A.R1 App launch and Firebase init must remain stable.
- A.R2 Auth flows (login/signup/logout) — validate success/inline errors + logout routing.
- A.R3 Profile bootstrap + avatar upload — Firestore CRUD and Storage upload remain reliable.
- A.R4 Presence lifecycle — foreground/background updates consistent.
Add these checks to this phase’s debug/validation steps and future regression suites.

### Overview (Detailed Planning Mode)
- Goal: Deliver core platform, identity, and data services enabling Phase B messaging.
- Time estimate: ~5–6 developer-days, single contributor, with 1-day buffer.

### Task Summary
- Total tasks: 11 (A.1–A.11)
- Priorities: Critical path is A.3 → A.4 → A.5 → A.6 → A.7 → A.8 → A.11
- Effort (d = ideal dev‑days):
  - A.1 0.5d, A.2 0.5d, A.3 1.0d, A.4 0.5d, A.5 1.0d, A.6 0.5d, A.7 0.5d, A.8 1.0d, A.9 0.25d, A.10 0.25d, A.11 0.5d

### Dependency Graph (ASCII)
```
A.1 ─┐
     ├─> A.3 ────────┐
A.2 ─┘                ├─> A.5 ─> A.6 ─> A.7 ─┐
          A.4 ───────┘                       ├─> A.11
A.3 ────────────────> A.8 ───────────────────┘
A.9 (after A.5)  A.10 (after A.3, supports B)
```

### Task Breakdown (maps to Dev Checklist)
- A.1 Define environment setup doc
  - Dependencies: none | Effort: 0.5d | Acceptance: README_iOS includes steps; clean build succeeds | Testing: manual build/run
- A.2 Confirm Firebase services and iOS capabilities matrix
  - Dependencies: Firebase project created | Effort: 0.5d | Acceptance: Auth/Firestore/Storage/FCM/Functions enabled | Testing: console verification
- A.3 Initialize SwiftUI app with `NavigationStack` and `SessionStore`
  - Dependencies: A.1 | Effort: 1.0d | Acceptance: Launch to Login or Conversations based on auth | Testing: UI smoke
- A.4 Integrate Firebase via SwiftPM; add `GoogleService-Info.plist`
  - Dependencies: A.2 | Effort: 0.5d | Acceptance: Firebase config prints success; no runtime errors | Testing: launch logs
- A.5 Implement email/password signup/login/logout
  - Dependencies: A.4 | Effort: 1.0d | Acceptance: Login/signup work; logout returns to Login | Testing: unit (AuthViewModel), E2E relaunch restore
- A.6 Create `users/{uid}` bootstrap on signup (displayName, languages)
  - Dependencies: A.5 | Effort: 0.5d | Acceptance: Firestore doc written; read on login | Testing: integration (Firestore CRUD)
- A.7 Avatar upload to Storage; persist URL in profile
  - Dependencies: A.6 | Effort: 0.5d | Acceptance: image upload + URL saved; UI refreshes | Testing: integration (Storage), UI
- A.8 Local cache foundation with SwiftData models (UserEntity)
  - Dependencies: A.3 | Effort: 1.0d | Acceptance: profile persisted locally; reload shows cached data | Testing: unit/integration
- A.9 Handle auth errors with inline messaging
  - Dependencies: A.5 | Effort: 0.25d | Acceptance: error surfaces within 1s; no crash | Testing: manual + unit
- A.10 Verify presence updates (status online/offline, lastSeen)
  - Dependencies: A.3 (and later used by B.7) | Effort: 0.25d | Acceptance: presence doc updates on foreground/background | Testing: simulator toggles
- A.11 Regression map: Phase A entries satisfied
  - Dependencies: A.3–A.8 | Effort: 0.5d | Acceptance: end‑to‑end checks green | Testing: per A‑tasks

### Success Metrics
- Firebase init success across cold and warm launches; zero runtime init errors.
- Auth flows complete with p95 inline error display under 1s; logout returns reliably to Login.
- Profile doc created on signup; avatar upload <3s with URL saved and visible.
- Local cache restores profile on relaunch; no duplicate profile writes.

### Checkpoint Schedule
- CP1: App shell + Firebase init (A.3–A.4)
- CP2: Auth flows + error UX (A.5 + A.9)
- CP3: Profile bootstrap + avatar upload (A.6–A.7)
- CP4: Local cache + presence groundwork (A.8 + A.10)
- CP5: Validation pass (A.11)

### Next Steps
1. Execute A.1–A.2 confirmations; codify in README_iOS.
2. Build A.3–A.4 and land CP1.
3. Implement A.5 + A.9; land CP2.
4. Implement A.6–A.7; land CP3.
5. Implement A.8 + A.10; land CP4.
6. Run A.11 validation; land CP5.

---

## Design

### Phase Context
- Phase 02 — Design scope: App shell, Auth views (Login/Signup), Profile bootstrap, Avatar upload, basic Presence UI surfaces.
- References: Dev Checklist §2 (Supermodule A). This design sets the baseline visual system for MVP.

### Visual Objectives
- Clear, modern, and accessible; minimal friction through auth and profile setup.
- Establish a consistent design system (color/typography/spacing) reusable in Supermodule B.

### Layout Description (Textual Wireframes)

1) App Shell (Unauthenticated → Authenticated)
```
[NavigationStack]
 └─ LoginView (if not authenticated)
     - Logo/Title
     - Email [_________]
     - Password [______]
     - [ Sign In ]   [ Create Account ]
     - Inline error area
 └─ ConversationsEntryView (placeholder for B when authenticated)
     - Greeting / Profile avatar (tap → Profile)
```

2) Signup/Profile Bootstrap
```
[SignupView]
 - Display Name [____________]
 - Languages (picker, multi-select)
 - [ Continue ]

[ProfileSetupView]
 - Avatar (circle placeholder → tap to pick image)
 - [ Save ]
 - Inline status / errors
```

3) Settings/Profile (lightweight for A)
```
[ProfileView]
 - Avatar (circle, 72px)
 - Name, Languages
 - [ Change Avatar ]
 - [ Sign Out ]
```

### Component Specifications
- Buttons: Primary (filled), Secondary (outline). States: default, disabled (40% opacity), loading (spinner right-aligned).
- TextFields: Clear button while editing; error state with red caption. Password field with secure toggle.
- AvatarPicker: Circular mask, 1px border; image source from photo library. Progress overlay during upload.
- InlineError: Region under form controls; appears within 1s on error; auto-reads for VoiceOver.
- PresenceBadge (groundwork): Small green/gray dot next to avatar; updates on lifecycle events.

### Color & Typography System (tokens)
- Colors
  - `color.background`: #0B0B0F (dark) / #FFFFFF (light)
  - `color.surface`: #14141A (dark) / #F6F7FB (light)
  - `color.primary`: #4F46E5
  - `color.accent`: #22D3EE
  - `color.error`: #EF4444
  - `color.text.primary`: #FFFFFF (dark) / #0B0B0F (light)
  - `color.text.secondary`: #A1A1AA
- Typography
  - Title: SF Pro Display, 28/34, semibold
  - Heading: 20/26, semibold
  - Body: 17/22, regular
  - Caption: 13/18, regular
- Spacing
  - Base grid: 8px; form vertical rhythm: 12–16px
  - Corner radius: 12 for cards, 8 for inputs, 24 for buttons

### Responsive & Accessibility Guidelines
- Dynamic Type: Respect content size categories; no clipped labels at XL.
- Contrast: Aim for WCAG AA; primary buttons contrast ratio ≥ 4.5:1.
- Focus: Visible focus rings; VoiceOver labels and traits on inputs/buttons.
- Motion: Subtle transitions 120–200ms (`ease-in-out`); reduce motion when system setting is enabled.

### Design Assets Summary
- Components for build: `PrimaryButton`, `SecondaryButton`, `TextField`, `PasswordField`, `InlineError`, `AvatarPicker`, `PresenceBadge`.
- Icons: SF Symbols for default; room for Lucide equivalents in docs.

### Next Steps / Open Questions
- Confirm language picker locales for MVP (which languages to include?).
- Confirm presence persistence format (simple Firestore doc vs. RTDB hybrid later in B).
- Confirm avatar max size and compression settings for Storage.



