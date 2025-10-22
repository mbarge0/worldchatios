import SwiftUI
import PhotosUI

struct AvatarPickerView: View {
	let uid: String
	let onUploaded: (String) -> Void

	@State private var item: PhotosPickerItem? = nil
	@State private var isUploading = false
	@State private var errorMessage: String? = nil

	var body: some View {
		VStack(spacing: 12) {
			PhotosPicker(selection: $item, matching: .images) {
				Text(isUploading ? "Uploading…" : "Choose Avatar")
			}
			.disabled(isUploading)
			.onChange(of: item) { _, newValue in
				Task { await handlePickedItem(newValue) }
			}
			if let errorMessage { Text(errorMessage).foregroundColor(.red) }
		}
	}

	private func handlePickedItem(_ item: PhotosPickerItem?) async {
		guard let item else { return }
		isUploading = true
		do {
			if let data = try await item.loadTransferable(type: Data.self) {
				let processed = try ImageProcessingService().processAvatar(data)
				let url = try await ProfileService().uploadAvatar(uid: uid, imageData: processed)
				onUploaded(url)
			}
			isUploading = false
		} catch {
			errorMessage = "Failed to upload avatar"
			isUploading = false
		}
	}
}


