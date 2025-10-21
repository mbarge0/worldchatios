
## Build

### Status
- ✅ UIKit entrypoint live (AppDelegate/SceneDelegate); SwiftUI entry removed.
- ✅ Firebase configured in AppDelegate; startup logs verified.
- ✅ Auth MVP: email/password login via existing `AuthService`.
- ✅ Post-login routing: `LoginViewController` → `ConversationsViewController`.
- ✅ Sign out returns to login.

### Key Changes
- Added `App/AppDelegate.swift` as `@main`; configures Firebase.
- Added `App/SceneDelegate.swift` routing by `Auth.auth().currentUser`.
- Added `Auth/LoginViewController.swift` (UIKit) with email, password, sign-in.
- Added `Conversations/ConversationsViewController.swift` placeholder with Sign Out.
- Removed SwiftUI `WorldChatApp.swift` from target (UIKit only going forward).

### Logs to Verify Flow
- App launch: "[AppDelegate] didFinishLaunchingWithOptions — configuring Firebase"
- Scene route: "[SceneDelegate] User is signed in" or "No user — showing LoginViewController"
- Login: "[LoginVC] signIn start/success" and "Transition → ConversationsViewController"
- Sign out: "[ConversationsVC] Signed out — returning to LoginViewController"

### Next
- Flesh out `ConversationsViewController` list and message flow.
- Add error toasts and input validation on login.
- Add basic theming and navigation polish.
