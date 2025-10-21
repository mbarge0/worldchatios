import UIKit
import FirebaseAuth

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)

        let rootVC: UIViewController
        if Auth.auth().currentUser != nil {
            print("🟩 [SceneDelegate] User is signed in — showing ConversationsViewController")
            rootVC = ConversationsViewController()
        } else {
            print("🟥 [SceneDelegate] No user — showing LoginViewController")
            rootVC = LoginViewController()
        }

        window.rootViewController = UINavigationController(rootViewController: rootVC)
        self.window = window
        window.makeKeyAndVisible()
    }
}


