import Foundation
import FirebaseFirestore
import FirebaseStorage

struct UserProfile: Codable {
	let uid: String
	let displayName: String
	let languages: [String]
	let avatarUrl: String?
    let language: String
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
            "photoURL": NSNull(),
            "language": (languages.first ?? "en"),
			"createdAt": FieldValue.serverTimestamp()
		]
		try await firestore.collection("users").document(uid).setData(data, merge: true)
	}

	func fetchProfile(uid: String) async throws -> UserProfile? {
        print("🟦 [ProfileService] fetchProfile uid=\(uid)")
		let snap = try await firestore.collection("users").document(uid).getDocument()
		guard let data = snap.data() else { return nil }
		let displayName = data["displayName"] as? String ?? ""
		let languages = data["languages"] as? [String] ?? []
        let photoURL = (data["photoURL"] as? String) ?? (data["avatarUrl"] as? String)
        let language = (data["language"] as? String) ?? languages.first ?? "en"
        print("🟩 [ProfileService] fetched profile name=\(displayName) language=\(language) photoURL=\(photoURL ?? "nil")")
        return UserProfile(uid: uid, displayName: displayName, languages: languages, avatarUrl: photoURL, language: language, createdAt: Date())
	}

    func uploadAvatar(uid: String, imageData: Data) async throws -> String {
        print("🟦 [ProfileService] uploadAvatar start uid=\(uid) bytes=\(imageData.count)")
        let path = "profileImages/\(uid)/avatar.jpg"
        print("🟦 [ProfileService] uploading to path=\(path)")
        let ref = storage.reference(withPath: path)

        // Use completion-based API with explicit error handling and logging
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            ref.putData(imageData, metadata: nil) { _, error in
                if let error = error {
                    print("🔴 [ProfileService] putData failed: \(error)")
                    cont.resume(throwing: error)
                    return
                }
                print("🟩 [ProfileService] putData success for uid=\(uid)")
                cont.resume()
            }
        }

        let url: URL = try await withCheckedThrowingContinuation { (cont: CheckedContinuation<URL, Error>) in
            ref.downloadURL { url, error in
                if let error = error {
                    print("🔴 [ProfileService] downloadURL failed: \(error)")
                    cont.resume(throwing: error)
                    return
                }
                guard let url = url else {
                    print("🔴 [ProfileService] downloadURL missing URL (nil)")
                    cont.resume(throwing: NSError(domain: "ProfileService", code: -2, userInfo: [NSLocalizedDescriptionKey: "Missing download URL"]))
                    return
                }
                print("🟩 [ProfileService] downloadURL=\(url.absoluteString)")
                cont.resume(returning: url)
            }
        }

        do {
            try await firestore.collection("users").document(uid).setData(["photoURL": url.absoluteString, "avatarUrl": url.absoluteString], merge: true)
            print("🟩 [ProfileService] Firestore updated users/\(uid) with photoURL")
        } catch {
            print("🔴 [ProfileService] Firestore update failed: \(error)")
            throw error
        }
        return url.absoluteString
    }

    func updateLanguage(uid: String, language: String) async throws {
        let lang = language.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let code = lang.isEmpty ? "en" : lang
        try await firestore.collection("users").document(uid).setData(["language": code], merge: true)
    }
}


