# 🌍 WorldChat

WorldChat is a cross-platform real-time messaging app built with **Swift + Firebase**, designed for seamless global communication — including presence, typing indicators, and AI-enhanced features.

Built during the **Gauntlet MessageAI Sprint**, WorldChat demonstrates how two developers (and modern AI tools) can build production-grade infrastructure in days.

---

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/worldchat.git
cd worldchat

2. Open in Xcode

Open WorldChat.xcodeproj or WorldChat.xcworkspace and select a simulator or device.

3. Add Firebase Config

Place your Firebase GoogleService-Info.plist file in the WorldChat/ directory.

4. Run the app

Press ⌘ + R or use Product → Run in Xcode.

⸻

🧩 Features

Core Messaging
	•	✅ One-on-one real-time chat
	•	✅ Message persistence (survives restarts)
	•	✅ Optimistic UI updates
	•	✅ Message timestamps + read receipts
	•	✅ Typing indicators (live between users)
	•	✅ Presence (online/offline indicators)
	•	✅ Push notifications (permissions + integration ready)
	•	✅ Firebase Auth login & registration

User Experience
	•	✅ Custom app icon & accent color
	•	✅ Profile screen (photo + display name)
	•	✅ Conversations list showing last message
	•	✅ Dynamic titles (“Italian friends”, “Chinese friends”, etc.)
	•	✅ Theming with Gauntlet-inspired colors

Firebase Integration
	•	Firestore: Conversations, messages, users
	•	Realtime Database: Presence + typing indicators
	•	Storage: Profile photos
	•	Auth: Email/password login
	•	Cloud Functions (optional): Push notifications

⸻

⚙️ Tech Stack
2. Open in Xcode

Open WorldChat.xcodeproj or WorldChat.xcworkspace and select a simulator or device.

3. Add Firebase Config

Place your Firebase GoogleService-Info.plist file in the WorldChat/ directory.

4. Run the app

Press ⌘ + R or use Product → Run in Xcode.

⸻

🧩 Features

Core Messaging
	•	✅ One-on-one real-time chat
	•	✅ Message persistence (survives restarts)
	•	✅ Optimistic UI updates
	•	✅ Message timestamps + read receipts
	•	✅ Typing indicators (live between users)
	•	✅ Presence (online/offline indicators)
	•	✅ Push notifications (permissions + integration ready)
	•	✅ Firebase Auth login & registration

User Experience
	•	✅ Custom app icon & accent color
	•	✅ Profile screen (photo + display name)
	•	✅ Conversations list showing last message
	•	✅ Dynamic titles (“Italian friends”, “Chinese friends”, etc.)
	•	✅ Theming with Gauntlet-inspired colors

Firebase Integration
	•	Firestore: Conversations, messages, users
	•	Realtime Database: Presence + typing indicators
	•	Storage: Profile photos
	•	Auth: Email/password login
	•	Cloud Functions (optional): Push notifications

⸻

⚙️ Tech Stack
Component
Technology
Frontend
Swift (UIKit)
Backend
Firebase (Firestore, Realtime DB, Storage, Auth)
Push
Firebase Cloud Messaging (FCM)
Deployment
iOS Simulator / TestFlight
AI (Phase 2)
OpenAI API via Cloud Functions

👤 User Persona: International Communicator

Who: People chatting across languages with friends, family, and colleagues.
Pain Points:
	•	Language barriers and translation overhead
	•	Understanding cultural context
	•	Switching between translation apps

AI Features (coming next):
	1.	Real-time inline translation
	2.	Auto language detection
	3.	Cultural context hints
	4.	Formality level adjustment
	5.	Slang/idiom explanations

Advanced: Context-Aware Smart Replies — generates responses in user’s style across multiple languages.

⸻

🧠 Testing Scenarios
	•	2 devices chatting in real-time
	•	One device offline → receives messages on reconnect
	•	Typing and presence indicators visible both ways
	•	Message persistence after force-quit
	•	Multiple rapid messages
	•	Group chat setup (3+ users)

⸻

🧰 Project Structure
WorldChat/
│
├── AppDelegate.swift
├── SceneDelegate.swift
├── Models/
│   └── Message.swift
│   └── Conversation.swift
│   └── UserProfile.swift
│
├── Services/
│   └── FirebaseService.swift
│   └── MessagingService.swift
│   └── PresenceService.swift
│   └── SendQueueService.swift
│
├── ViewControllers/
│   └── LoginViewController.swift
│   └── ConversationsViewController.swift
│   └── ChatViewController.swift
│   └── ProfileViewController.swift
│
└── Resources/
    └── GoogleService-Info.plist

🧾 License

MIT License © 2025 Your Name

⸻

💬 Credits

Built by Matt Barge with help from Cursor, ChatGPT (GPT-5), and GauntletAI.

“WhatsApp was built by two developers in months. With AI, you can do it in days.”