//
//  ContentView.swift
//  WorldChat
//
//  Created by Matthew Barge on 10/21/25.
//

import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct ContentView: View {
    @State private var message = "Testing Firebase..."

    var body: some View {
        VStack(spacing: 12) {
            Text(message)
                .font(.headline)
                .multilineTextAlignment(.center)
                .padding()

            Button("Run Firebase Test") {
                testFirebase()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }

    func testFirebase() {
        // Test Firestore
        let db = Firestore.firestore()
        db.collection("test").document("connection")
            .setData(["timestamp": Date()]) { error in
                if let error = error {
                    message = "❌ Firestore failed: \(error.localizedDescription)"
                } else {
                    message = "✅ Firestore write succeeded"
                }
            }

        // Test Anonymous Auth
        Auth.auth().signInAnonymously { result, error in
            if let error = error {
                message = "❌ Auth failed: \(error.localizedDescription)"
            } else if let user = result?.user {
                message = "✅ Auth OK, UID: \(user.uid.prefix(8))..."
            }
        }
    }
}
