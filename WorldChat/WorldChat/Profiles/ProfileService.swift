import Foundation
import FirebaseFirestore
import FirebaseStorage

struct UserProfile: Codable {
	let uid: String
	let displayName: String
	let languages: [String]
	let avatarUrl: String?
	let createdAt: Date
}

final class ProfileService {
	private let firestore: Firestore
	private let storage: Storage

	init(firestore: Firestore = FirebaseService.firestore, storage: Storage = FirebaseService.storage) {
		self.firestore = firestore
		self.storage = storage
	}

	func bootstrapUser(uid: String, displayName: String, languages: [String]) async throws {
		let data: [String: Any] = [
			"displayName": displayName,
			"languages": languages,
			"avatarUrl": NSNull(),
			"createdAt": FieldValue.serverTimestamp()
		]
		try await firestore.collection("users").document(uid).setData(data, merge: true)
	}

	func fetchProfile(uid: String) async throws -> UserProfile? {
		let snap = try await firestore.collection("users").document(uid).getDocument()
		guard let data = snap.data() else { return nil }
		let displayName = data["displayName"] as? String ?? ""
		let languages = data["languages"] as? [String] ?? []
		let avatarUrl = data["avatarUrl"] as? String
		return UserProfile(uid: uid, displayName: displayName, languages: languages, avatarUrl: avatarUrl, createdAt: Date())
	}

	func uploadAvatar(uid: String, imageData: Data) async throws -> String {
		let ref = storage.reference(withPath: "avatars/\(uid).jpg")
		let _ = try await ref.putDataAsync(imageData, metadata: nil)
		let url = try await ref.downloadURL()
		try await firestore.collection("users").document(uid).setData(["avatarUrl": url.absoluteString], merge: true)
		return url.absoluteString
	}
}


