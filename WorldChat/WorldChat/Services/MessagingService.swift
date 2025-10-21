import Foundation
import FirebaseAuth
import FirebaseFirestore
import FirebaseDatabase
import FirebaseStorage

struct Conversation: Hashable {
	let id: String
	let participants: [String]
	let title: String
	let lastMessage: String?
	let lastMessageAt: Date?
}

struct Message: Hashable {
	let id: String
	let senderId: String
	let text: String
	let timestamp: Date
	let status: String // sending | sent | delivered | read
	let translations: [String: String]?
	let readBy: [String]
}

final class MessagingService {
	private let firestore: Firestore
	private let database: Database
	private let auth: Auth

	init(firestore: Firestore = FirebaseService.firestore,
		 database: Database = FirebaseService.realtimeDB,
		 auth: Auth = FirebaseService.auth) {
		self.firestore = firestore
		self.database = database
		self.auth = auth
	}

	// MARK: - Conversations

	func listenConversations(for userId: String, onChange: @escaping ([Conversation]) -> Void) -> ListenerRegistration {
		let query = firestore.collection("conversations")
			.whereField("participants", arrayContains: userId)
			.order(by: "lastMessageAt", descending: true)
		return query.addSnapshotListener { snapshot, error in
			guard let docs = snapshot?.documents, error == nil else {
				print("🔴 [MessagingService] listenConversations error: \(String(describing: error))")
				onChange([])
				return
			}
			let items: [Conversation] = docs.map { doc in
				let data = doc.data()
				let participants = data["participants"] as? [String] ?? []
				let title = data["title"] as? String ?? "Chat"
				let lastMessage = data["lastMessage"] as? String
				let ts = data["lastMessageAt"] as? Timestamp
				return Conversation(
					id: doc.documentID,
					participants: participants,
					title: title,
					lastMessage: lastMessage,
					lastMessageAt: ts?.dateValue()
				)
			}
			onChange(items)
		}
	}

	func createConversation(with otherUserId: String, completion: @escaping (Result<String, Error>) -> Void) {
		guard let current = auth.currentUser?.uid else {
			completion(.failure(NSError(domain: "MessagingService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])));
			return
		}
		let participants = [current, otherUserId].sorted()
		let data: [String: Any] = [
			"type": "one-on-one",
			"participants": participants,
			"createdAt": FieldValue.serverTimestamp(),
			"lastMessageAt": FieldValue.serverTimestamp(),
			"title": "Chat"
		]
		var ref: DocumentReference?
		ref = firestore.collection("conversations").addDocument(data: data) { error in
			if let error = error {
				completion(.failure(error)); return
			}
			completion(.success(ref!.documentID))
		}
	}

	// MARK: - Messages

	func listenMessages(conversationId: String, onChange: @escaping ([Message]) -> Void) -> ListenerRegistration {
		let query = firestore.collection("conversations").document(conversationId)
			.collection("messages").order(by: "timestamp", descending: false)
		return query.addSnapshotListener { snapshot, error in
			guard let docs = snapshot?.documents, error == nil else {
				print("🔴 [MessagingService] listenMessages error: \(String(describing: error))")
				onChange([])
				return
			}
			let messages: [Message] = docs.compactMap { doc in
				let d = doc.data()
				guard let senderId = d["senderId"] as? String,
					  let text = d["text"] as? String,
					  let ts = d["timestamp"] as? Timestamp else { return nil }
				let status = d["status"] as? String ?? "sent"
				let translations = d["translations"] as? [String: String]
				let readBy = d["readBy"] as? [String] ?? []
				return Message(
					id: doc.documentID,
					senderId: senderId,
					text: text,
					timestamp: ts.dateValue(),
					status: status,
					translations: translations,
					readBy: readBy
				)
			}
			onChange(messages)
		}
	}

	/// Optimistic send with a stable client message ID; server will set timestamp
	func sendMessage(conversationId: String, text: String, completion: @escaping (Result<String, Error>) -> Void) {
		guard let current = auth.currentUser?.uid else {
			completion(.failure(NSError(domain: "MessagingService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])));
			return
		}
		let clientId = UUID().uuidString
		let messageData: [String: Any] = [
			"senderId": current,
			"text": text,
			"timestamp": FieldValue.serverTimestamp(),
			"status": "sent",
			"clientId": clientId
		]
		let convoRef = firestore.collection("conversations").document(conversationId)
		let messagesRef = convoRef.collection("messages").document()
		firestore.runTransaction({ (transaction, errorPointer) -> Any? in
			transaction.setData(messageData, forDocument: messagesRef)
			transaction.updateData([
				"lastMessage": text,
				"lastMessageAt": FieldValue.serverTimestamp()
			], forDocument: convoRef)
			return nil
		}) { _, error in
			if let error = error { completion(.failure(error)) } else { completion(.success(clientId)) }
		}
	}

	// Delivery / Read receipts
	func markDelivered(conversationId: String, messageId: String) {
		let ref = firestore.collection("conversations").document(conversationId).collection("messages").document(messageId)
		ref.setData(["status": "delivered"], merge: true)
	}

	func markRead(conversationId: String, messageId: String, userId: String) {
		let ref = firestore.collection("conversations").document(conversationId).collection("messages").document(messageId)
		ref.setData([
			"status": "read",
			"readBy": FieldValue.arrayUnion([userId])
		], merge: true)
	}

	// MARK: - Typing Indicator (RTDB)

	func setTyping(conversationId: String, isTyping: Bool) {
		guard let current = auth.currentUser?.uid else { return }
		let ref = database.reference(withPath: "typingIndicators/\(conversationId)/\(current)")
		if isTyping {
			ref.setValue(["ts": ServerValue.timestamp()])
		} else {
			ref.removeValue()
		}
	}

	func listenTyping(conversationId: String, otherUserId: String, onChange: @escaping (Bool) -> Void) -> DatabaseHandle {
		let ref = database.reference(withPath: "typingIndicators/\(conversationId)/\(otherUserId)")
		return ref.observe(.value) { snapshot in
			if let dict = snapshot.value as? [String: Any], let ts = dict["ts"] as? TimeInterval {
				let now = Date().timeIntervalSince1970 * 1000.0
				let isActive = (now - ts) < 1500 // 1.5s recent
				onChange(isActive)
			} else {
				onChange(false)
			}
		}
	}

	// Presence header convenience (Firestore presence collection)
	func listenPresence(userId: String, onChange: @escaping (String) -> Void) -> ListenerRegistration {
		firestore.collection("presence").document(userId).addSnapshotListener { snap, _ in
			let status = (snap?.data()? ["status"] as? String) ?? "offline"
			onChange(status)
		}
	}
}

enum MessagingMedia {
	static func uploadImage(conversationId: String, data: Data, completion: @escaping (Result<Void, Error>) -> Void) {
		guard let uid = FirebaseService.auth.currentUser?.uid else {
			completion(.failure(NSError(domain: "MessagingMedia", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"]))); return
		}
		let storage = FirebaseService.storage
		let path = "conversations/\(conversationId)/images/\(UUID().uuidString).jpg"
		let ref = storage.reference(withPath: path)
		ref.putData(data, metadata: nil) { _, error in
			if let error = error { completion(.failure(error)); return }
			ref.downloadURL { url, err in
				if let err = err { completion(.failure(err)); return }
				guard let url = url else { completion(.failure(NSError(domain: "MessagingMedia", code: -1, userInfo: nil))); return }
				let convoRef = FirebaseService.firestore.collection("conversations").document(conversationId)
				let messagesRef = convoRef.collection("messages").document()
				let messageData: [String: Any] = [
					"senderId": uid,
					"text": "", // text empty for media-only
					"mediaURL": url.absoluteString,
					"timestamp": FieldValue.serverTimestamp(),
					"status": "sent"
				]
				FirebaseService.firestore.runTransaction({ tx, _ in
					tx.setData(messageData, forDocument: messagesRef)
					tx.updateData(["lastMessage": "📷 Photo", "lastMessageAt": FieldValue.serverTimestamp()], forDocument: convoRef)
					return nil
				}) { _, e in
					if let e = e { completion(.failure(e)) } else { completion(.success(())) }
				}
			}
		}
	}
}
