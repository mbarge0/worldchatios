import UIKit
import FirebaseAuth

final class ProfileViewController: UIViewController, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
	private let nameField = UITextField()
	private let avatarView = UIImageView()
	private let saveButton = UIButton(type: .system)
	private let profileService = ProfileService()
	private let imageProcessor = ImageProcessingService()
	private var pendingAvatarData: Data?
    private let languageField = UITextField()

	override func viewDidLoad() {
		super.viewDidLoad()
		title = "Profile"
		view.backgroundColor = .systemBackground

		nameField.placeholder = "Display Name"
		nameField.borderStyle = .roundedRect
        languageField.placeholder = "Language (e.g., en)"
        languageField.borderStyle = .roundedRect
		avatarView.contentMode = .scaleAspectFill
		avatarView.layer.cornerRadius = 40
		avatarView.clipsToBounds = true
		avatarView.backgroundColor = .secondarySystemBackground
		avatarView.isUserInteractionEnabled = true
		avatarView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTapAvatar)))
		saveButton.setTitle("Save", for: .normal)
		saveButton.addTarget(self, action: #selector(saveTapped), for: .touchUpInside)

        [nameField, languageField, avatarView, saveButton].forEach { view.addSubview($0); $0.translatesAutoresizingMaskIntoConstraints = false }

		NSLayoutConstraint.activate([
			avatarView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 24),
			avatarView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
			avatarView.widthAnchor.constraint(equalToConstant: 80),
			avatarView.heightAnchor.constraint(equalToConstant: 80),
			nameField.topAnchor.constraint(equalTo: avatarView.bottomAnchor, constant: 16),
			nameField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
			nameField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
            languageField.topAnchor.constraint(equalTo: nameField.bottomAnchor, constant: 12),
            languageField.leadingAnchor.constraint(equalTo: nameField.leadingAnchor),
            languageField.trailingAnchor.constraint(equalTo: nameField.trailingAnchor),
            saveButton.topAnchor.constraint(equalTo: languageField.bottomAnchor, constant: 20),
			saveButton.centerXAnchor.constraint(equalTo: view.centerXAnchor)
		])

		Task { await loadProfile() }
	}

	private func loadProfile() async {
		guard let uid = Auth.auth().currentUser?.uid else { return }
		do {
            print("🟦 [ProfileVC] loadProfile uid=\(uid)")
			let fetched = try await profileService.fetchProfile(uid: uid)
			guard let profile = fetched else { return }
            DispatchQueue.main.async {
                self.nameField.text = profile.displayName
                self.languageField.text = profile.language
                if let urlStr = profile.avatarUrl, let url = URL(string: urlStr) {
                    print("🟦 [ProfileVC] loading photo from \(urlStr)")
                    URLSession.shared.dataTask(with: url) { data, _, _ in
                        if let d = data, let img = UIImage(data: d) {
                            DispatchQueue.main.async { self.avatarView.image = img }
                        } else {
                            DispatchQueue.main.async { self.avatarView.image = UIImage(systemName: "person.crop.circle.fill") }
                        }
                    }.resume()
                } else {
                    self.avatarView.image = UIImage(systemName: "person.crop.circle.fill")
                }
            }
		} catch {
			print("🔴 [ProfileVC] loadProfile error: \(error)")
		}
	}

	@objc private func didTapAvatar() {
		let picker = UIImagePickerController()
		picker.delegate = self
		picker.sourceType = .photoLibrary
		present(picker, animated: true)
	}

	func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
		picker.dismiss(animated: true)
		if let image = info[.originalImage] as? UIImage, let raw = image.jpegData(compressionQuality: 0.9) {
            print("🟦 [ProfileVC] image selected bytes=\(raw.count)")
			// Display immediately
			avatarView.image = image
			// Process and hold for upload on Save
			if let processed = try? imageProcessor.processAvatar(raw) {
                print("🟩 [ProfileVC] image processed bytes=\(processed.count)")
				pendingAvatarData = processed
			}
		}
	}

	@objc private func saveTapped() {
		guard let uid = Auth.auth().currentUser?.uid else { return }
		let name = nameField.text ?? ""
        let lang = languageField.text ?? ""
        Task {
            var avatarUrl: String? = nil
            if let data = pendingAvatarData {
                print("🟦 [ProfileVC] uploading avatar…")
                do {
                    let url = try await profileService.uploadAvatar(uid: uid, imageData: data)
                    avatarUrl = url
                    print("🟩 [ProfileVC] uploaded avatar url=\(url)")
                } catch {
                    print("🔴 [ProfileVC] uploadAvatar error: \(error)")
                }
            }
            // Write displayName and photoURL to Firestore
            var update: [String: Any] = ["displayName": name]
            if let avatarUrl { update["photoURL"] = avatarUrl; update["avatarUrl"] = avatarUrl }
            print("🟦 [ProfileVC] updating Firestore name/photo…")
            do {
                try await FirebaseService.firestore.collection("users").document(uid).setData(update, merge: true)
                try await profileService.updateLanguage(uid: uid, language: lang)
                print("🟩 [ProfileVC] Firestore updated")
            } catch {
                print("🔴 [ProfileVC] Firestore update failed: \(error)")
            }
            if let avatarUrl, let url = URL(string: avatarUrl) {
                URLSession.shared.dataTask(with: url) { data, _, _ in
                    if let d = data, let img = UIImage(data: d) {
                        DispatchQueue.main.async { self.avatarView.image = img }
                    } else {
                        print("🔴 [ProfileVC] failed to reload avatar after save")
                    }
                }.resume()
            }
            self.pendingAvatarData = nil
        }
	}
}
