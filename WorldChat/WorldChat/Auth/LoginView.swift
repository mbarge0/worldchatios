import SwiftUI

struct LoginView: View {
	@EnvironmentObject private var session: SessionStore
	@StateObject private var vm = AuthViewModel()
	@State private var showSignup = false

	var body: some View {
		VStack(spacing: 16) {
			Text("WorldChat")
				.font(.largeTitle)
			TextField("Email", text: $vm.email)
				.keyboardType(.emailAddress)
				.textInputAutocapitalization(.never)
				.autocorrectionDisabled(true)
			SecureField("Password", text: $vm.password)
			Button(action: { Task { await vm.signIn() } }) {
				Text(vm.isLoading ? "Signing In…" : "Sign In")
			}
			.disabled(vm.isLoading)
			Button("Create Account") { showSignup = true }
			if let err = vm.errorMessage { Text(err).foregroundColor(.red) }
		}
		.padding()
		.sheet(isPresented: $showSignup) {
			SignupView()
		}
	}
}

#Preview { LoginView().environmentObject(SessionStore()) }


