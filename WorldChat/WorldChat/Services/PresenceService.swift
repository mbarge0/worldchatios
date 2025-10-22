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

	// Preferred lifecycle-driven API
	func start(for userId: String) {
		// Firestore presence doc: online true + lastSeen
		firestore.collection("presence").document(userId).setData([
			"online": true,
			"lastSeen": FieldValue.serverTimestamp()
		], merge: true)

		// RTDB user status with onDisconnect offline
		let ref = database.reference(withPath: "status/\(userId)")
		ref.setValue(["state": "online", "updatedAt": ServerValue.timestamp()])
		ref.onDisconnectUpdateChildValues(["state": "offline", "updatedAt": ServerValue.timestamp()])
		userStatusRef = ref
	}

	func stop(for userId: String) {
		firestore.collection("presence").document(userId).setData([
			"online": false,
			"lastSeen": FieldValue.serverTimestamp()
		], merge: true)

		let ref = userStatusRef ?? database.reference(withPath: "status/\(userId)")
		ref.updateChildValues(["state": "offline", "updatedAt": ServerValue.timestamp()])
	}

	// Backwards-compatible helpers
	func setOnline(for userId: String) { start(for: userId) }
	func setBackground(for userId: String) { stop(for: userId) }
}


