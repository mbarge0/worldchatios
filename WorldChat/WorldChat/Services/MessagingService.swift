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
    let type: String?
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
			let items: [Conversation] = docs.compactMap { doc in
				let data = doc.data()
				let participants = data["participants"] as? [String] ?? []
				let title = data["title"] as? String ?? "Chat"
				let type = data["type"] as? String
				let lastMessage = data["lastMessage"] as? String
				let ts = data["lastMessageAt"] as? Timestamp
				let hiddenBy = data["hiddenBy"] as? [String] ?? []
				if hiddenBy.contains(userId) { return nil }
				return Conversation(
					id: doc.documentID,
					participants: participants,
					title: title,
					lastMessage: lastMessage,
					lastMessageAt: ts?.dateValue(),
					type: type
				)
			}
			onChange(items)
		}
	}

	func markAllAsRead(conversationId: String, otherUserId: String, currentUserId: String) {
		let convoRef = firestore.collection("conversations").document(conversationId)
		convoRef.collection("messages")
			.whereField("senderId", isEqualTo: otherUserId)
			.getDocuments { [weak self] snap, error in
				guard error == nil, let docs = snap?.documents else { return }
				for doc in docs {
					let ref = convoRef.collection("messages").document(doc.documentID)
					ref.setData(["readBy": FieldValue.arrayUnion([currentUserId]), "status": "read"], merge: true)
				}
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

    /// Create a multi-participant group conversation
    /// - Parameters:
    ///   - title: Group title displayed in headers and conversation list
    ///   - participantIds: Unique user IDs to include (must include current user)
    ///   - participantLanguages: Map of uid -> language code (e.g., {"uid": "en"})
    ///   - completion: Returns new conversationId or error
    func createGroupConversation(title: String,
                                 participantIds: [String],
                                 participantLanguages: [String: String],
                                 completion: @escaping (Result<String, Error>) -> Void) {
        guard let current = auth.currentUser?.uid else {
            completion(.failure(NSError(domain: "MessagingService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])));
            return
        }
        var unique = Set(participantIds)
        unique.insert(current)
        let participants = Array(unique).sorted()

        // Build participantLanguages map from provided input or fetch from users/{uid}
        var langMap: [String: String] = participantLanguages
        let group = DispatchGroup()
        for uid in participants where langMap[uid] == nil {
            group.enter()
            firestore.collection("users").document(uid).getDocument { snap, _ in
                if let data = snap?.data() {
                    if let l = data["language"] as? String, !l.isEmpty {
                        langMap[uid] = l
                    } else if let primary = data["primaryLanguage"] as? String, !primary.isEmpty {
                        langMap[uid] = primary
                    } else if let langs = data["languages"] as? [String], let first = langs.first, !first.isEmpty {
                        langMap[uid] = first
                    }
                }
                if langMap[uid] == nil { langMap[uid] = "en" }
                group.leave()
            }
        }

        group.notify(queue: .main) {
            var data: [String: Any] = [
                "type": "group",
                "title": title,
                "participants": participants,
                "participantLanguages": langMap,
                "createdAt": FieldValue.serverTimestamp(),
                "lastMessage": "",
                "lastMessageAt": FieldValue.serverTimestamp()
            ]
            print("🟩 [MessagingService] createGroupConversation title=\(title) participants=\(participants) participantLanguages=\(langMap)")
            var ref: DocumentReference?
            ref = self.firestore.collection("conversations").addDocument(data: data) { error in
                if let error = error { completion(.failure(error)); return }
                completion(.success(ref!.documentID))
            }
        }
    }

    /// Fetch a single conversation document
    func fetchConversation(conversationId: String, completion: @escaping (Result<Conversation, Error>) -> Void) {
        firestore.collection("conversations").document(conversationId).getDocument { snap, error in
            if let error = error { completion(.failure(error)); return }
            guard let doc = snap, let data = doc.data() else {
                completion(.failure(NSError(domain: "MessagingService", code: 404, userInfo: [NSLocalizedDescriptionKey: "Conversation not found"])));
                return
            }
            let participants = data["participants"] as? [String] ?? []
            let title = data["title"] as? String ?? "Chat"
            let lastMessage = data["lastMessage"] as? String
            let ts = data["lastMessageAt"] as? Timestamp
            let convo = Conversation(
                id: doc.documentID,
                participants: participants,
                title: title,
                lastMessage: lastMessage,
                lastMessageAt: ts?.dateValue(),
                type: data["type"] as? String
            )
            completion(.success(convo))
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
			let withTranslations = docs.filter { ($0.data()["translations"] as? [String: String])?.isEmpty == false }.count
			let changesDesc: String = (snapshot?.documentChanges ?? []).map { ch in
				let hasT = ((ch.document.data()["translations"] as? [String: String])?.isEmpty == false)
				let typeStr: String
				switch ch.type {
				case .added: typeStr = "added"
				case .modified: typeStr = "modified"
				case .removed: typeStr = "removed"
				@unknown default: typeStr = "unknown"
				}
				let tdict = ch.document.data()["translations"] as? [String: String]
				let tkeys: [String] = tdict.map { Array($0.keys) } ?? []
				return "\(typeStr) \(ch.document.documentID) trans=\(hasT) keys=\(tkeys)"
			}.joined(separator: ", ")
			print("🟡 [MessagingService] listenMessages update: total=\(docs.count), withTranslations=\(withTranslations); changes=[\(changesDesc)]")
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

	/// Delete (1:1 soft hide) or leave (group). If group becomes empty, delete doc.
	func deleteOrLeave(conversationId: String, completion: @escaping (Result<Void, Error>) -> Void) {
		guard let current = auth.currentUser?.uid else {
			completion(.failure(NSError(domain: "MessagingService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])));
			return
		}
		let ref = firestore.collection("conversations").document(conversationId)
		ref.getDocument { [weak self] snap, err in
			if let err = err { completion(.failure(err)); return }
			guard let self = self, let data = snap?.data() else {
				completion(.failure(NSError(domain: "MessagingService", code: 404, userInfo: [NSLocalizedDescriptionKey: "Conversation not found"])));
				return
			}
			let type = (data["type"] as? String) ?? "one-on-one"
			let participants = (data["participants"] as? [String]) ?? []
			if type == "group" || participants.count > 2 {
				// Remove user from participants; delete if empty
				var newParticipants = participants.filter { $0 != current }
				if newParticipants.isEmpty {
					ref.delete { e in if let e = e { completion(.failure(e)) } else { completion(.success(())) } }
				} else {
					ref.updateData(["participants": newParticipants]) { e in if let e = e { completion(.failure(e)) } else { completion(.success(())) } }
				}
			} else {
				// Soft hide for 1:1
				ref.setData(["hiddenBy": FieldValue.arrayUnion([current])], merge: true) { e in
					if let e = e { completion(.failure(e)) } else { completion(.success(())) }
				}
			}
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

	// Presence header convenience (RTDB presence collection)
	func listenPresence(userId: String, onChange: @escaping (String) -> Void) -> DatabaseHandle {
		let ref = database.reference(withPath: "presence/\(userId)")
		return ref.observe(.value) { snapshot in
			if let dict = snapshot.value as? [String: Any], let online = dict["online"] as? Bool {
				onChange(online ? "online" : "offline")
			} else {
				onChange("offline")
			}
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
