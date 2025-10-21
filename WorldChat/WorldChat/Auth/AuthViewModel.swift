import Foundation
import Combine

@MainActor
final class AuthViewModel: ObservableObject {
	@Published var email: String = ""
	@Published var password: String = ""
	@Published var isLoading: Bool = false
	@Published var errorMessage: String? = nil

	private let authService: AuthService
	private let profileService: ProfileService

	init(authService: AuthService = AuthService(), profileService: ProfileService = ProfileService()) {
		self.authService = authService
		self.profileService = profileService
	}

	func signIn() async {
		isLoading = true
		errorMessage = nil
		do {
			_ = try await authService.signIn(email: email, password: password)
		} catch {
			errorMessage = AuthErrorMapper.message(for: error)
		}
		isLoading = false
	}

	func signUp(displayName: String, languages: [String]) async {
		isLoading = true
		errorMessage = nil
		do {
			let uid = try await authService.signUp(email: email, password: password)
			try await profileService.bootstrapUser(uid: uid, displayName: displayName, languages: languages)
		} catch {
			errorMessage = AuthErrorMapper.message(for: error)
		}
		isLoading = false
	}

	func signOut() {
		do { try authService.signOut() } catch {
			errorMessage = "Failed to sign out."
		}
	}
}


