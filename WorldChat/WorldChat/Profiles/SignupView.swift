import SwiftUI

struct SignupView: View {
	@EnvironmentObject private var session: SessionStore
	@StateObject private var vm = AuthViewModel()
	@State private var displayName: String = ""
	@State private var selectedLanguages: Set<String> = []

	private let locales = ["en","es","fr","de","ja","ko","zh-Hans","pt"]

	var body: some View {
		NavigationStack {
			Form {
				Section("Account") {
					TextField("Email", text: $vm.email)
					SecureField("Password", text: $vm.password)
				}
				Section("Profile") {
					TextField("Display Name", text: $displayName)
					LanguagePicker(locales: locales, selection: $selectedLanguages)
				}
				Section {
					Button(action: { Task { await vm.signUp(displayName: displayName, languages: Array(selectedLanguages)) } }) {
						Text(vm.isLoading ? "Creating…" : "Create Account")
					}
					.disabled(vm.isLoading)
				}
				if let err = vm.errorMessage { Text(err).foregroundColor(.red) }
			}
			.navigationTitle("Sign Up")
		}
	}
}

private struct LanguagePicker: View {
	let locales: [String]
	@Binding var selection: Set<String>

	var body: some View {
		VStack(alignment: .leading, spacing: 8) {
			ForEach(locales, id: \.self) { code in
				HStack {
					Image(systemName: selection.contains(code) ? "checkmark.circle.fill" : "circle")
					Text(code)
					Spacer()
				}
				.contentShape(Rectangle())
				.onTapGesture {
					if selection.contains(code) { selection.remove(code) } else { selection.insert(code) }
				}
			}
		}
	}
}


