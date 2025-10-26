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
    private var userIdToAvatarImage: [String: UIImage] = [:]
    private var statusHandles: [String: DatabaseHandle] = [:]

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
        statusHandles.forEach { FirebaseService.realtimeDB.reference().removeObserver(withHandle: $0.value) }
        statusHandles.removeAll()
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
                let urlStr = (data["photoURL"] as? String) ?? (data["avatarUrl"] as? String)
                if let urlStr { self.userIdToAvatarURL[uid] = urlStr }
                print("🟦 [ConversationsVC] fetched photoURL uid=\(uid) url=\(urlStr ?? "nil")")
                if let urlStr, let url = URL(string: urlStr) {
					URLSession.shared.dataTask(with: url) { data, _, _ in
						if let d = data, let image = UIImage(data: d) {
                            print("🟩 [ConversationsVC] cached avatar uid=\(uid)")
							DispatchQueue.main.async { self.userIdToAvatarImage[uid] = image }
						}
					}.resume()
				}
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
        statusHandles.forEach { FirebaseService.realtimeDB.reference().removeObserver(withHandle: $0.value) }
        statusHandles.removeAll()

		let current = Auth.auth().currentUser?.uid ?? ""
		let participantIds = Set(conversations.flatMap { $0.participants }.filter { $0 != current })
		participantIds.forEach { uid in
			let ref = FirebaseService.realtimeDB.reference(withPath: "status/\(uid)")
			let handle = ref.observe(.value) { [weak self] snap in
				guard let self = self else { return }
				var online = false
				if let dict = snap.value as? [String: Any], let o = dict["online"] as? Bool {
					online = o
				}
				self.userIdToOnline[uid] = online
				// Update visible cells that include this uid (excluding current user)
				self.tableView.visibleCells.forEach { cell in
					if let indexPath = self.tableView.indexPath(for: cell) {
						let convo = self.conversations[indexPath.row]
						let others = convo.participants.filter { $0 != current }
						if others.contains(uid) {
							let anyOnline = others.contains(where: { self.userIdToOnline[$0] == true })
							self.applyPresence(on: cell, online: anyOnline)
						}
					}
				}
			}
			statusHandles[uid] = handle
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
		let sheet = UIAlertController(title: "New Conversation", message: nil, preferredStyle: .actionSheet)
		sheet.addAction(UIAlertAction(title: "One-on-one", style: .default, handler: { [weak self] _ in
			guard let self = self else { return }
			let alert = UIAlertController(title: "One-on-one", message: "Enter other user's UID", preferredStyle: .alert)
			alert.addTextField { $0.placeholder = "other user id" }
			alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
			alert.addAction(UIAlertAction(title: "Create", style: .default, handler: { [weak self] _ in
				guard let self = self, let other = alert.textFields?.first?.text, !other.isEmpty else { return }
				self.messaging.createConversation(with: other) { result in
					DispatchQueue.main.async {
						switch result {
						case .success(let convoId):
							self.navigationController?.pushViewController(ChatViewController(conversationId: convoId, otherUserId: other, chatTitle: "Chat"), animated: true)

						case .failure(let error):
							print("🔴 createConversation error: \(error)")
						}
					}
				}
			}))
			self.present(alert, animated: true)
		}))
		sheet.addAction(UIAlertAction(title: "Group (enter comma-separated UIDs)", style: .default, handler: { [weak self] _ in
			guard let self = self else { return }
			let alert = UIAlertController(title: "New Group", message: "Enter title and comma-separated participant UIDs", preferredStyle: .alert)
			alert.addTextField { $0.placeholder = "Title (e.g., European friends)" }
			alert.addTextField { $0.placeholder = "uids (uid1,uid2,uid3)" }
			alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
			alert.addAction(UIAlertAction(title: "Create", style: .default, handler: { [weak self] _ in
				guard let self = self else { return }
				let title = alert.textFields?.first?.text?.trimmingCharacters(in: .whitespacesAndNewlines)
				let raw = alert.textFields?.last?.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
				let ids = raw.split(separator: ",").map { String($0).trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
				guard let t = title, !t.isEmpty, !ids.isEmpty else { return }
				self.messaging.createGroupConversation(title: t, participantIds: ids, participantLanguages: [:]) { result in
					DispatchQueue.main.async {
						switch result {
						case .success(let convoId):
							self.navigationController?.pushViewController(ChatViewController(conversationId: convoId, otherUserId: "", chatTitle: t), animated: true)
						case .failure(let error):
							print("🔴 createGroupConversation error: \(error)")
						}
					}
				}
			}))
			self.present(alert, animated: true)
		}))
		sheet.addAction(UIAlertAction(title: "Cancel", style: .cancel))
		present(sheet, animated: true)
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
		_ = configuredCell(for: c, cell: cell)
		let others = c.participants.filter { $0 != current }
		let anyOnline = others.contains(where: { userIdToOnline[$0] == true })
		applyPresence(on: cell, online: anyOnline)
		return cell
	}

	func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
		tableView.deselectRow(at: indexPath, animated: true)
		let convo = conversations[indexPath.row]
		let current = Auth.auth().currentUser?.uid ?? ""
		let isGroup = (convo.type == "group")
		let other = isGroup ? "" : (convo.participants.first(where: { $0 != current }) ?? "")
		navigationController?.pushViewController(ChatViewController(conversationId: convo.id, otherUserId: other, chatTitle: convo.title), animated: true)
	}

    // Swipe actions: delete (1:1 soft hide) or leave (group)
    func tableView(_ tableView: UITableView, trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration? {
        let convo = conversations[indexPath.row]
        let isGroup = (convo.type == "group")
        let title = isGroup ? "Leave" : "Remove"
        let action = UIContextualAction(style: .destructive, title: title) { [weak self] _, _, completion in
            guard let self = self else { completion(false); return }
            self.messaging.deleteOrLeave(conversationId: convo.id) { result in
                DispatchQueue.main.async {
                    switch result {
                    case .success:
                        completion(true)
                    case .failure(let error):
                        print("🔴 [ConversationsVC] delete/leave failed: \(error)")
                        completion(false)
                    }
                }
            }
        }
        return UISwipeActionsConfiguration(actions: [action])
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
        if let composite = compositeAvatar(for: conversation.participants.filter { $0 != current }) {
            config.image = composite
            config.imageProperties.maximumSize = CGSize(width: 44, height: 44)
            config.imageProperties.reservedLayoutSize = CGSize(width: 44, height: 44)
            config.imageProperties.cornerRadius = 22
        } else {
			let other = conversation.participants.first(where: { $0 != current }) ?? ""
            if let cached = userIdToAvatarImage[other] {
                config.image = cached
                config.imageProperties.maximumSize = CGSize(width: 44, height: 44)
                config.imageProperties.reservedLayoutSize = CGSize(width: 44, height: 44)
                config.imageProperties.cornerRadius = 22
            } else if let urlStr = userIdToAvatarURL[other], let url = URL(string: urlStr) {
				URLSession.shared.dataTask(with: url) { data, _, _ in
					if let d = data, let image = UIImage(data: d) {
						DispatchQueue.main.async {
							var cfg = config
							cfg.image = image
                            cfg.imageProperties.maximumSize = CGSize(width: 44, height: 44)
                            cfg.imageProperties.reservedLayoutSize = CGSize(width: 44, height: 44)
                            cfg.imageProperties.cornerRadius = 22
							cell.contentConfiguration = cfg
                            self.userIdToAvatarImage[other] = image
						}
					}
				}.resume()
            } else {
                config.image = UIImage(systemName: "person.crop.circle")
                config.imageProperties.maximumSize = CGSize(width: 44, height: 44)
                config.imageProperties.reservedLayoutSize = CGSize(width: 44, height: 44)
                config.imageProperties.cornerRadius = 22
			}
		}
		cell.contentConfiguration = config
		return cell
	}

    private func compositeAvatar(for otherParticipantIds: [String]) -> UIImage? {
        let images: [UIImage] = otherParticipantIds.compactMap { userIdToAvatarImage[$0] }
        guard !images.isEmpty else { return nil }
        let canvasSize = CGSize(width: 44, height: 44)
        UIGraphicsBeginImageContextWithOptions(canvasSize, false, 0)
        defer { UIGraphicsEndImageContext() }
        let maxCount = min(3, images.count)
        let overlap: CGFloat = 10
        let thumb = CGSize(width: 28, height: 28)
        for i in 0..<maxCount {
            let img = circularThumbnail(from: images[i], size: thumb)
            let x = CGFloat(i) * (thumb.width - overlap)
            let y = canvasSize.height - thumb.height
            img.draw(in: CGRect(x: x, y: y, width: thumb.width, height: thumb.height))
        }
        return UIGraphicsGetImageFromCurrentImageContext()
    }

    private func circularThumbnail(from image: UIImage, size: CGSize) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { ctx in
            let rect = CGRect(origin: .zero, size: size)
            UIBezierPath(roundedRect: rect, cornerRadius: min(size.width, size.height)/2).addClip()
            // Aspect fill
            let imgSize = image.size
            let scale = max(size.width / imgSize.width, size.height / imgSize.height)
            let drawSize = CGSize(width: imgSize.width * scale, height: imgSize.height * scale)
            let drawOrigin = CGPoint(x: (size.width - drawSize.width)/2, y: (size.height - drawSize.height)/2)
            image.draw(in: CGRect(origin: drawOrigin, size: drawSize))
        }
    }
}


