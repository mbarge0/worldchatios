//
//  WorldChatApp.swift
//  WorldChat
//

import SwiftUI
import FirebaseCore

@main
struct WorldChatApp: App {
    init() {
        // Initialize Firebase once, synchronously, and signal readiness
        FirebaseBoot.configureIfNeededAndSignal()
    }

    var body: some Scene {
        WindowGroup {
            // Start with your login screen or AppShell
            AppShell()
        }
    }
}
