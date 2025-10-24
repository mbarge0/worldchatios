import UIKit
import AVFoundation
import FirebaseAuth
import FirebaseFirestore
import FirebaseDatabase

final class ChatViewController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout, UITextViewDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
	private let conversationId: String
	private let otherUserId: String
	private let chatTitle: String?
	private let messaging = MessagingService()
	private let profileService = ProfileService()
	private let sendQueue = SendQueueService()

	private var messages: [Message] = []
	private var listener: ListenerRegistration?
	private var convoListener: ListenerRegistration?
	private var typingHandle: DatabaseHandle?
	private var presenceHandle: DatabaseHandle?
	private var preferredLang: String = "en"
	private var participantLanguages: [String: String] = [:]

	private lazy var collectionView: UICollectionView = {
		let layout = UICollectionViewFlowLayout()
		layout.estimatedItemSize = UICollectionViewFlowLayout.automaticSize
		layout.minimumLineSpacing = 8
		layout.sectionInset = UIEdgeInsets(top: 8, left: 8, bottom: 8, right: 8)
		let cv = UICollectionView(frame: .zero, collectionViewLayout: layout)
		cv.backgroundColor = .systemBackground
		cv.alwaysBounceVertical = true
		cv.keyboardDismissMode = .interactive
		cv.dataSource = self
		cv.delegate = self
		cv.register(MessageCell.self, forCellWithReuseIdentifier: "cell")
		cv.translatesAutoresizingMaskIntoConstraints = false
		return cv
	}()

	private let inputContainer = UIView()
	private let inputTextView = UITextView()
	private let sendButton = UIButton(type: .system)
	private let attachButton = UIButton(type: .system)
	private let typingLabel = UILabel()
	private let presenceDot = UIView()
	private let aiButton = UIButton(type: .system)
	private let smartRepliesScroll = UIScrollView()
	private let smartRepliesStack = UIStackView()
	private let aiService = AIService()
	private let toneControl = UISegmentedControl(items: ["Casual", "Neutral", "Formal"])

	init(conversationId: String, otherUserId: String, chatTitle: String?) {
		self.conversationId = conversationId
		self.otherUserId = otherUserId
		self.chatTitle = chatTitle
		super.init(nibName: nil, bundle: nil)
	}

	required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

	override func viewDidLoad() {
		super.viewDidLoad()
		view.backgroundColor = .systemBackground
		title = chatTitle ?? "Chat"

		setupViews()
		attachMessageAndTypingListeners()
		sendQueue.start()

		// Load current user's preferred language (first selected language or fallback)
		if let uid = FirebaseService.auth.currentUser?.uid {
			Task { [weak self] in
				guard let self = self else { return }
				if let profile = try? await self.profileService.fetchProfile(uid: uid), let first = profile.languages.first, !first.isEmpty {
					self.preferredLang = first
					DispatchQueue.main.async { self.collectionView.reloadData() }
				}
			}
		}
		// Listen for conversation participantLanguages
		convoListener?.remove()
		convoListener = FirebaseService.firestore.collection("conversations").document(conversationId).addSnapshotListener { [weak self] snapshot, error in
			guard let self = self else { return }
			if let data = snapshot?.data(), let map = data["participantLanguages"] as? [String: String] {
				self.participantLanguages = map
				print("🧭 [ChatVC] participantLanguages updated: \(map)")
				self.collectionView.reloadData()
			}
		}
	}

	override func viewWillAppear(_ animated: Bool) {
		super.viewWillAppear(animated)
		attachPresenceListener()
	}

	private func setupViews() {
		view.addSubview(collectionView)
		inputContainer.translatesAutoresizingMaskIntoConstraints = false
		inputTextView.translatesAutoresizingMaskIntoConstraints = false
		sendButton.translatesAutoresizingMaskIntoConstraints = false
		attachButton.translatesAutoresizingMaskIntoConstraints = false
		typingLabel.translatesAutoresizingMaskIntoConstraints = false
		presenceDot.translatesAutoresizingMaskIntoConstraints = false

		inputContainer.backgroundColor = .secondarySystemBackground
		inputTextView.isScrollEnabled = false
		inputTextView.font = .systemFont(ofSize: 17)
		inputTextView.delegate = self
		inputTextView.text = ""
		inputTextView.layer.cornerRadius = 14
		inputTextView.backgroundColor = .systemBackground
		inputTextView.textContainerInset = UIEdgeInsets(top: 8, left: 10, bottom: 8, right: 10)
		sendButton.setTitle("Send", for: .normal)
		sendButton.isEnabled = false
		sendButton.addTarget(self, action: #selector(didTapSend), for: .touchUpInside)
		attachButton.setTitle("＋", for: .normal)
		attachButton.addTarget(self, action: #selector(didTapAttach), for: .touchUpInside)
		typingLabel.text = ""
		typingLabel.font = .systemFont(ofSize: 13)
		typingLabel.textColor = .secondaryLabel
		presenceDot.backgroundColor = .systemGray
		presenceDot.layer.cornerRadius = 4

		view.addSubview(inputContainer)
		inputContainer.addSubview(attachButton)
		inputContainer.addSubview(inputTextView)
		inputContainer.addSubview(sendButton)
		view.addSubview(smartRepliesScroll)
		smartRepliesScroll.translatesAutoresizingMaskIntoConstraints = false
		smartRepliesScroll.showsHorizontalScrollIndicator = false
		smartRepliesStack.axis = .horizontal
		smartRepliesStack.spacing = 8
		smartRepliesStack.alignment = .fill
		smartRepliesStack.distribution = .fillProportionally
		smartRepliesStack.translatesAutoresizingMaskIntoConstraints = false
		smartRepliesScroll.addSubview(smartRepliesStack)
		aiButton.translatesAutoresizingMaskIntoConstraints = false
		aiButton.backgroundColor = Theme.gold
		aiButton.tintColor = Theme.textPrimary
		aiButton.setTitle("AI", for: .normal)
		aiButton.layer.cornerRadius = 22
		aiButton.addTarget(self, action: #selector(didTapAI), for: .touchUpInside)
		aiButton.accessibilityLabel = "Open AI Assistant"
		view.addSubview(aiButton)
		toneControl.selectedSegmentIndex = 1
		toneControl.translatesAutoresizingMaskIntoConstraints = false
		toneControl.addTarget(self, action: #selector(toneChanged), for: .valueChanged)
		view.addSubview(toneControl)
		view.addSubview(typingLabel)
		let presenceItem = UIBarButtonItem(customView: presenceDot)
		navigationItem.rightBarButtonItem = presenceItem

		let guide = view.safeAreaLayoutGuide
		NSLayoutConstraint.activate([
			collectionView.topAnchor.constraint(equalTo: guide.topAnchor),
			collectionView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
			collectionView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
			collectionView.bottomAnchor.constraint(equalTo: smartRepliesScroll.topAnchor),

			smartRepliesScroll.leadingAnchor.constraint(equalTo: view.leadingAnchor),
			smartRepliesScroll.trailingAnchor.constraint(equalTo: view.trailingAnchor),
			smartRepliesScroll.bottomAnchor.constraint(equalTo: inputContainer.topAnchor),
			smartRepliesScroll.heightAnchor.constraint(equalToConstant: 44),
			smartRepliesStack.leadingAnchor.constraint(equalTo: smartRepliesScroll.leadingAnchor, constant: 12),
			smartRepliesStack.trailingAnchor.constraint(lessThanOrEqualTo: smartRepliesScroll.trailingAnchor, constant: -12),
			smartRepliesStack.topAnchor.constraint(equalTo: smartRepliesScroll.topAnchor),
			smartRepliesStack.bottomAnchor.constraint(equalTo: smartRepliesScroll.bottomAnchor),

			inputContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor),
			inputContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor),
			inputContainer.bottomAnchor.constraint(equalTo: guide.bottomAnchor),

			attachButton.leadingAnchor.constraint(equalTo: inputContainer.leadingAnchor, constant: 10),
			attachButton.bottomAnchor.constraint(equalTo: inputContainer.bottomAnchor, constant: -10),
			attachButton.widthAnchor.constraint(equalToConstant: 32),
			attachButton.heightAnchor.constraint(equalToConstant: 32),

			inputTextView.topAnchor.constraint(equalTo: inputContainer.topAnchor, constant: 8),
			inputTextView.leadingAnchor.constraint(equalTo: attachButton.trailingAnchor, constant: 8),
			inputTextView.trailingAnchor.constraint(equalTo: sendButton.leadingAnchor, constant: -8),
			inputTextView.bottomAnchor.constraint(equalTo: inputContainer.bottomAnchor, constant: -8),

			sendButton.trailingAnchor.constraint(equalTo: inputContainer.trailingAnchor, constant: -12),
			sendButton.bottomAnchor.constraint(equalTo: inputContainer.bottomAnchor, constant: -10),
			sendButton.widthAnchor.constraint(equalToConstant: 64),
			sendButton.heightAnchor.constraint(equalToConstant: 32),

			typingLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
			typingLabel.bottomAnchor.constraint(equalTo: inputContainer.topAnchor, constant: -4),

			presenceDot.widthAnchor.constraint(equalToConstant: 8),
			presenceDot.heightAnchor.constraint(equalToConstant: 8),

			aiButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
			aiButton.bottomAnchor.constraint(equalTo: smartRepliesScroll.topAnchor, constant: -8),
			aiButton.widthAnchor.constraint(equalToConstant: 44),
			aiButton.heightAnchor.constraint(equalToConstant: 44),

			toneControl.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 12),
			toneControl.centerYAnchor.constraint(equalTo: aiButton.centerYAnchor)
		])
	}

	private func loadSmartReplies() {
		let tone: String = {
			switch self.toneControl.selectedSegmentIndex {
			case 0: return "casual"
			case 2: return "formal"
			default: return "neutral"
			}
		}()
		Task { [weak self] in
			guard let self = self else { return }
			let suggestions: [SmartReply]
			do {
				suggestions = try await self.aiService.generateSmartReplies(conversationId: self.conversationId, tone: tone)
			} catch {
				DispatchQueue.main.async {
					self.smartRepliesStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
					let label = UILabel()
					label.text = "Suggestions unavailable"
					label.font = .systemFont(ofSize: 13)
					label.textColor = .secondaryLabel
					self.smartRepliesStack.addArrangedSubview(label)
				}
				return
			}
			DispatchQueue.main.async {
				self.smartRepliesStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
				for s in suggestions {
					let pill = UIButton(type: .system)
					pill.setTitle("\(s.translated)", for: .normal)
					pill.titleLabel?.font = .systemFont(ofSize: 15, weight: .semibold)
					pill.setTitleColor(Theme.textPrimary, for: .normal)
					pill.backgroundColor = Theme.brandSecondary.withAlphaComponent(0.4)
					pill.contentEdgeInsets = UIEdgeInsets(top: 10, left: 12, bottom: 10, right: 12)
					pill.layer.cornerRadius = 16
					pill.isAccessibilityElement = true
					pill.accessibilityLabel = "Smart reply suggestion: \(s.translated)"
					pill.addAction(UIAction(handler: { [weak self] _ in
						self?.inputTextView.text = s.original
						if let tv = self?.inputTextView { self?.textViewDidChange(tv) }
					}), for: .touchUpInside)
					self.smartRepliesStack.addArrangedSubview(pill)
				}
			}
		}
	}

	private func attachMessageAndTypingListeners() {
		listener?.remove()
		listener = messaging.listenMessages(conversationId: conversationId) { [weak self] msgs in
			guard let self = self else { return }
			let countWithTranslations = msgs.filter { ($0.translations?.isEmpty == false) }.count
			print("🟢 [ChatVC] messages updated: total=\(msgs.count), withTranslations=\(countWithTranslations)")
			DispatchQueue.main.async {
				self.messages = msgs
				self.collectionView.reloadData()
				if self.messages.count > 0 {
					let last = IndexPath(item: self.messages.count - 1, section: 0)
					self.collectionView.scrollToItem(at: last, at: .bottom, animated: true)
				}
			}
		}
		// Mark messages from the other user as read when opening/refreshing
		if let current = FirebaseService.auth.currentUser?.uid {
			messaging.markAllAsRead(conversationId: conversationId, otherUserId: otherUserId, currentUserId: current)
		}
		if let typingHandle = typingHandle {
			FirebaseService.realtimeDB.reference().removeObserver(withHandle: typingHandle)
		}
		typingHandle = messaging.listenTyping(conversationId: conversationId, otherUserId: otherUserId) { [weak self] isTyping in
			self?.typingLabel.text = isTyping ? "Typing…" : ""
		}
	}

	@objc private func didTapAI() {
		let alert = UIAlertController(title: "AI Assistant", message: "Ask a question about this conversation.", preferredStyle: .alert)
		alert.addTextField { tf in tf.placeholder = "What does 'stai' mean?" }
		alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
		alert.addAction(UIAlertAction(title: "Ask", style: .default, handler: { [weak self] _ in
			guard let self = self else { return }
			let q = alert.textFields?.first?.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
			guard !q.isEmpty else { return }
			Task { [weak self] in
				guard let self = self else { return }
				do {
					let resp = try await self.aiService.askAI(conversationId: self.conversationId, question: q)
					DispatchQueue.main.async {
						let a = UIAlertController(title: "Answer", message: resp.answer, preferredStyle: .alert)
						a.addAction(UIAlertAction(title: "OK", style: .default))
						self.present(a, animated: true)
					}
				} catch {
					DispatchQueue.main.async {
						let a = UIAlertController(title: "AI Unavailable", message: error.localizedDescription, preferredStyle: .alert)
						a.addAction(UIAlertAction(title: "OK", style: .default))
						self.present(a, animated: true)
					}
				}
			}
		}))
		present(alert, animated: true)
	}

	@objc private func toneChanged() {
		loadSmartReplies()
	}

	override func viewDidAppear(_ animated: Bool) {
		super.viewDidAppear(animated)
		loadSmartReplies()
	}

	// Context menu: long-press message -> Ask AI (explain)
	func collectionView(_ collectionView: UICollectionView, contextMenuConfigurationForItemAt indexPath: IndexPath, point: CGPoint) -> UIContextMenuConfiguration? {
		guard indexPath.item < messages.count else { return nil }
		let message = messages[indexPath.item]
		return UIContextMenuConfiguration(identifier: nil, previewProvider: nil) { _ in
			let explain = UIAction(title: "Ask AI (explain)", image: UIImage(systemName: "sparkles")) { [weak self] _ in
				guard let self = self else { return }
				let q = "Explain: \(message.text)"
                Task {
                    do {
                        let response = try await self.aiService.askAI(conversationId: self.conversationId, question: q)
                        let alert = UIAlertController(title: "Explanation", message: response.answer, preferredStyle: .alert)
                        alert.addAction(UIAlertAction(title: "OK", style: .default))
                        self.present(alert, animated: true)
                    } catch {
                        let alert = UIAlertController(title: "Explanation", message: "AI temporarily unavailable", preferredStyle: .alert)
                        alert.addAction(UIAlertAction(title: "OK", style: .default))
                        self.present(alert, animated: true)
                    }
                }
			}
			return UIMenu(title: "", children: [explain])
		}
	}

	private func attachPresenceListener() {
		if let presenceHandle = presenceHandle {
			FirebaseService.realtimeDB.reference().removeObserver(withHandle: presenceHandle)
		}
		presenceHandle = messaging.listenPresence(userId: otherUserId) { [weak self] status in
			self?.presenceDot.backgroundColor = (status == "online") ? .systemGreen : .systemGray
		}
	}

	deinit {
		listener?.remove()
		if let presenceHandle = presenceHandle {
			FirebaseService.realtimeDB.reference().removeObserver(withHandle: presenceHandle)
		}
		if let typingHandle = typingHandle {
			FirebaseService.realtimeDB.reference().removeObserver(withHandle: typingHandle)
		}
		sendQueue.stop()
	}

	// MARK: - Actions

	@objc private func didTapSend() {
		let text = inputTextView.text.trimmingCharacters(in: .whitespacesAndNewlines)
		guard !text.isEmpty else { return }
		sendButton.isEnabled = false
		sendQueue.stage(conversationId: conversationId, text: text)
		DispatchQueue.main.async { [weak self] in
			self?.inputTextView.text = ""
			self?.sendButton.isEnabled = false
		}
	}

	@objc private func didTapAttach() {
		let picker = UIImagePickerController()
		picker.delegate = self
		picker.sourceType = .photoLibrary
		present(picker, animated: true)
	}

	func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
		picker.dismiss(animated: true)
		if let image = info[.originalImage] as? UIImage, let data = image.jpegData(compressionQuality: 0.8) {
			MessagingMedia.uploadImage(conversationId: conversationId, data: data) { result in
				if case let .failure(error) = result { print("🔴 [ChatVC] image upload error: \(error)") }
			}
		}
	}

	func textViewDidChange(_ textView: UITextView) {
		let text = textView.text.trimmingCharacters(in: .whitespacesAndNewlines)
		sendButton.isEnabled = !text.isEmpty
		messaging.setTyping(conversationId: conversationId, isTyping: !text.isEmpty)
	}

	func textViewDidBeginEditing(_ textView: UITextView) {
		// Prefetch smart replies when the composer gains focus
		loadSmartReplies()
	}

	// MARK: - Data Source

	func numberOfSections(in collectionView: UICollectionView) -> Int { 1 }

	func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
		max(0, messages.count)
	}

    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
		let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "cell", for: indexPath) as! MessageCell
		if indexPath.item < messages.count {
			let message = messages[indexPath.item]
			let currentUid = FirebaseService.auth.currentUser?.uid ?? ""
			let isOutgoing = (message.senderId == currentUid)
			let usedLang = isOutgoing
				? (participantLanguages[otherUserId] ?? preferredLang)
				: (participantLanguages[currentUid] ?? preferredLang)
            cell.configure(with: message, translationLang: usedLang, otherUserId: otherUserId)
		} else {
			let fallback = Message(id: UUID().uuidString, senderId: FirebaseService.auth.currentUser?.uid ?? "", text: "", timestamp: Date(), status: "sent", translations: nil, readBy: [])
            cell.configure(with: fallback, translationLang: preferredLang, otherUserId: otherUserId)
		}
		return cell
	}

    // MARK: - Collection sizing (safe heights)

    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        let maxWidth = collectionView.bounds.width * 0.75
		let message = (indexPath.item < messages.count) ? messages[indexPath.item] : Message(id: "_", senderId: "_", text: " ", timestamp: Date(), status: "sent", translations: nil, readBy: [])
        let text = (message.text.isEmpty ? " " : message.text) as NSString
        let attributes: [NSAttributedString.Key: Any] = [.font: UIFont.systemFont(ofSize: 17)]
        let bounding = text.boundingRect(with: CGSize(width: maxWidth - 24 - 24, height: CGFloat.greatestFiniteMagnitude),
                                         options: [.usesLineFragmentOrigin, .usesFontLeading],
                                         attributes: attributes,
                                         context: nil)
		let currentUid = FirebaseService.auth.currentUser?.uid ?? ""
		let isOutgoing = (message.senderId == currentUid)
		let usedLang = isOutgoing
			? (participantLanguages[otherUserId] ?? preferredLang)
			: (participantLanguages[currentUid] ?? preferredLang)
		let translation = (message.translations?[usedLang] ?? "") as NSString
        let translationBounding = translation.boundingRect(with: CGSize(width: maxWidth - 24 - 24, height: CGFloat.greatestFiniteMagnitude),
                                                           options: [.usesLineFragmentOrigin, .usesFontLeading],
                                                           attributes: [.font: UIFont.systemFont(ofSize: 14)],
                                                           context: nil)
        let baseHeights: CGFloat = 10 + 6 + 6 + 8
        let height = max(44, ceil(bounding.height) + ceil(translationBounding.height) + baseHeights)
        return CGSize(width: collectionView.bounds.width, height: height.isFinite ? height : 44)
    }
}

final class MessageCell: UICollectionViewCell {
	private let avatarView = UIImageView()
	private let bubble = UIView()
	private let label = UILabel()
	private let translationLabel = UILabel()
	private let sublabel = UILabel() // receipts
	private let imageView = UIImageView()
    private let playButton = UIButton(type: .system)
    private let speechSynth = AVSpeechSynthesizer()
	private var leadingConstraint: NSLayoutConstraint!
	private var trailingConstraint: NSLayoutConstraint!
	private var maxWidthConstraint: NSLayoutConstraint!
    private var trailingPlayConstraint: NSLayoutConstraint!
    private var messageForPlayback: Message?
    private var playbackLang: String = "en"
    private var otherUserId: String = ""

	override init(frame: CGRect) {
		super.init(frame: frame)
		contentView.addSubview(avatarView)
		avatarView.translatesAutoresizingMaskIntoConstraints = false
		avatarView.layer.cornerRadius = 14
		avatarView.clipsToBounds = true
		avatarView.backgroundColor = .secondarySystemBackground
		avatarView.isHidden = true

		contentView.addSubview(bubble)
		bubble.translatesAutoresizingMaskIntoConstraints = false
		bubble.layer.cornerRadius = 16
		label.numberOfLines = 0
        translationLabel.numberOfLines = 0
        translationLabel.font = .systemFont(ofSize: 14)
        translationLabel.textColor = .secondaryLabel
		sublabel.font = .systemFont(ofSize: 12)
		sublabel.textColor = Theme.textMuted
		imageView.contentMode = .scaleAspectFill
		imageView.clipsToBounds = true
		imageView.layer.cornerRadius = 10
		label.translatesAutoresizingMaskIntoConstraints = false
		translationLabel.translatesAutoresizingMaskIntoConstraints = false
		sublabel.translatesAutoresizingMaskIntoConstraints = false
		imageView.translatesAutoresizingMaskIntoConstraints = false
        playButton.translatesAutoresizingMaskIntoConstraints = false
        playButton.setImage(UIImage(systemName: "speaker.wave.2.fill"), for: .normal)
        playButton.tintColor = .secondaryLabel
        playButton.alpha = 0.9
        playButton.addTarget(self, action: #selector(didTapPlay), for: .touchUpInside)
		bubble.addSubview(label)
		bubble.addSubview(translationLabel)
		bubble.addSubview(imageView)
		bubble.addSubview(sublabel)
        contentView.addSubview(playButton)

		leadingConstraint = bubble.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 40)
		trailingConstraint = bubble.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16)
		maxWidthConstraint = bubble.widthAnchor.constraint(lessThanOrEqualToConstant: 280)

		NSLayoutConstraint.activate([
			avatarView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 8),
			avatarView.bottomAnchor.constraint(equalTo: bubble.bottomAnchor),
			avatarView.widthAnchor.constraint(equalToConstant: 28),
			avatarView.heightAnchor.constraint(equalToConstant: 28),

			leadingConstraint!, trailingConstraint!, maxWidthConstraint!,
			bubble.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 4),
			bubble.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -4),
            label.topAnchor.constraint(equalTo: bubble.topAnchor, constant: 10),
            label.leadingAnchor.constraint(equalTo: bubble.leadingAnchor, constant: 12),
            label.trailingAnchor.constraint(equalTo: bubble.trailingAnchor, constant: -12),
            translationLabel.topAnchor.constraint(equalTo: label.bottomAnchor, constant: 6),
			translationLabel.leadingAnchor.constraint(equalTo: bubble.leadingAnchor, constant: 12),
			translationLabel.trailingAnchor.constraint(equalTo: bubble.trailingAnchor, constant: -12),
            imageView.topAnchor.constraint(equalTo: translationLabel.bottomAnchor, constant: 6),
            imageView.leadingAnchor.constraint(equalTo: bubble.leadingAnchor, constant: 12),
            imageView.trailingAnchor.constraint(lessThanOrEqualTo: bubble.trailingAnchor, constant: -12),
            imageView.heightAnchor.constraint(equalToConstant: 160),
            sublabel.topAnchor.constraint(equalTo: imageView.bottomAnchor, constant: 6),
			sublabel.leadingAnchor.constraint(equalTo: bubble.leadingAnchor, constant: 12),
			sublabel.trailingAnchor.constraint(equalTo: bubble.trailingAnchor, constant: -12),
            sublabel.bottomAnchor.constraint(equalTo: bubble.bottomAnchor, constant: -8),

            // Play button sits to the trailing side of bubble
            playButton.centerYAnchor.constraint(equalTo: bubble.centerYAnchor),
            playButton.leadingAnchor.constraint(equalTo: bubble.trailingAnchor, constant: 6),
            playButton.widthAnchor.constraint(equalToConstant: 24),
            playButton.heightAnchor.constraint(equalToConstant: 24)
		])
	}

	required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    func configure(with message: Message, translationLang: String, otherUserId: String) {
		label.text = message.text.isEmpty ? "" : message.text
		if let t = message.translations?[translationLang], !t.isEmpty {
            translationLabel.text = t
            translationLabel.isHidden = false
        } else {
            translationLabel.text = "⟲ translation pending"
            translationLabel.isHidden = false
        }
		let currentUid = FirebaseService.auth.currentUser?.uid ?? ""
		let isOutgoing = (message.senderId == currentUid)
		print("🧩 [MessageCell] id=\(message.id) usedLang=\(translationLang) outgoing=\(isOutgoing) hasTrans=\(message.translations?[translationLang] != nil)")
        // Delivery/read receipts with double check when read
        let otherId = otherUserId
        let isReadByOther = message.readBy.contains(otherId)
        if isReadByOther {
            let check1 = "✓"
            let check2 = "✓"
            let combined = "\(check1)\(check2)"
            sublabel.text = combined
            sublabel.textColor = .systemRed
        } else {
            switch message.status {
            case "sending": sublabel.text = "…"; sublabel.textColor = Theme.incomingMuted
            case "sent": sublabel.text = "✓"; sublabel.textColor = Theme.incomingMuted
            case "delivered": sublabel.text = "✓✓"; sublabel.textColor = Theme.incomingMuted
            case "read": sublabel.text = "✓✓"; sublabel.textColor = Theme.receiptRead
            default: sublabel.text = ""; sublabel.textColor = Theme.incomingMuted
            }
        }

        // reuse isOutgoing defined above
		bubble.backgroundColor = isOutgoing ? Theme.brandPrimary : Theme.gold
		label.textColor = isOutgoing ? Theme.outgoingText : Theme.textPrimary
		translationLabel.textColor = isOutgoing ? Theme.outgoingMuted : Theme.textMuted
		sublabel.textColor = isOutgoing ? Theme.outgoingMuted : Theme.textMuted
		bubble.layer.maskedCorners = isOutgoing ? [.layerMinXMinYCorner, .layerMinXMaxYCorner, .layerMaxXMinYCorner] : [.layerMaxXMinYCorner, .layerMaxXMaxYCorner, .layerMinXMinYCorner]
		leadingConstraint.isActive = !isOutgoing
		trailingConstraint.isActive = isOutgoing
		avatarView.isHidden = isOutgoing
        // Store for playback
        self.messageForPlayback = message
        self.playbackLang = translationLang
        self.otherUserId = otherUserId
        playButton.isHidden = (message.translations?[translationLang]?.isEmpty ?? true)
	}

    @objc private func didTapPlay() {
        guard let message = messageForPlayback else { return }
        let text = message.translations?[playbackLang] ?? ""
        guard !text.isEmpty else { return }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: playbackLang)
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate
        UIView.animate(withDuration: 0.12, animations: { self.playButton.alpha = 0.4 }) { _ in
            UIView.animate(withDuration: 0.2) { self.playButton.alpha = 0.9 }
        }
        speechSynth.stopSpeaking(at: .immediate)
        speechSynth.speak(utterance)
    }

	func setAvatarURL(_ urlString: String?) {
		guard let s = urlString, let url = URL(string: s) else { avatarView.isHidden = true; return }
		URLSession.shared.dataTask(with: url) { data, _, _ in
			if let d = data, let img = UIImage(data: d) { DispatchQueue.main.async { self.avatarView.image = img; self.avatarView.isHidden = false } }
		}.resume()
	}
}
