import Foundation
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore
import FirebaseStorage
import FirebaseDatabase

enum FirebaseService {
	static func configureIfNeeded() {
		if FirebaseApp.app() == nil {
			FirebaseApp.configure()
		}
	}

	static var auth: Auth {
		configureIfNeeded()
		return Auth.auth()
	}

	static var firestore: Firestore {
		configureIfNeeded()
		return Firestore.firestore()
	}

	static var storage: Storage {
		configureIfNeeded()
		return Storage.storage()
	}

	static var realtimeDB: Database {
		configureIfNeeded()
		return Database.database()
	}
}


