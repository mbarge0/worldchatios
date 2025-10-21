import Foundation
import FirebaseAuth

final class AuthService {
	func signIn(email: String, password: String) async throws -> String {
		let result = try await FirebaseService.auth.signIn(withEmail: email, password: password)
		return result.user.uid
	}

	func signUp(email: String, password: String) async throws -> String {
		let result = try await FirebaseService.auth.createUser(withEmail: email, password: password)
		return result.user.uid
	}

	func signOut() throws {
		try FirebaseService.auth.signOut()
	}
}

enum AuthErrorMapper {
	static func message(for error: Error) -> String {
		let ns = error as NSError
		switch AuthErrorCode(rawValue: ns.code) {
		case .wrongPassword: return "Invalid credentials. Please try again."
		case .userNotFound: return "No account found for this email."
		case .emailAlreadyInUse: return "Email already in use."
		case .networkError: return "Network error. Check your connection."
		default: return "Something went wrong. Please try again."
		}
	}
}


