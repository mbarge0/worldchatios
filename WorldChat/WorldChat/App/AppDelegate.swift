import UIKit
import FirebaseCore
import UserNotifications
import FirebaseAuth

@main
final class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
	func application(_ application: UIApplication,
					 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
		FirebaseApp.configure()
		print("🟦 [AppDelegate] didFinishLaunchingWithOptions — Firebase configured")

		// Brand navigation styling
		let navAppearance = UINavigationBarAppearance()
		navAppearance.configureWithOpaqueBackground()
		navAppearance.backgroundColor = Theme.brandPrimary
		navAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
		navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
		UINavigationBar.appearance().standardAppearance = navAppearance
		UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
		UINavigationBar.appearance().compactAppearance = navAppearance
		UINavigationBar.appearance().tintColor = Theme.gold
		UIBarButtonItem.appearance().tintColor = Theme.gold

		// Tab bar styling (if used later)
		let tabAppearance = UITabBarAppearance()
		tabAppearance.configureWithOpaqueBackground()
		tabAppearance.backgroundColor = Theme.brandPrimary
		tabAppearance.stackedLayoutAppearance.selected.iconColor = Theme.gold
		tabAppearance.stackedLayoutAppearance.selected.titleTextAttributes = [.foregroundColor: Theme.gold]
		tabAppearance.inlineLayoutAppearance.selected.iconColor = Theme.gold
		tabAppearance.inlineLayoutAppearance.selected.titleTextAttributes = [.foregroundColor: Theme.gold]
		UITabBar.appearance().standardAppearance = tabAppearance
		if #available(iOS 15.0, *) { UITabBar.appearance().scrollEdgeAppearance = tabAppearance }
		UITabBar.appearance().tintColor = Theme.gold

		// Alerts
		UIView.appearance(whenContainedInInstancesOf: [UIAlertController.self]).tintColor = Theme.gold

		UNUserNotificationCenter.current().delegate = self
		UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
			print("🟦 [Notifications] authorization granted: \(granted)")
		}
		application.registerForRemoteNotifications()
		return true
	}

	func applicationDidBecomeActive(_ application: UIApplication) {
		if let uid = Auth.auth().currentUser?.uid {
			PresenceService().setOnline(for: uid)
		}
	}

	func applicationWillResignActive(_ application: UIApplication) {
		if let uid = Auth.auth().currentUser?.uid {
			PresenceService().setBackground(for: uid)
		}
	}

	func application(_ application: UIApplication,
					 configurationForConnecting connectingSceneSession: UISceneSession,
					 options: UIScene.ConnectionOptions) -> UISceneConfiguration {
		let config = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
		config.delegateClass = SceneDelegate.self
		return config
	}

	// Foreground presentation
	func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
		completionHandler([.banner, .sound, .list])
	}

	// Tap routing (foreground path)
	func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
		let userInfo = response.notification.request.content.userInfo
		if let conversationId = userInfo["conversationId"] as? String {
			NotificationCenter.default.post(name: NSNotification.Name("OpenConversation"), object: conversationId)
		}
		completionHandler()
	}
}


