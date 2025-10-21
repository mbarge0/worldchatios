import SwiftUI

struct AppShell: View {
	@StateObject private var sessionStore = SessionStore()
    @Environment(\.scenePhase) private var scenePhase
    private let presenceService = PresenceService()

	var body: some View {
		NavigationStack {
			Group {
				if sessionStore.isAuthenticated {
					ConversationsEntryView()
				} else {
					LoginView()
				}
			}
		}
		.environmentObject(sessionStore)
        .onAppear {
            if let uid = sessionStore.currentUserId {
                presenceService.setOnline(for: uid)
            }
        }
        .onChange(of: scenePhase) { _, phase in
            guard let uid = sessionStore.currentUserId else { return }
            switch phase {
            case .active:
                presenceService.setOnline(for: uid)
            case .background:
                presenceService.setBackground(for: uid)
            default:
                break
            }
        }
	}
}

#Preview {
	AppShell()
}


