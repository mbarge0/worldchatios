import UIKit
import FirebaseAuth
import FirebaseFirestore
import FirebaseDatabase

final class ConversationsViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {
	private let tableView = UITableView(frame: .zero, style: .plain)
	private let emptyLabel = UILabel()
	private let messaging = MessagingService()
	private var conversations: [Conversation] = []
	private var listener: ListenerRegistration?
	private var presenceListeners: [String: ListenerRegistration] = [:]
	private var userIdToOnline: [String: Bool] = [:]
	private var typingHandles: [String: DatabaseHandle] = [:]
	private var conversationIdToTyping: [String: Bool] = [:]
	private var userIdToAvatarURL: [String: String] = [:]

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

		let menu = UIBarButtonItem(image: UIImage(systemName: "line.3.horizontal"), style: .plain, target: self, action: #selector(openMenu))
		navigationItem.leftBarButtonItem = menu
		navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(didTapNew))

		attachConversationsListener()
	}

	override func viewWillAppear(_ animated: Bool) {
		super.viewWillAppear(animated)
		attachPresenceListeners()
	}

	override func viewWillDisappear(_ animated: Bool) {
		super.viewWillDisappear(animated)
		presenceListeners.values.forEach { $0.remove() }
		presenceListeners.removeAll()
		typingHandles.forEach { FirebaseService.realtimeDB.reference().removeObserver(withHandle: $0.value) }
		typingHandles.removeAll()
	}

	private func attachConversationsListener() {
		guard let uid = Auth.auth().currentUser?.uid else { return }
		listener = messaging.listenConversations(for: uid) { [weak self] items in
			guard let self = self else { return }
			self.conversations = items
			self.tableView.reloadData()
			self.emptyLabel.isHidden = !items.isEmpty
			self.attachPresenceListeners()
		}
	}

	private func fetchAvatarsForParticipants() {
		let current = Auth.auth().currentUser?.uid ?? ""
		let participantIds = Set(conversations.flatMap { $0.participants }.filter { $0 != current })
		participantIds.forEach { uid in
			FirebaseService.firestore.collection("users").document(uid).getDocument { [weak self] snap, _ in
				guard let self = self, let data = snap?.data() else { return }
				if let url = data["avatarUrl"] as? String { self.userIdToAvatarURL[uid] = url }
			}
		}
	}

	private func attachPresenceListeners() {
		presenceListeners.values.forEach { $0.remove() }
		presenceListeners.removeAll()
		userIdToOnline.removeAll()
		// typing
		typingHandles.forEach { FirebaseService.realtimeDB.reference().removeObserver(withHandle: $0.value) }
		typingHandles.removeAll()
		conversationIdToTyping.removeAll()

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

		// Typing for each conversation: listen to other user's node
		conversations.forEach { convo in
			let other = convo.participants.first(where: { $0 != current }) ?? ""
			let ref = FirebaseService.realtimeDB.reference(withPath: "typingIndicators/\(convo.id)/\(other)")
			let handle = ref.observe(.value) { [weak self] snap in
				guard let self = self else { return }
				var isTyping = false
				if let dict = snap.value as? [String: Any], let ts = dict["ts"] as? TimeInterval {
					let now = Date().timeIntervalSince1970 * 1000.0
					isTyping = (now - ts) < 1500
				}
				self.conversationIdToTyping[convo.id] = isTyping
				if let visible = self.tableView.indexPathsForVisibleRows?.first(where: { self.conversations[$0.row].id == convo.id }) {
					self.tableView.reloadRows(at: [visible], with: .none)
				}
			}
			typingHandles[convo.id] = handle
		}
		fetchAvatarsForParticipants()
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

	@objc private func openMenu() {
		let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
		alert.addAction(UIAlertAction(title: "Profile", style: .default, handler: { [weak self] _ in
			self?.navigationController?.pushViewController(ProfileViewController(), animated: true)
		}))
		alert.addAction(UIAlertAction(title: "Sign Out", style: .destructive, handler: { [weak self] _ in
			self?.didTapSignOut()
		}))
		alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
		present(alert, animated: true)
	}

	// MARK: - Table

	func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int { conversations.count }

	func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
		let c = conversations[indexPath.row]
		let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
		let current = Auth.auth().currentUser?.uid ?? ""
		let other = c.participants.first(where: { $0 != current }) ?? ""
		_ = configuredCell(for: c, cell: cell)
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

	private func configuredCell(for conversation: Conversation, cell: UITableViewCell) -> UITableViewCell {
		var config = UIListContentConfiguration.subtitleCell()
		config.text = conversation.title
		config.textProperties.font = .systemFont(ofSize: 17, weight: .semibold)
		config.textProperties.color = Theme.brandPrimary
		if conversationIdToTyping[conversation.id] == true {
			config.secondaryText = "Typing…"
			config.secondaryTextProperties.color = Theme.textMuted
		} else if let text = conversation.lastMessage {
			config.secondaryText = text
			config.secondaryTextProperties.color = Theme.textMuted
		}
		let current = Auth.auth().currentUser?.uid ?? ""
		let other = conversation.participants.first(where: { $0 != current }) ?? ""
		if let urlStr = userIdToAvatarURL[other], let url = URL(string: urlStr) {
			// Simple async load
			URLSession.shared.dataTask(with: url) { data, _, _ in
				if let d = data, let image = UIImage(data: d) {
					DispatchQueue.main.async {
						var cfg = config
						cfg.image = image
						cfg.imageProperties.cornerRadius = 22
						cell.contentConfiguration = cfg
					}
				}
			}.resume()
		}
		cell.contentConfiguration = config
		return cell
	}
}


