import UIKit
import FirebaseAuth

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        self.window = window
        if Auth.auth().currentUser != nil {
            let root = ConversationsViewController()
            root.navigationItem.backButtonTitle = "Back"
            window.rootViewController = UINavigationController(rootViewController: root)
        } else {
            let root = LoginViewController()
            root.navigationItem.backButtonTitle = "Back"
            window.rootViewController = UINavigationController(rootViewController: root)
        }
        window.makeKeyAndVisible()

        NotificationCenter.default.addObserver(self, selector: #selector(openConversation(_:)), name: NSNotification.Name("OpenConversation"), object: nil)
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        if let uid = Auth.auth().currentUser?.uid { PresenceService.shared.start(for: uid) }
    }

    func sceneWillResignActive(_ scene: UIScene) {
        if let uid = Auth.auth().currentUser?.uid { PresenceService.shared.stop(for: uid) }
    }

    @objc private func openConversation(_ note: Notification) {
        guard let conversationId = note.object as? String,
              let nav = window?.rootViewController as? UINavigationController else { return }
        nav.popToRootViewController(animated: false)
        nav.pushViewController(ChatViewController(conversationId: conversationId, otherUserId: "", chatTitle: nil), animated: true)
    }
}


