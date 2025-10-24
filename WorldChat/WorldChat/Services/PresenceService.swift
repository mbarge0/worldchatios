import Foundation
import FirebaseFirestore
import FirebaseDatabase

final class PresenceService {
	static let shared = PresenceService()

	private let firestore: Firestore
	private let database: Database
    private var userPresenceRef: DatabaseReference?
    private var userLegacyStatusRef: DatabaseReference?

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

        // RTDB: presence/{uid} (current path)
        let presenceRef = database.reference(withPath: "presence/\(userId)")
        presenceRef.setValue(["online": true, "lastSeen": ServerValue.timestamp()])
        presenceRef.onDisconnectUpdateChildValues(["online": false, "lastSeen": ServerValue.timestamp()])
        userPresenceRef = presenceRef

        // RTDB: status/{uid} (legacy/compat path)
        let legacyRef = database.reference(withPath: "status/\(userId)")
        legacyRef.setValue(["online": true, "lastSeen": ServerValue.timestamp()])
        legacyRef.onDisconnectUpdateChildValues(["online": false, "lastSeen": ServerValue.timestamp()])
        userLegacyStatusRef = legacyRef
	}

	func stop(for userId: String) {
		// Firestore: mark offline
		firestore.collection("presence").document(userId).setData([
			"online": false,
			"lastSeen": FieldValue.serverTimestamp()
		], merge: true)

        // RTDB: mark offline immediately on both paths
        let presenceRef = userPresenceRef ?? database.reference(withPath: "presence/\(userId)")
        presenceRef.updateChildValues(["online": false, "lastSeen": ServerValue.timestamp()])
        let legacyRef = userLegacyStatusRef ?? database.reference(withPath: "status/\(userId)")
        legacyRef.updateChildValues(["online": false, "lastSeen": ServerValue.timestamp()])
	}

	// Backwards-compatible helpers
	func setOnline(for userId: String) { start(for: userId) }
	func setBackground(for userId: String) { stop(for: userId) }
}


