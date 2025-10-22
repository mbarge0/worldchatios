import UIKit
import FirebaseAuth
import FirebaseFirestore

final class ConversationsViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {
	private let tableView = UITableView(frame: .zero, style: .plain)
	private let emptyLabel = UILabel()
	private let messaging = MessagingService()
	private var conversations: [Conversation] = []
	private var listener: ListenerRegistration?
	private var presenceListeners: [String: ListenerRegistration] = [:]
	private var userIdToOnline: [String: Bool] = [:]

	override func viewDidLoad() {
		super.viewDidLoad()
		title = "Conversations"
		view.backgroundColor = .systemBackground

		navigationItem.backButtonTitle = "Back"

		tableView.dataSource = self
		tableView.delegate = self
		tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
		tableView.separatorColor = Theme.brandSecondary.withAlphaComponent(0.6)
		tableView.translatesAutoresizingMaskIntoConstraints = false
		view.addSubview(tableView)
		NSLayoutConstraint.activate([
			tableView.topAnchor.constraint(equalTo: view.topAnchor),
			tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
			tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
			tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
		])

		emptyLabel.text = "Start a conversation"
		emptyLabel.textAlignment = .center
		emptyLabel.textColor = Theme.brandPrimary
		emptyLabel.translatesAutoresizingMaskIntoConstraints = false
		view.addSubview(emptyLabel)
		NSLayoutConstraint.activate([
			emptyLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
			emptyLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor)
		])

		navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Sign Out", style: .plain, target: self, action: #selector(didTapSignOut))
		navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(didTapNew))

		attachListener()
	}

	private func attachListener() {
		guard let uid = Auth.auth().currentUser?.uid else { return }
		listener = messaging.listenConversations(for: uid) { [weak self] items in
			guard let self = self else { return }
			self.conversations = items
			self.tableView.reloadData()
			self.emptyLabel.isHidden = !items.isEmpty
			self.attachPresenceListeners()
		}
	}

	private func attachPresenceListeners() {
		// Remove old listeners
		presenceListeners.values.forEach { $0.remove() }
		presenceListeners.removeAll()
		userIdToOnline.removeAll()
		// Listen to presence for all participants except current user
		let current = Auth.auth().currentUser?.uid ?? ""
		let participantIds = Set(conversations.flatMap { $0.participants }.filter { $0 != current })
		participantIds.forEach { uid in
			let l = FirebaseService.firestore.collection("presence").document(uid).addSnapshotListener { [weak self] snap, _ in
				guard let self = self else { return }
				let online = (snap?.data()? ["online"] as? Bool) ?? false
				self.userIdToOnline[uid] = online
				self.tableView.visibleCells.forEach { cell in
					if let indexPath = self.tableView.indexPath(for: cell) {
						let convo = self.conversations[indexPath.row]
						let other = convo.participants.first(where: { $0 != current }) ?? ""
						if other == uid { self.applyPresence(on: cell, online: online) }
					}
				}
			}
			presenceListeners[uid] = l
		}
	}

	private func applyPresence(on cell: UITableViewCell, online: Bool) {
		let dot = UIView(frame: CGRect(x: 0, y: 0, width: 10, height: 10))
		dot.layer.cornerRadius = 5
		dot.backgroundColor = online ? .systemGreen : .systemGray3
		cell.accessoryView = dot
	}

	deinit {
		listener?.remove()
		presenceListeners.values.forEach { $0.remove() }
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

	@objc private func didTapNew() {
		let alert = UIAlertController(title: "New Conversation", message: "Enter other user's UID for MVP", preferredStyle: .alert)
		alert.addTextField { $0.placeholder = "other user id" }
		alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
		alert.addAction(UIAlertAction(title: "Create", style: .default, handler: { [weak self] _ in
			guard let self = self, let other = alert.textFields?.first?.text, !other.isEmpty else { return }
			self.messaging.createConversation(with: other) { result in
				if case let .failure(error) = result { print("🔴 createConversation error: \(error)") }
			}
		}))
		present(alert, animated: true)
	}

	// MARK: - Table

	func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int { conversations.count }

	func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
		let c = conversations[indexPath.row]
		let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
		var config = UIListContentConfiguration.subtitleCell()
		config.text = c.title
		config.textProperties.font = .systemFont(ofSize: 17, weight: .semibold)
		config.textProperties.color = Theme.brandPrimary
		if let text = c.lastMessage { config.secondaryText = text }
		config.secondaryTextProperties.color = Theme.textMuted
		cell.contentConfiguration = config
		let current = Auth.auth().currentUser?.uid ?? ""
		let other = c.participants.first(where: { $0 != current }) ?? ""
		let online = userIdToOnline[other] ?? false
		applyPresence(on: cell, online: online)
		return cell
	}

	func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
		tableView.deselectRow(at: indexPath, animated: true)
		let convo = conversations[indexPath.row]
		let current = Auth.auth().currentUser?.uid ?? ""
		let other = convo.participants.first(where: { $0 != current }) ?? ""
		navigationController?.pushViewController(ChatViewController(conversationId: convo.id, otherUserId: other, chatTitle: convo.title), animated: true)
	}
}


