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

@Model
final class ConversationEntity {
	@Attribute(.unique) var id: String
	var lastMessage: String?
	var lastMessageAt: Date?
	var participants: [String]

	init(id: String, lastMessage: String?, lastMessageAt: Date?, participants: [String]) {
		self.id = id
		self.lastMessage = lastMessage
		self.lastMessageAt = lastMessageAt
		self.participants = participants
	}
}

@Model
final class MessageEntity {
	@Attribute(.unique) var id: String
	var conversationId: String
	var senderId: String
	var text: String
	var timestamp: Date
	var status: String // sending | sent | delivered | read

	init(id: String, conversationId: String, senderId: String, text: String, timestamp: Date, status: String) {
		self.id = id
		self.conversationId = conversationId
		self.senderId = senderId
		self.text = text
		self.timestamp = timestamp
		self.status = status
	}
}

final class LocalCacheService {
	let container: ModelContainer

	init() {
		self.container = try! ModelContainer(for: UserEntity.self, ConversationEntity.self, MessageEntity.self)
	}

	// User
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

	// Queue operations
	func enqueueOutgoing(conversationId: String, clientId: String, senderId: String, text: String) {
		let context = ModelContext(container)
		let entity = MessageEntity(id: clientId, conversationId: conversationId, senderId: senderId, text: text, timestamp: Date(), status: "sending")
		context.insert(entity)
		try? context.save()
	}

	func markSent(conversationId: String, clientId: String) {
		let context = ModelContext(container)
		let fetch = FetchDescriptor<MessageEntity>(predicate: #Predicate { $0.id == clientId && $0.conversationId == conversationId })
		if let msg = try? context.fetch(fetch).first {
			msg.status = "sent"
			try? context.save()
		}
	}

	func pendingMessages() -> [MessageEntity] {
		let context = ModelContext(container)
		let fetch = FetchDescriptor<MessageEntity>(predicate: #Predicate { $0.status == "sending" })
		return (try? context.fetch(fetch)) ?? []
	}
}

final class SendQueueService {
	private let cache = LocalCacheService()
	private let messaging = MessagingService()
	private var timer: Timer?

	func start() {
		// Retry every 5s
		timer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true, block: { [weak self] _ in
			self?.flush()
		})
	}

	func stop() { timer?.invalidate(); timer = nil }

	func stage(conversationId: String, text: String) {
		let clientId = UUID().uuidString
		let uid = FirebaseService.auth.currentUser?.uid ?? ""
		cache.enqueueOutgoing(conversationId: conversationId, clientId: clientId, senderId: uid, text: text)
		// Attempt immediate send
		messaging.sendMessage(conversationId: conversationId, text: text) { [weak self] result in
			if case .success = result {
				self?.cache.markSent(conversationId: conversationId, clientId: clientId)
			}
		}
	}

	func flush() {
		let pending = cache.pendingMessages()
		guard !pending.isEmpty else { return }
		for p in pending {
			messaging.sendMessage(conversationId: p.conversationId, text: p.text) { [weak self] result in
				if case .success = result {
					self?.cache.markSent(conversationId: p.conversationId, clientId: p.id)
				}
			}
		}
	}
}


