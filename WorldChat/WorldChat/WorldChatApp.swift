//
//  WorldChatApp.swift
//  WorldChat
//
//  Created by Matthew Barge on 10/21/25.
//

import SwiftUI
import FirebaseCore

@main
struct WorldChatApp: App {
    // Configure Firebase at launch
    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
