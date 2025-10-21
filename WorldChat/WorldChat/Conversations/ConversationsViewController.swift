import UIKit
import FirebaseAuth

final class ConversationsViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Conversations"
        view.backgroundColor = .systemBackground

        let label = UILabel()
        label.text = "Messaging module will appear here in Phase B."
        label.numberOfLines = 0
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            label.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 24),
            label.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -24)
        ])

        navigationItem.rightBarButtonItem = UIBarButtonItem(title: "Sign Out", style: .plain, target: self, action: #selector(didTapSignOut))
    }

    @objc private func didTapSignOut() {
        do {
            try Auth.auth().signOut()
            print("🟦 [ConversationsVC] Signed out — returning to LoginViewController")
            if let window = view.window ?? UIApplication.shared.windows.first {
                let nav = UINavigationController(rootViewController: LoginViewController())
                window.rootViewController = nav
                window.makeKeyAndVisible()
            } else {
                navigationController?.setViewControllers([LoginViewController()], animated: true)
            }
        } catch {
            print("🔴 [ConversationsVC] Sign out failed: \(error)")
        }
    }
}


