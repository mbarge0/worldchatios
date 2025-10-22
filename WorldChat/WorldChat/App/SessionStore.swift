import Foundation
import Combine
import FirebaseAuth
import FirebaseFirestore

final class SessionStore: ObservableObject {
	@Published var currentUserId: String? = nil
	@Published var isAuthenticated: Bool = false
    @Published var profile: UserProfile? = nil

	private var authStateHandle: AuthStateDidChangeListenerHandle?
    private let profileService = ProfileService()
    private let cache = LocalCacheService()
    private var isFirebaseReady = false
    private var cancellable: Any?

	init() {
		// Wait for Firebase boot before touching Auth
		cancellable = NotificationCenter.default.addObserver(forName: FirebaseBoot.didConfigure, object: nil, queue: .main) { [weak self] _ in
			guard let self else { return }
			self.isFirebaseReady = true
			self.observeAuthState()
		}
	}

	deinit {
		if let handle = authStateHandle {
			Auth.auth().removeStateDidChangeListener(handle)
		}
	}

	private func observeAuthState() {
		guard isFirebaseReady else { return }
		authStateHandle = Auth.auth().addStateDidChangeListener { [weak self] _, user in
			self?.currentUserId = user?.uid
			self?.isAuthenticated = user != nil
            Task { await self?.handleAuthChange(userId: user?.uid) }
		}
	}

    private func handleAuthChange(userId: String?) async {
        guard let uid = userId else {
            await MainActor.run { self.profile = nil }
            return
        }
        // Hydrate from cache first
        if let cached = cache.load(uid: uid) {
            let hydrated = UserProfile(uid: uid, displayName: cached.displayName, languages: cached.languages, avatarUrl: cached.avatarUrl, createdAt: cached.updatedAt)
            await MainActor.run { self.profile = hydrated }
        }
        // Refresh from Firestore
        do {
            if let remote = try await profileService.fetchProfile(uid: uid) {
                try? cache.upsert(from: remote)
                await MainActor.run { self.profile = remote }
            }
        } catch {
            // TODO: surface non-blocking error if needed
        }
    }
}


