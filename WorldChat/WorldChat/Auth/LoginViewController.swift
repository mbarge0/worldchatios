import UIKit
import Combine

final class LoginViewController: UIViewController {
	private let emailField: UITextField = {
		let tf = UITextField()
		tf.placeholder = "Email"
		tf.autocapitalizationType = .none
		tf.autocorrectionType = .no
		tf.borderStyle = .roundedRect
		tf.keyboardType = .emailAddress
		return tf
	}()

	private let passwordField: UITextField = {
		let tf = UITextField()
		tf.placeholder = "Password"
		tf.isSecureTextEntry = true
		tf.borderStyle = .roundedRect
		return tf
	}()

	private let signInButton: UIButton = {
		let btn = UIButton(type: .system)
		btn.setTitle("Sign In", for: .normal)
		btn.addTarget(nil, action: #selector(didTapSignIn), for: .touchUpInside)
		btn.backgroundColor = Theme.gold
		btn.setTitleColor(Theme.brandPrimary, for: .normal)
		btn.layer.cornerRadius = 10
		btn.heightAnchor.constraint(equalToConstant: 50).isActive = true
		return btn
	}()

	private let statusLabel: UILabel = {
		let l = UILabel()
		l.textColor = .systemRed
		l.numberOfLines = 0
		l.textAlignment = .center
		return l
	}()

	private let authService = AuthService()

	override func viewDidLoad() {
		super.viewDidLoad()
		title = "WorldChat Login"
		view.backgroundColor = Theme.brandPrimary

		[emailField, passwordField, signInButton, statusLabel].forEach { view.addSubview($0) }
		emailField.backgroundColor = .white
		emailField.textColor = Theme.brandPrimary
		passwordField.backgroundColor = .white
		passwordField.textColor = Theme.brandPrimary
		statusLabel.textColor = .white
	}

	override func viewDidLayoutSubviews() {
		super.viewDidLayoutSubviews()
		let inset: CGFloat = 24
		let width = view.bounds.width - inset * 2
		var y = view.safeAreaInsets.top + 120
		emailField.frame = CGRect(x: inset, y: y, width: width, height: 44)
		y += 56
		passwordField.frame = CGRect(x: inset, y: y, width: width, height: 44)
		y += 64
		signInButton.frame = CGRect(x: inset, y: y, width: width, height: 50)
		y += 56
		statusLabel.frame = CGRect(x: inset, y: y, width: width, height: 80)
	}

	@objc private func didTapSignIn() {
		statusLabel.text = nil
		let email = emailField.text ?? ""
		let password = passwordField.text ?? ""
		print("🟨 [LoginVC] Sign In tapped email=\(email)")
		Task { await signIn(email: email, password: password) }
	}

	private func signIn(email: String, password: String) async {
		do {
			print("🟢 [LoginVC] signIn start")
			let uid = try await authService.signIn(email: email, password: password)
			print("🟢 [LoginVC] signIn success uid=\(uid)")
			DispatchQueue.main.async { [weak self] in
				self?.presentConversations()
			}
		} catch {
			print("🔴 [LoginVC] signIn error=\(error)")
			DispatchQueue.main.async { [weak self] in
				self?.statusLabel.text = "Login failed. Please check your credentials."
			}
		}
	}

	private func presentConversations() {
		print("🟩 [LoginVC] Transition → ConversationsViewController")
		let vc = ConversationsViewController()
		if let nav = navigationController {
			nav.setViewControllers([vc], animated: true)
		} else {
			present(UINavigationController(rootViewController: vc), animated: true)
		}
	}
}


