import Foundation
import SwiftData

@Model
final class UserEntity {
	@Attribute(.unique) var uid: String
	var displayName: String
	var languages: [String]
	var avatarUrl: String?
	var updatedAt: Date

	init(uid: String, displayName: String, languages: [String], avatarUrl: String?, updatedAt: Date) {
		self.uid = uid
		self.displayName = displayName
		self.languages = languages
		self.avatarUrl = avatarUrl
		self.updatedAt = updatedAt
	}
}

final class LocalCacheService {
	let container: ModelContainer

	init() {
		// TODO: configure shared container for app groups if needed
		self.container = try! ModelContainer(for: UserEntity.self)
	}

	func upsert(from profile: UserProfile) throws {
		let context = ModelContext(container)
		let fetch = FetchDescriptor<UserEntity>(predicate: #Predicate { $0.uid == profile.uid })
		if let existing = try? context.fetch(fetch).first {
			existing.displayName = profile.displayName
			existing.languages = profile.languages
			existing.avatarUrl = profile.avatarUrl
			existing.updatedAt = Date()
		} else {
			let entity = UserEntity(uid: profile.uid, displayName: profile.displayName, languages: profile.languages, avatarUrl: profile.avatarUrl, updatedAt: Date())
			context.insert(entity)
		}
		try? context.save()
	}

	func load(uid: String) -> UserEntity? {
		let context = ModelContext(container)
		let fetch = FetchDescriptor<UserEntity>(predicate: #Predicate { $0.uid == uid })
		return (try? context.fetch(fetch).first) ?? nil
	}
}


