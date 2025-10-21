import Foundation
import FirebaseFirestore
import FirebaseDatabase

final class PresenceService {
	private let firestore: Firestore
	private let database: Database

	init(firestore: Firestore = FirebaseService.firestore, database: Database = FirebaseService.realtimeDB) {
		self.firestore = firestore
		self.database = database
	}

	func setOnline(for userId: String) {
		// Firestore lastSeen/status
		firestore.collection("presence").document(userId).setData([
			"status": "online",
			"lastSeen": FieldValue.serverTimestamp()
		], merge: true)

		// RTDB live status
		let ref = database.reference(withPath: "status/\(userId)")
		ref.setValue(["state": "online", "updatedAt": ServerValue.timestamp()])
		ref.onDisconnectSetValue(["state": "offline", "updatedAt": ServerValue.timestamp()])
	}

	func setBackground(for userId: String) {
		firestore.collection("presence").document(userId).setData([
			"status": "offline",
			"lastSeen": FieldValue.serverTimestamp()
		], merge: true)

		let ref = database.reference(withPath: "status/\(userId)")
		ref.setValue(["state": "offline", "updatedAt": ServerValue.timestamp()])
	}
}


