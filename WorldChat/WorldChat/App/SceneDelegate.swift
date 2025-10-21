import UIKit
import FirebaseAuth

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        self.window = window
        if Auth.auth().currentUser != nil {
            window.rootViewController = UINavigationController(rootViewController: ConversationsViewController())
        } else {
            window.rootViewController = UINavigationController(rootViewController: LoginViewController())
        }
        window.makeKeyAndVisible()

        NotificationCenter.default.addObserver(self, selector: #selector(openConversation(_:)), name: NSNotification.Name("OpenConversation"), object: nil)
    }

    @objc private func openConversation(_ note: Notification) {
        guard let conversationId = note.object as? String,
              let nav = window?.rootViewController as? UINavigationController else { return }
        // For MVP, push chat with empty otherUserId (will still show messages)
        nav.popToRootViewController(animated: false)
        nav.pushViewController(ChatViewController(conversationId: conversationId, otherUserId: ""), animated: true)
    }
}


