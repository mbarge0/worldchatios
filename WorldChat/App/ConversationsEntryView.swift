import SwiftUI

struct ConversationsEntryView: View {
	@EnvironmentObject private var session: SessionStore
	var body: some View {
		VStack(spacing: 16) {
			if let profile = session.profile {
				HStack(spacing: 12) {
					if let urlStr = profile.avatarUrl, let url = URL(string: urlStr) {
						AsyncImage(url: url) { img in img.resizable() } placeholder: { Color.gray.opacity(0.2) }
							.frame(width: 56, height: 56)
							.clipShape(Circle())
					} else {
						Circle().fill(Color.gray.opacity(0.2)).frame(width: 56, height: 56)
					}
					VStack(alignment: .leading) {
						Text("Hello, \(profile.displayName)")
							.font(.title2).bold()
						Text("Languages: \(profile.languages.joined(separator: ", "))")
							.font(.subheadline)
					}
					Spacer()
					Button("Sign Out") { sessionSignOut() }
				}
			}
			Text("Messaging module will appear here in Phase B.")
		}
		.padding()
		navigationTitle("Conversations")
	}

	private func sessionSignOut() {
		AuthViewModel().signOut()
	}
}

#Preview {
	ConversationsEntryView()
}


