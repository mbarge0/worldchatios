import Foundation
import FirebaseCore

enum FirebaseBoot {
	static let didConfigure = Notification.Name("FirebaseDidConfigure")

	static func configureIfNeededAndSignal() {
		if FirebaseApp.app() == nil {
			FirebaseApp.configure()
		}
		NotificationCenter.default.post(name: didConfigure, object: nil)
	}
}


