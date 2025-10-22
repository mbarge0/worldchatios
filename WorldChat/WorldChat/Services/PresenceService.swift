import Foundation
import FirebaseFirestore
import FirebaseDatabase

final class PresenceService {
	static let shared = PresenceService()

	private let firestore: Firestore
	private let database: Database
	private var userStatusRef: DatabaseReference?

	init(firestore: Firestore = FirebaseService.firestore, database: Database = FirebaseService.realtimeDB) {
		self.firestore = firestore
		self.database = database
	}

	// Lifecycle-driven API
	func start(for userId: String) {
		// Firestore: mark online
		firestore.collection("presence").document(userId).setData([
			"online": true,
			"lastSeen": FieldValue.serverTimestamp()
		], merge: true)

		// RTDB: presence/{uid}
		let ref = database.reference(withPath: "presence/\(userId)")
		ref.setValue(["online": true, "lastSeen": ServerValue.timestamp()])
		ref.onDisconnectUpdateChildValues(["online": false, "lastSeen": ServerValue.timestamp()])
		userStatusRef = ref
	}

	func stop(for userId: String) {
		// Firestore: mark offline
		firestore.collection("presence").document(userId).setData([
			"online": false,
			"lastSeen": FieldValue.serverTimestamp()
		], merge: true)

		// RTDB: mark offline immediately
		let ref = userStatusRef ?? database.reference(withPath: "presence/\(userId)")
		ref.updateChildValues(["online": false, "lastSeen": ServerValue.timestamp()])
	}

	// Backwards-compatible helpers
	func setOnline(for userId: String) { start(for: userId) }
	func setBackground(for userId: String) { stop(for: userId) }
}


