# Product Requirements Document (PRD)
## WorldChat - AI-Powered Cross-Language Messaging

**Version:** 1.0  
**Date:** October 20, 2025  
**Platform:** iOS (Swift/SwiftUI)  
**Target Persona:** International Communicator  
**Sprint Duration:** 7 Days

---

## 1. Project Overview

WorldChat is an iOS messaging application designed to eliminate language barriers for travelers, expatriates, and anyone maintaining international friendships. The app combines WhatsApp-level messaging infrastructure (real-time delivery, offline support, group chat) with intelligent AI-powered translation and language learning features. Users can communicate naturally in their native language while their conversation partners receive inline translations in theirs. The app transforms casual international conversations into language learning opportunities through karaoke-style audio playback with word highlighting.

**Unique Value Proposition:** WorldChat is the only messaging app that simultaneously enables barrier-free cross-language communication AND facilitates organic language learning through everyday conversations.

**Success Criteria:**
- Message Delivery Success Rate: 99.9% within 500ms
- AI Feature Adoption Rate: 80% of users actively use 3+ AI features
- Technical MVP delivered within 24 hours
- Full feature set deployed to TestFlight within 7 days

---

## 2. Problem Statement

**Who:** International travelers, expatriates, people in cross-cultural relationships, multilingual professionals, and language learners who need to maintain authentic relationships across language barriers.

**Problem:** Current messaging solutions force users to choose between authentic communication and comprehension. Users manually copy messages into translation apps, losing conversational flow and context. Cultural nuances, idioms, and formality levels are lost in direct translation. The cognitive overhead of switching between apps kills spontaneity and makes conversations feel transactional rather than personal.

**Negative Outcomes:**
- Relationships weaken due to communication friction
- Misunderstandings from literal translations damage trust
- Language learning opportunities are lost during peak immersion periods (travel abroad)
- Users avoid international communication entirely due to complexity
- Time spent on manual translation reduces willingness to engage

**Example Scenario:** A traveler in Italy befriends a local who speaks minimal English. They exchange phone numbers to stay in touch during the trip. Without WorldChat, every message requires opening WhatsApp, copying text, switching to Google Translate, pasting, reading, composing a response in English, translating it to Italian, copying, switching back to WhatsApp, and pasting. With 10+ messages per day, this overhead kills the relationship before it begins.

---

## 3. Solution Summary

WorldChat eliminates translation friction by embedding AI-powered language intelligence directly into the messaging experience. When a user sends a message, recipients see both the original text and an inline translation in their preferred language—automatically, with zero manual action required. 

**Core Capabilities:**

**Real-Time Messaging Infrastructure:** Delivers WhatsApp-quality messaging with sub-500ms delivery, optimistic UI updates, offline message queuing, typing indicators, read receipts, and presence status. Messages persist locally using SwiftData and sync via Firebase Firestore in real-time.

**Intelligent Translation Layer:** Every message is automatically translated using Google Cloud Translation API with results cached in Firebase for cost efficiency. Translations appear line-by-line below original text, preserving visual correspondence between languages.

**Language Learning Integration:** Users tap any message to hear native pronunciation via AVSpeechSynthesizer with karaoke-style word highlighting that syncs perfectly with audio playback. Playback speed controls (0.75x, 1x, 1.25x) enable progressive listening comprehension.

**AI Conversation Assistant:** A dedicated AI chat interface (powered by OpenAI GPT-4) allows users to ask questions about vocabulary, grammar, cultural context, and phrasing directly within the conversation context. The AI has access to the current conversation thread via RAG pipeline.

**Context-Aware Smart Replies:** AI learns user communication style (formality, length, emoji usage) and suggests 3 contextually appropriate reply options in both languages when the user opens the keyboard.

**Technical Foundation:** Swift/SwiftUI frontend with Firebase backend (Firestore, Cloud Functions, Auth, FCM, Storage). All API calls (Google Translate, OpenAI) execute server-side in Cloud Functions to protect API keys.

---

## 4. Objectives and Goals

1. **Achieve 99.9% Message Delivery Reliability:** Ensure messages are delivered successfully within 500ms on good connections, with zero message loss even during poor network conditions, app crashes, or offline scenarios.

2. **Drive 80% AI Feature Adoption:** Within the first week of use, 80% of users must actively engage with at least 3 of the 5 core AI features (translation, audio playback, smart replies, AI assistant, cultural context).

3. **Enable Organic Language Learning:** Transform passive message reading into active learning by providing audio pronunciation, word highlighting, and conversational context that helps users incrementally improve language skills.

4. **Reduce Translation Friction to Zero:** Eliminate all manual copy-paste workflows by providing automatic inline translations that require no user action beyond reading their messages.

5. **Deliver Production-Grade User Experience:** Match WhatsApp's standard for snappy, reliable messaging with typing indicators appearing within 200ms, optimistic message sends with instant UI feedback, and graceful degradation under poor network conditions.

---

## 5. Target Users

### Primary User: International Communicator

**Demographics:**
- Age 25-55
- Travelers spending 2+ weeks abroad annually
- Expatriates maintaining relationships with home country
- People in cross-cultural relationships
- Remote workers collaborating with international teams
- Language learners seeking conversation practice

**Motivations:**
- Maintain authentic friendships across language barriers
- Learn languages through immersion and real conversations
- Stay connected with international colleagues/family
- Avoid awkwardness of miscommunication
- Maximize language learning during travel

**Pain Points:**
- Copy-paste translation workflow kills conversational flow
- Direct translations miss cultural context and tone
- Unable to hear proper pronunciation of foreign words
- Lose learning opportunities during peak immersion (travel)
- Formal/casual tone confusion in unfamiliar languages
- Idioms and slang create misunderstandings

**Environment:**
- Traveling abroad with intermittent WiFi
- Using messaging apps 10+ times per day
- Actively trying to learn destination language
- Building new friendships with locals
- Needs offline message support for flights/remote areas

**Technology Profile:**
- iPhone user (iOS 16+)
- Comfortable with messaging apps (WhatsApp, iMessage)
- Uses Google Translate occasionally
- Interested in AI-powered features
- Values privacy and data security

### Secondary Users

**Language Teachers/Tutors:** May use WorldChat to practice with students in authentic conversation contexts.

**Global Customer Support Teams:** Could use translation features for multilingual customer communication (future B2B opportunity).

---

## 6. Key Features and Functionality

### 6.1 Real-Time Messaging Infrastructure

**Description:** Production-grade one-on-one and group messaging with instant delivery, offline support, and optimistic UI updates.

**User Intent:** Users expect WhatsApp-level reliability—messages must feel instant, never get lost, and work even with poor connectivity.

**Dependencies:**
- Firebase Firestore for real-time database
- SwiftData for local persistence
- Firebase Cloud Messaging for push notifications
- Combine framework for reactive UI updates

**Success Criteria:**
- Messages delivered within 500ms (p95 latency)
- 99.9% delivery success rate
- Zero message loss during app crashes or network interruptions
- Typing indicators appear within 200ms
- Offline messages queue and send automatically on reconnect

**Technical Implementation:**
- Firestore collection: `conversations/{conversationId}/messages/{messageId}`
- Optimistic UI: Display message immediately with "sending" status
- Message states: sending → sent → delivered → read
- SwiftData stores messages locally for offline access
- Firestore listeners update UI in real-time via Combine publishers

---

### 6.2 Automatic Inline Translation

**Description:** Every message is automatically translated into the recipient's preferred language and displayed line-by-line below the original text.

**User Intent:** Users should never need to manually translate messages. Comprehension should be instant and effortless.

**Dependencies:**
- Google Cloud Translation API (called from Cloud Functions)
- Firebase Cloud Functions for server-side API calls
- Translation cache in Firestore to reduce API costs
- User profile with Primary Preferred Language field

**Success Criteria:**
- Translations appear within 1 second of message delivery
- Translation accuracy validated subjectively by test users
- 90% cache hit rate for common phrases (cost optimization)
- Fallback to original message if translation fails

**Technical Implementation:**
- Cloud Function triggered on new message creation
- Check Firestore cache: `translations/{sourceHash}` (hash of source text + language pair)
- If cache miss: Call Google Cloud Translation API
- Store translation in message document: `message.translations.{languageCode}`
- Client displays original text + `message.translations.{userPreferredLanguage}` inline

**Line-by-Line Display Format:**
```
[Original Line 1]
[Translated Line 1]

[Original Line 2]
[Translated Line 2]
```

**Error Handling:**
- If API fails: Display original message + "Translation Failed" icon
- User can tap icon to retry manually
- No automatic retry (only on next message load)

---

### 6.3 Audio Playback with Word Highlighting (Karaoke-Style)

**Description:** Users tap any message to hear native pronunciation with synchronized word-by-word highlighting in both original and translated text.

**User Intent:** Language learners want to hear correct pronunciation and associate written words with spoken sounds to build vocabulary.

**Dependencies:**
- AVFoundation framework (AVSpeechSynthesizer)
- AVSpeechSynthesizerDelegate for word boundary callbacks
- SwiftUI animation for highlighting
- Message translation data

**Success Criteria:**
- Audio playback starts within 500ms of tap
- Word highlighting syncs perfectly with speech (zero lag)
- Playback speed controls function without audio distortion
- Users can replay audio multiple times

**Technical Implementation:**
```swift
import AVFoundation

class AudioManager: NSObject, AVSpeechSynthesizerDelegate {
    let synthesizer = AVSpeechSynthesizer()
    
    func speak(text: String, language: String, speed: Float) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: language)
        utterance.rate = speed // 0.4 (0.75x), 0.5 (1x), 0.6 (1.25x)
        synthesizer.speak(utterance)
    }
    
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer,
                          willSpeakRangeOfSpeechString characterRange: NSRange,
                          utterance: AVSpeechUtterance) {
        // Highlight word at characterRange in SwiftUI view
        NotificationCenter.default.post(
            name: .highlightWord,
            object: characterRange
        )
    }
}
```

**UI Components:**
- Tap message bubble → Audio control overlay appears
- Play/Pause button
- Speed selector: 0.75x | 1x | 1.25x (pills)
- Progress bar showing current word position
- Close button

**Word Highlighting:**
- Highlighted words in original text: Yellow background
- Corresponding words in translation: Blue background (simultaneous)
- Animation duration: 100ms fade in/out

---

### 6.4 AI Conversation Assistant (Dedicated Chat)

**Description:** A special chat interface where users can ask the AI questions about vocabulary, grammar, cultural context, and phrasing within their current conversation.

**User Intent:** Users encounter unfamiliar words, confusing grammar, or cultural references and need immediate explanations without leaving the conversation.

**Dependencies:**
- OpenAI GPT-4 API (called from Cloud Functions)
- RAG pipeline: Retrieve current conversation messages as context
- Firebase Firestore for conversation history
- Separate UI view for AI chat

**Success Criteria:**
- AI responds within 3 seconds (p95)
- Answers are contextually relevant to the conversation
- Users can access AI assistant from any conversation screen
- AI provides explanations in user's preferred language

**Technical Implementation:**

**UI Access:**
- Floating button on conversation screen (bottom-right)
- Tapping opens full-screen AI chat modal
- User types questions in natural language

**Cloud Function: `askAI`**
```javascript
// Retrieves last 20 messages from conversation
// Sends to OpenAI GPT-4 with system prompt:
"You are a language learning assistant. The user is having a conversation 
with someone in [TARGET_LANGUAGE]. Answer questions about vocabulary, 
grammar, cultural context, and phrasing. Be concise and educational."

// Returns AI response to client
```

**RAG Pipeline:**
- Retrieve last 20 messages from `conversations/{id}/messages`
- Include both original and translated text
- Send as context to OpenAI API
- Cache common queries in Firestore

**Example Queries:**
- "What does 'che bello' mean?"
- "Is this message formal or casual?"
- "How do I say 'see you tomorrow' in Italian?"
- "What's the cultural context behind this phrase?"

---

### 6.5 Context-Aware Smart Replies

**Description:** AI suggests 3 contextually appropriate reply options in both languages when the user opens the keyboard, learning their communication style over time.

**User Intent:** Users want to respond quickly without composing from scratch, especially when unsure of appropriate phrasing in a foreign language.

**Dependencies:**
- OpenAI GPT-4 API for reply generation
- User conversation history (last 10 messages)
- User style profile (stored in Firestore: formality, avg length, emoji usage)
- Keyboard extension or overlay UI

**Success Criteria:**
- Suggestions appear within 1.5 seconds of opening keyboard
- At least 1 of 3 suggestions is user-selected 40% of the time
- AI learns user style after 20+ messages sent
- Suggestions are culturally and contextually appropriate

**Technical Implementation:**

**Trigger:** User taps message input field in conversation

**Cloud Function: `generateSmartReplies`**
```javascript
// Input: Last 10 messages, user style profile
// Output: 3 reply suggestions (each in both languages)

systemPrompt = `Generate 3 reply suggestions based on conversation context.
User style: ${userProfile.formality}, ${userProfile.avgLength} words, 
${userProfile.emojiFrequency} emojis. Match this style.`

// Returns:
[
  { original: "Sounds great!", translated: "¡Suena genial!" },
  { original: "I'd love to", translated: "Me encantaría" },
  { original: "What time works?", translated: "¿Qué hora funciona?" }
]
```

**UI Display:**
- Horizontal scrollable pills above keyboard
- Each pill shows: "[Translated]" (primary) + "[Original]" (secondary, smaller)
- Tap pill → Auto-fills input field → User can edit before sending

**Style Learning:**
- After each message sent, update `users/{uid}/styleProfile`:
  - `formality`: casual | neutral | formal (inferred from word choice)
  - `avgLength`: average word count per message
  - `emojiFrequency`: emojis per message
  - `commonPhrases`: array of user's frequent expressions

---

### 6.6 User Authentication & Profiles

**Description:** Email/password authentication with user profiles containing name, profile picture, and language preferences.

**User Intent:** Users need persistent identities to maintain conversation history and preferences across devices.

**Dependencies:**
- Firebase Authentication
- Firebase Storage for profile pictures
- Firestore for user profiles

**Success Criteria:**
- Sign up/login completes within 5 seconds
- Profile pictures upload within 3 seconds
- Language preferences persist across sessions
- Password reset flow functional

**Technical Implementation:**

**Firestore Schema:**
```
users/{uid}
├── email: string
├── displayName: string
├── profilePictureURL: string
├── primaryLanguage: string (ISO 639-1 code, e.g., "en")
├── secondaryLanguages: [string] (max 2)
├── createdAt: timestamp
└── styleProfile: {
    formality: string,
    avgLength: number,
    emojiFrequency: number
}
```

**Onboarding Flow:**
1. Email/password sign up (Firebase Auth)
2. Enter display name
3. Upload profile picture (optional, can skip)
4. Select primary preferred language from dropdown
5. Optionally add up to 2 secondary languages

**Language Dropdown:**
- Supported languages: English, Spanish, French, German, Italian, Portuguese, Mandarin, Japanese, Korean, Arabic (top 10 for MVP)
- Searchable list
- Displays language in native script + English name

---

### 6.7 Group Chat with Per-User Translation

**Description:** Group conversations with 3+ participants where each user sees all messages translated into their preferred language automatically.

**User Intent:** Multilingual groups should communicate seamlessly without language barriers.

**Dependencies:**
- Firestore group conversation schema
- Translation engine for multiple target languages
- Group member management

**Success Criteria:**
- Group messages delivered to all participants within 1 second
- Each user sees translations in their preferred language
- Group creation supports 3-20 participants
- Member list displays online/offline status

**Technical Implementation:**

**Translation Logic:**
- Direct translation (source → each recipient's target language)
- Example: User A sends Spanish message
  - User B (English): sees Spanish → English
  - User C (Mandarin): sees Spanish → Mandarin
  - User D (Italian): sees Spanish → Italian

**Firestore Schema:**
```
conversations/{conversationId}
├── type: "group"
├── participants: [uid1, uid2, uid3, ...]
├── participantLanguages: { uid1: "en", uid2: "zh", uid3: "it" }
└── messages (subcollection)

messages/{messageId}
├── senderId: uid
├── text: string (original)
├── timestamp: timestamp
├── translations: {
    en: "...",
    zh: "...",
    it: "..."
}
```

**Cloud Function:**
- On message creation: Determine required target languages from `participantLanguages`
- Generate translations for each unique language
- Store in `message.translations`

---

### 6.8 Presence & Typing Indicators

**Description:** Real-time display of online/offline status and typing activity.

**User Intent:** Users expect visual feedback showing conversation partner is active and composing a reply.

**Dependencies:**
- Firestore presence system
- Combine for reactive UI updates
- Firebase Realtime Database (for typing indicators)

**Success Criteria:**
- Presence updates within 5 seconds of status change
- Typing indicators appear within 200ms
- No false positives (typing indicator clears immediately when user stops)

**Technical Implementation:**

**Presence:**
- Firestore: `users/{uid}/presence = { status: "online" | "offline", lastSeen: timestamp }`
- Update on app foreground/background events
- Display in conversation header

**Typing Indicators:**
- Firebase Realtime Database: `typingIndicators/{conversationId}/{uid} = timestamp`
- Set timestamp when user types
- Clear when user stops typing (1-second debounce)
- Other participants listen for changes

---

### 6.9 Push Notifications

**Description:** Users receive notifications for new messages when app is backgrounded or closed.

**User Intent:** Stay informed of new messages without keeping app open.

**Dependencies:**
- Firebase Cloud Messaging (FCM)
- APNs (Apple Push Notification service)
- Cloud Function trigger on new messages

**Success Criteria:**
- Notifications delivered within 5 seconds of message send
- Notification displays sender name + message preview (translated)
- Tapping notification opens conversation

**Technical Implementation:**
- Cloud Function: On message create → Send FCM notification to recipient's device token
- Notification payload includes conversation ID
- App delegate handles notification tap → navigates to conversation

---

### 6.10 Message Persistence & Offline Support

**Description:** All messages stored locally with SwiftData, syncing with Firestore when online.

**User Intent:** Users can read conversation history offline and send messages that queue for delivery.

**Dependencies:**
- SwiftData for local storage
- Firestore for cloud sync
- Network reachability monitoring

**Success Criteria:**
- Offline message queue sends automatically on reconnect
- Conversation history accessible offline (last 500 messages per conversation)
- Zero message duplication during sync

**Technical Implementation:**
- SwiftData model: `MessageEntity` mirrors Firestore schema
- On app launch: Sync Firestore → SwiftData
- Offline sends: Store in local queue with "pending" status
- On network reconnect: Upload pending messages → update to "sent"

---

## 7. User Stories

### Core Messaging

**US-1:** As an international traveler, I want to send a text message to my new Italian friend so that I can stay in touch during my trip.

**US-2:** As a message recipient, I want to see both the original message and a translation in my language so that I can understand without manual translation.

**US-3:** As a user in an area with poor WiFi, I want my messages to queue and send automatically when I reconnect so that I don't lose my messages.

### Language Learning

**US-4:** As a language learner, I want to tap a message and hear it read aloud with word highlighting so that I can learn proper pronunciation and vocabulary.

**US-5:** As a user reading a foreign message, I want to adjust playback speed to 0.75x so that I can hear each word clearly while learning.

### AI Features

**US-6:** As a user confused by an idiom, I want to ask the AI assistant "What does this phrase mean?" so that I can understand cultural context without leaving the app.

**US-7:** As a user composing a reply, I want the app to suggest 3 contextually appropriate responses in both languages so that I can reply quickly with proper phrasing.

**US-8:** As a group chat participant, I want every message automatically translated to English so that I can follow multilingual conversations effortlessly.

### User Management

**US-9:** As a new user, I want to sign up with email/password and select my primary language during onboarding so that translations are personalized to me.

**US-10:** As a user, I want to see when my conversation partner is typing so that I know they're actively responding.

---

## 8. Non-Functional Requirements

### Performance

- **Message Delivery Latency:** 
  - P50: <300ms
  - P95: <500ms
  - P99: <1000ms
- **Translation Latency:** <1 second from message receipt to translated text display
- **AI Response Time:** 
  - Smart Replies: <1.5 seconds
  - AI Assistant: <3 seconds (p95)
- **Audio Playback Start:** <500ms from tap
- **App Launch Time:** <2 seconds cold start, <500ms warm start
- **Typing Indicator Latency:** <200ms

### Security and Compliance

- **Authentication:** Firebase Authentication with email/password only
- **API Key Protection:** All API keys (Google Translate, OpenAI) stored server-side in Cloud Functions, never exposed to client
- **Message Encryption:**
  - At-rest: Firestore encryption enabled by default
  - In-transit: HTTPS/TLS for all network requests
  - End-to-end encryption: NOT required for MVP
- **Data Retention:** Messages stored forever unless user explicitly deletes conversation
- **User Data Export:** Users can request JSON export of all messages via Profile Settings
- **User Data Deletion:** Users can delete account + all associated data (GDPR right-to-erasure)
- **Privacy Policy:** Required before launch, must disclose AI processing of messages

### Scalability

- **Concurrent Users:** Design for 1,000+ concurrent users (MVP scale)
- **Message Throughput:** Handle 100+ messages/second across all users
- **Firebase Firestore:** 
  - Read/write limits: Stay under free tier (50K reads, 20K writes per day) during development
  - Production: Upgrade to Blaze plan, implement read caching
- **Translation Caching:** 90% cache hit rate target to minimize API costs
- **Cloud Functions:** Auto-scaling enabled, timeout set to 30 seconds

### Accessibility

- **VoiceOver Support:** All UI elements labeled for screen readers
- **Dynamic Type:** Support iOS system font size preferences
- **Color Contrast:** WCAG AA compliance (4.5:1 ratio minimum)
- **Haptic Feedback:** Confirm message send, translation complete, audio playback start

### Device and Platform Support

- **Platform:** iOS only (Swift/SwiftUI)
- **Minimum iOS Version:** iOS 16.0+
- **Device Support:** iPhone 12 and newer (A14 Bionic or later)
- **Testing Devices:** 
  - Primary: iPhone 14 Pro (iOS 17)
  - Secondary: iPhone 12 (iOS 16)
- **Deployment:** TestFlight for beta testing, App Store for public release (post-sprint)
- **Orientation:** Portrait only (no landscape support for MVP)

### Reliability

- **Message Delivery Success Rate:** 99.9%
- **Uptime Target:** 99.5% (Firebase provides 99.95% SLA)
- **Offline Functionality:** 
  - Read message history: 100% available
  - Send messages: Queue and auto-send on reconnect
  - AI features: Unavailable offline (graceful degradation)

### Maintainability

- **Code Architecture:** MVVM pattern with Combine for reactive updates
- **Dependency Management:** Swift Package Manager (no CocoaPods)
- **Version Control:** Git with feature branches
- **Documentation:** Inline code comments for complex logic, README with setup instructions
- **Error Logging:** Firebase Crashlytics for crash reporting

---

## 9. Success Metrics

### Technical Metrics

**Message Delivery Performance:**
- **Primary Metric:** 99.9% delivery success rate within 500ms
- **Measurement:** Firebase Analytics custom event tracking
- **Target:** Achieved by Day 7

**AI Feature Adoption:**
- **Primary Metric:** 80% of users engage with 3+ AI features within first week
- **Features Tracked:**
  1. Inline translation views
  2. Audio playback usage
  3. Word highlighting interactions
  4. AI assistant queries
  5. Smart reply selections
- **Measurement:** Firebase Analytics event tracking per feature
- **Target:** Achieved by Day 7 with 10+ test users

**App Stability:**
- **Crash-Free Rate:** >99%
- **Measurement:** Firebase Crashlytics
- **Target:** Zero crashes during structured testing scenarios

### User Experience Metrics

**Perceived Speed:**
- **Typing Indicator Latency:** <200ms (measured via timestamp logs)
- **Translation Display Time:** <1 second (user-perceived)
- **Audio Playback Start:** <500ms

**Feature Usability:**
- **Smart Reply Selection Rate:** 40% of replies use AI suggestions
- **Audio Playback Replays:** Users replay messages 2+ times (indicates learning value)
- **AI Assistant Engagement:** 50% of users ask 1+ question per conversation

### Qualitative Indicators

**User Satisfaction:**
- **Method:** Post-test interview with 5+ users
- **Questions:**
  - "Did translations feel accurate and natural?"
  - "Was audio playback helpful for learning?"
  - "Would you use this app instead of WhatsApp + Google Translate?"
- **Target:** 4/5 users answer "yes" to all questions

**Feature Perceived Value:**
- **Question:** "Which feature was most valuable?"
- **Expected Distribution:** 
  - Inline translation: 40%
  - Audio playback: 30%
  - Smart replies: 20%
  - AI assistant: 10%

### Business Metrics (Post-MVP)

**User Retention:**
- **Day 1 Retention:** >70%
- **Week 1 Retention:** >50%

**Viral Coefficient:**
- **Invites Sent per User:** 2+ (indicates word-of-mouth potential)

**Cost Efficiency:**
- **Translation API Cost per User per Month:** <$1
- **OpenAI API Cost per User per Month:** <$2

---

## 10. Risks and Assumptions

### Technical Risks

**Risk 1: Xcode/CocoaPods Environment Issues**
- **Impact:** HIGH - Could block Day 1 progress
- **Probability:** MODERATE (30%)
- **Mitigation:** 
  - Use Swift Package Manager instead of CocoaPods
  - Pre-test Firebase SDK installation on clean project
  - Allocate 4 hours on Day 1 for environment setup troubleshooting

**Risk 2: Firebase Firestore Real-Time Sync Complexity**
- **Impact:** HIGH - Core messaging feature
- **Probability:** LOW (10%)
- **Mitigation:**
  - Follow Firebase official real-time chat tutorial first
  - Implement simple proof-of-concept before building full feature
  - Use Firestore listeners with snapshot changes (well-documented pattern)

**Risk 3: Google Cloud Translation API Rate Limits**
- **Impact:** MODERATE - Could block translations at scale
- **Probability:** LOW (5%)
- **Mitigation:**
  - Implement aggressive caching (90% hit rate target)
  - Monitor quota usage via Google Cloud Console
  - Fallback: Display original message only if quota exceeded

**Risk 4: OpenAI API Latency/Downtime**
- **Impact:** MODERATE - Affects AI features
- **Probability:** LOW (10%)
- **Mitigation:**
  - Set 30-second timeout on Cloud Functions
  - Display user-friendly error: "AI temporarily unavailable"
  - Cache common smart reply patterns

**Risk 5: AVSpeechSynthesizer Language Support Gaps**
- **Impact:** MODERATE - Some languages may not have quality TTS voices
- **Probability:** MODERATE (20%)
- **Mitigation:**
  - Test all 10 supported languages pre-launch
  - Document unsupported languages in app (e.g., regional dialects)
  - Fallback: Disable audio button for unsupported languages

**Risk 6: TestFlight Review Delays**
- **Impact:** HIGH - Could miss final deadline
- **Probability:** MODERATE (30%)
- **Mitigation:**
  - Submit to TestFlight by Day 6 (24-hour buffer)
  - Prepare local IPA build as backup demo method
  - Ensure app follows App Store Review Guidelines (no violations)

### Product Risks

**Risk 7: Translation Quality Perception**
- **Impact:** HIGH - Core value proposition
- **Probability:** MODERATE (25%)
- **Mitigation:**
  - Use Google Cloud Translation (industry-standard quality)
  - Add disclaimer: "Translations are AI-generated and may not be perfect"
  - Allow users to report poor translations (future feedback loop)

**Risk 8: Low AI Feature Adoption**
- **Impact:** MODERATE - Fails 80% adoption metric
- **Probability:** MODERATE (30%)
- **Mitigation:**
  - Make inline translation automatic (zero-friction)
  - Add onboarding tooltips highlighting audio playback
  - Pre-populate AI assistant with suggested questions

**Risk 9: User Confusion with Hybrid UI (AI Chat + Contextual Features)**
- **Impact:** LOW - UX clarity issue
- **Probability:** MODERATE (20%)
- **Mitigation:**
  - Clear visual distinction (AI chat has purple theme)
  - Onboarding tutorial shows both interaction methods
  - User testing on Day 5 to validate UX

### Assumptions

**Assumption 1: Users Have Stable Internet During Setup**
- **Validation:** Provide clear error messages if offline during sign-up
- **Risk if Wrong:** Users abandon onboarding

**Assumption 2: 10 Languages Cover 80% of Use Cases**
- **Validation:** Research most common tourist/expat destinations
- **Risk if Wrong:** Users request unsupported languages, negative reviews

**Assumption 3: Google Cloud Translation Accuracy is "Good Enough"**
- **Validation:** Subjective testing with native speakers
- **Risk if Wrong:** Users don't trust translations, stop using app

**Assumption 4: Users Will Accept Non-E2E Encryption**
- **Validation:** Privacy policy disclosure, compare to WhatsApp's early versions
- **Risk if Wrong:** Privacy-conscious users avoid app

**Assumption 5: One Week is Sufficient for Full Feature Set**
- **Validation:** Daily progress checkpoints (MVP at 24 hours)
- **Risk if Wrong:** Scope reduction required, may miss advanced features

**Assumption 6: TestFlight Distribution is Acceptable for Demo**
- **Validation:** Confirm reviewers can access TestFlight
- **Risk if Wrong:** Need alternative demo method (screen recording + local build)

---

## 11. Future Considerations

### Phase 2: Enhanced Learning Features (Weeks 2-4)

**Vocabulary Tracking:**
- Automatically track new words user encounters
- Spaced repetition flashcard system
- Progress dashboard showing words learned per week

**Grammar Insights:**
- AI explains grammar patterns in messages ("This uses subjunctive mood")
- Link to grammar rules with examples
- Highlight grammar structures in messages (verb conjugations, tenses)

**Conversational Proficiency Scoring:**
- Track language improvement over time
- Metrics: vocabulary diversity, sentence complexity, response time
- Weekly reports: "You've learned 47 new Italian words this week!"

### Phase 3: Advanced AI Capabilities (Months 2-3)

**Voice Messages with Translation:**
- Record voice message in native language
- Automatic transcription + translation
- Recipient can read transcript or listen to original audio
- TTS playback in their preferred language

**Image Text Extraction (OCR):**
- Take photo of menu, sign, document
- Extract text via OCR (Google Cloud Vision API)
- Translate extracted text
- Use case: Travelers navigating foreign cities

**Cultural Context Advisor (Enhanced):**
- Proactive suggestions: "In Italian culture, this greeting is very formal"
- Regional dialect detection: "This person is using Roman slang"
- Etiquette tips: "Double-check this is appropriate for business context"

**Conversation Summarization:**
- Long group chat threads → AI-generated summary
- "In the last 50 messages, the group decided on Sunday 3pm for dinner"
- Extract action items, decisions, open questions

### Phase 4: Social & Discovery Features (Months 3-6)

**Language Exchange Matching:**
- Connect users who want to practice each other's languages
- Example: English speaker learning Italian ↔ Italian speaker learning English
- Conversation prompts to start discussions

**Community Translation Improvements:**
- Users can suggest better translations
- Crowdsourced improvements feed back into system
- Reputation system for quality contributors

**Shared Vocabulary Lists:**
- Users can create and share word lists with friends
- "Words I learned in Italy" shareable collection
- Collaborative learning: Group members add to shared list

### Phase 5: Enterprise & B2B Expansion (Months 6-12)

**Business Translation Mode:**
- Terminology databases for industry-specific vocabulary
- Formal tone enforcement
- Multi-stakeholder review before sending (compliance)

**Team Collaboration Features:**
- Organization accounts with shared translation memory
- Bulk translation of documents
- Analytics on most-used phrases (for training materials)

**API Access:**
- Expose WorldChat translation + context layer as API
- Integration with existing customer support platforms (Zendesk, Intercom)
- White-label solution for other apps

### Technical Infrastructure Evolution

**Cross-Platform Expansion:**
- **Android App:** Kotlin with Jetpack Compose (reuse Firebase backend)
- **Web App:** React with Firebase SDK (desktop experience)
- **macOS/iPadOS:** Native SwiftUI apps with optimized layouts

**End-to-End Encryption:**
- Implement Signal Protocol for message encryption
- Zero-knowledge architecture (Firebase stores encrypted blobs)
- Challenge: AI features require plaintext access (hybrid solution needed)

**Offline AI Capabilities:**
- On-device ML models for common translations (Core ML)
- Reduce API costs for frequent phrases
- Faster translation latency (no network roundtrip)

**Advanced Caching & Performance:**
- Redis cache layer for hot translations
- CDN for user profile images (Cloudflare)
- GraphQL API for efficient data fetching (replace REST)

**Multi-Region Deployment:**
- Firebase multi-region replication (US, EU, Asia)
- Reduce latency for international users
- GDPR compliance with EU data residency

### Monetization Strategies (Post-MVP)

**Freemium Model:**
- **Free Tier:** 100 translations per day, 10 AI assistant queries per day
- **Premium Tier ($4.99/month):** Unlimited translations, unlimited AI queries, voice messages, advanced learning analytics

**In-App Purchases:**
- Additional language packs ($0.99 each)
- Premium TTS voices (celebrity/regional accents)
- Conversation export to PDF/EPUB

**B2B SaaS:**
- Team plans ($15/user/month)
- Enterprise contracts with SLA guarantees
- Custom integrations

### Analytics & Optimization

**A/B Testing Framework:**
- Test smart reply positioning (above vs. below keyboard)
- Test translation display format (inline vs. overlay)
- Test AI assistant onboarding flows

**User Behavior Analytics:**
- Heatmaps of most-tapped UI elements
- Funnel analysis: sign-up → first message → first AI feature use
- Cohort retention analysis by language pair

**Cost Optimization:**
- Monitor API usage per user per month
- Identify expensive edge cases (very long messages)
- Implement rate limiting for abusive patterns

### Compliance & Legal

**GDPR Compliance (EU Launch):**
- Data processing agreements with Google/OpenAI
- User consent flows for AI processing
- Right-to-access, right-to-deletion implementations

**App Store Optimization:**
- Localized app descriptions in 10 languages
- Demo videos showing key features
- Keyword optimization for "language learning" + "translation chat"

**Content Moderation:**
- Automated profanity detection (multi-language)
- User reporting system for harassment
- AI-powered spam detection in group chats

### Long-Term Vision: WorldChat Ecosystem

**Mission:** Make authentic human connection possible across any language barrier, while turning every conversation into a learning opportunity.

**5-Year Goals:**
- 10 million active users globally
- 50+ supported languages (including low-resource languages)
- Partnerships with language learning institutions (Duolingo, Rosetta Stone)
- Become the default messaging app for international travelers and expat communities

**Differentiation from Competitors:**
- **vs. WhatsApp:** AI-native with translation built-in, not an afterthought
- **vs. Google Translate:** Conversational context, not just isolated phrases
- **vs. Duolingo:** Real-world immersion, not gamified lessons
- **Unique Position:** Only app that combines real-time messaging + translation + language learning in one seamless experience

---

## Appendix A: Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        iOS App (Swift/SwiftUI)              │
├─────────────────────────────────────────────────────────────┤
│  Views                  │  ViewModels        │  Services    │
│  - ConversationListView │  - ChatViewModel   │  - Firebase  │
│  - ChatView             │  - AuthViewModel   │  - Audio     │
│  - AIAssistantView      │  - AIViewModel     │  - Network   │
│  - ProfileView          │                    │              │
├─────────────────────────────────────────────────────────────┤
│  Local Storage: SwiftData (MessageEntity, UserEntity)       │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  Firestore (Real-time DB)  │  Cloud Functions (Node.js)    │
│  - conversations/          │  - translateMessage()          │
│  - messages/               │  - generateSmartReplies()      │
│  - users/                  │  - askAI()                     │
│  - translations/ (cache)   │  - sendNotification()          │
├─────────────────────────────────────────────────────────────┤
│  Firebase Auth  │  Cloud Storage  │  Cloud Messaging (FCM)  │
└─────────────────────────────────────────────────────────────┘
                            ↕ API Calls
┌─────────────────────────────────────────────────────────────┐
│                    External AI Services                      │
├─────────────────────────────────────────────────────────────┤
│  Google Cloud Translation API  │  OpenAI GPT-4 API          │
│  - Text translation            │  - Smart replies            │
│  - Language detection          │  - AI assistant responses   │
│  - Batch requests              │  - Context-aware generation │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix B: Firestore Data Schema

### Users Collection
```
users/{userId}
├── email: string
├── displayName: string
├── profilePictureURL: string
├── primaryLanguage: string (ISO 639-1)
├── secondaryLanguages: array<string> (max 2)
├── createdAt: timestamp
├── lastSeen: timestamp
├── fcmToken: string (for push notifications)
└── styleProfile: {
    formality: "casual" | "neutral" | "formal",
    avgLength: number,
    emojiFrequency: number,
    commonPhrases: array<string>
}
```

### Conversations Collection
```
conversations/{conversationId}
├── type: "one-on-one" | "group"
├── participants: array<userId>
├── participantLanguages: { userId: languageCode, ... }
├── createdAt: timestamp
├── lastMessageAt: timestamp
├── lastMessage: string (preview)
└── messages (subcollection)
    └── messages/{messageId}
        ├── senderId: userId
        ├── text: string (original)
        ├── timestamp: timestamp
        ├── status: "sending" | "sent" | "delivered" | "read"
        ├── translations: {
            en: string,
            es: string,
            zh: string,
            ...
        }
        ├── readBy: array<userId>
        └── mediaURL: string (optional, for images)
```

### Translation Cache Collection
```
translations/{cacheKey}
├── sourceText: string
├── sourceLanguage: string
├── targetLanguage: string
├── translatedText: string
├── createdAt: timestamp
└── usageCount: number

// cacheKey = SHA256(sourceText + sourceLanguage + targetLanguage)
```

### AI Assistant History Collection
```
aiChats/{userId}
└── queries (subcollection)
    └── queries/{queryId}
        ├── conversationId: string (context reference)
        ├── userQuery: string
        ├── aiResponse: string
        ├── timestamp: timestamp
        └── conversationContext: array<messageId> (RAG context)
```

---

## Appendix C: API Integration Specifications

### Google Cloud Translation API

**Endpoint:** `https://translation.googleapis.com/language/translate/v2`

**Request:**
```json
{
  "q": "Hello, how are you?",
  "source": "en",
  "target": "es",
  "format": "text"
}
```

**Response:**
```json
{
  "data": {
    "translations": [
      {
        "translatedText": "Hola, ¿cómo estás?",
        "detectedSourceLanguage": "en"
      }
    ]
  }
}
```

**Rate Limits:** 
- 5 million characters per month (free tier)
- 100 requests per second
- Cost: $20 per 1 million characters

**Caching Strategy:**
- Cache key: `SHA256(sourceText + sourceLang + targetLang)`
- TTL: Forever (translations don't change)
- Estimated cache hit rate: 90%

---

### OpenAI GPT-4 API

**Endpoint:** `https://api.openai.com/v1/chat/completions`

**Smart Replies Request:**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "Generate 3 reply suggestions based on conversation context. User style: casual, 8 words avg, 1 emoji per message."
    },
    {
      "role": "user",
      "content": "Conversation context: [last 10 messages]. Generate replies."
    }
  ],
  "max_tokens": 150,
  "temperature": 0.7
}
```

**AI Assistant Request:**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a language learning assistant. Answer questions about vocabulary, grammar, and cultural context."
    },
    {
      "role": "user",
      "content": "User question: What does 'che bello' mean? Context: [conversation snippet]"
    }
  ],
  "max_tokens": 200,
  "temperature": 0.5
}
```

**Rate Limits:**
- 10,000 requests per minute (paid tier)
- Cost: $0.03 per 1K input tokens, $0.06 per 1K output tokens

**Caching Strategy:**
- Cache smart replies for identical conversation contexts (1-hour TTL)
- Cache common AI assistant Q&A pairs (24-hour TTL)

---

## Appendix D: Testing Scenarios & Acceptance Criteria

### MVP Gate Testing (24 Hours)

**Scenario 1: Basic Messaging**
- User A sends "Hello" to User B
- ✅ Message appears in User A's chat within 200ms (optimistic UI)
- ✅ Message delivered to User B's device within 500ms
- ✅ User B sees "Hello" in English + translation in their language
- ✅ Message persists after force-quitting app

**Scenario 2: Offline/Online Sync**
- User A goes offline (airplane mode)
- User A sends 3 messages
- ✅ Messages appear in User A's chat with "sending" status
- User A goes online
- ✅ All 3 messages deliver within 2 seconds
- ✅ Status updates to "sent" → "delivered"

**Scenario 3: Group Chat**
- Create group with User A (English), User B (Spanish), User C (Italian)
- User A sends "Good morning"
- ✅ User B sees English + Spanish translation
- ✅ User C sees English + Italian translation
- ✅ All messages delivered within 1 second

**Scenario 4: Typing Indicators**
- User A starts typing
- ✅ User B sees "User A is typing..." within 200ms
- User A stops typing
- ✅ Indicator clears within 1 second

**Scenario 5: Read Receipts**
- User A sends message to User B
- User B opens conversation
- ✅ User A sees "delivered" → "read" status update
- ✅ Update happens within 2 seconds

---

### AI Features Testing (Days 3-7)

**Scenario 6: Audio Playback with Highlighting**
- User receives Italian message: "Ciao, come stai?"
- User taps audio button
- ✅ Audio playback starts within 500ms
- ✅ Words highlight in sync with speech (yellow background)
- ✅ Corresponding English words highlight simultaneously (blue background)
- User selects 0.75x speed
- ✅ Audio plays slower without distortion
- ✅ Word highlighting remains synced

**Scenario 7: AI Assistant Query**
- User opens AI assistant from Italian conversation
- User asks: "What does 'stai' mean?"
- ✅ AI responds within 3 seconds
- ✅ Response: "'Stai' is the informal 'you are' (from 'stare'). Used in 'come stai?' = 'how are you?'"
- ✅ Response references conversation context

**Scenario 8: Smart Replies**
- User receives message: "Vuoi andare al cinema stasera?" (Want to go to the cinema tonight?)
- User taps message input field
- ✅ 3 smart reply suggestions appear within 1.5 seconds
- ✅ Suggestions in both languages: 
  - "Sì, che ora?" / "Yes, what time?"
  - "Mi piacerebbe!" / "I'd love to!"
  - "Non posso stasera" / "I can't tonight"
- User taps first suggestion
- ✅ Message auto-fills input field
- ✅ User can edit before sending

**Scenario 9: Translation Caching**
- User A sends "Hello" to User B
- User C sends "Hello" to User D (different conversation)
- ✅ Second translation retrieves from cache (Firestore logs show cache hit)
- ✅ Second translation appears instantly (<100ms)

**Scenario 10: Error Handling**
- Simulate Google Translate API failure (disconnect server)
- User receives new message
- ✅ Original message displays
- ✅ "Translation Failed" icon appears
- ✅ User taps icon to retry manually
- Reconnect server
- ✅ Translation succeeds on retry

---

## Appendix E: Development Milestones

### Day 1 (24 Hours): MVP Gate

**Hours 1-4: Environment & Infrastructure**
- [x] Initialize Xcode project with SwiftUI
- [x] Install Firebase SDK via Swift Package Manager
- [x] Configure Firebase project (Firestore, Auth, Storage, FCM)
- [x] Set up SwiftData models (MessageEntity, UserEntity)
- [x] Test Firebase connection with "Hello World" write/read

**Hours 5-12: Core Messaging**
- [x] Implement Firebase Auth (email/password only)
- [x] Build user onboarding flow (name, profile pic, language selection)
- [x] Create conversation list view (SwiftUI List)
- [x] Create chat view with message bubbles
- [x] Implement send message → Firestore write
- [x] Implement real-time message listener (Firestore snapshot)

**Hours 13-20: Real-Time Features**
- [x] Optimistic UI updates (local insert before server confirmation)
- [x] Typing indicators (Firebase Realtime Database)
- [x] Read receipts (update message.readBy array)
- [x] Online/offline presence (Firestore presence document)

**Hours 21-24: Group Chat & Polish**
- [x] Group conversation creation (3+ participants)
- [x] Group message delivery to all participants
- [x] Basic push notifications (foreground only)
- [x] Message persistence test (force quit + reopen)

**MVP Demo Recording:**
- Show two devices (User A, User B) chatting in real-time
- Show typing indicators
- Show read receipts
- Show offline scenario (airplane mode → send message → reconnect)
- Show group chat with 3 participants

---

### Days 2-3: Translation Infrastructure

**Day 2 Morning: Google Cloud Translation Setup**
- [x] Create Google Cloud project
- [x] Enable Translation API
- [x] Create Cloud Function: `translateMessage()`
- [x] Implement Firestore trigger on new messages
- [x] Test translation: English → Spanish

**Day 2 Afternoon: Inline Translation UI**
- [x] Update message bubble UI to show original + translated text
- [x] Line-by-line display format (original line, translated line, spacing)
- [x] Translation caching in Firestore
- [x] Error handling UI ("Translation Failed" icon)

**Day 3: Multi-Language Support**
- [x] Add language dropdown to onboarding (10 languages)
- [x] Store user.primaryLanguage in Firestore
- [x] Update Cloud Function to detect target language per recipient
- [x] Test all language pairs (English ↔ Spanish, English ↔ Mandarin minimum)
- [x] Group chat per-user translations

---

### Days 4-5: Audio & AI Features

**Day 4: Audio Playback with Highlighting**
- [x] Implement AVSpeechSynthesizer wrapper class
- [x] Add audio button to message bubbles
- [x] Implement audio playback overlay (play/pause, speed controls)
- [x] Implement AVSpeechSynthesizerDelegate word boundary tracking
- [x] Implement word highlighting in SwiftUI (yellow/blue backgrounds)
- [x] Test synchronization between audio and highlights
- [x] Test all playback speeds (0.75x, 1x, 1.25x)

**Day 5: AI Assistant & Smart Replies**
- [x] Create AI assistant chat UI (dedicated view)
- [x] Create Cloud Function: `askAI()` (OpenAI GPT-4)
- [x] Implement RAG pipeline (retrieve last 20 messages as context)
- [x] Test AI assistant queries (vocabulary, grammar, cultural questions)
- [x] Create Cloud Function: `generateSmartReplies()`
- [x] Implement smart reply UI (pills above keyboard)
- [x] Implement user style profile tracking (formality, length, emojis)
- [x] Test smart reply suggestions (3 options in both languages)

---

### Days 6-7: Polish, Testing, Deployment

**Day 6: Final Features & Testing**
- [x] Implement conversation export (JSON download)
- [x] Implement account deletion flow
- [x] Add haptic feedback to key interactions
- [x] Implement Firebase Crashlytics
- [x] Run all testing scenarios (Appendix D)
- [x] Fix critical bugs identified in testing
- [x] Performance optimization (reduce Firestore reads, cache images)

**Day 7: Deployment & Documentation**
- [x] Create TestFlight build
- [x] Submit to TestFlight (allow 24 hours for review)
- [x] Write comprehensive README.md (setup instructions)
- [x] Record 5-7 minute demo video
  - Intro: Project overview
  - Core messaging demo (2 devices)
  - All 5 AI features with examples
  - Group chat demo
  - Offline scenario demo
- [x] Write Persona Brainlift (1-page document)
- [x] Create social media post (Twitter/LinkedIn)
- [x] Submit GitHub repo + video + TestFlight link

---

## Appendix F: Dependencies & Tools

### Development Environment
- **Xcode:** Version 15.0+ (for iOS 17 SDK)
- **macOS:** Ventura 13.0+ (required for Xcode 15)
- **Swift:** Version 5.9+
- **Git:** Version control

### iOS Frameworks
- **SwiftUI:** UI framework
- **SwiftData:** Local persistence (new in iOS 17)
- **Combine:** Reactive programming
- **AVFoundation:** Audio playback (AVSpeechSynthesizer)
- **UIKit:** Interop for image picker, notifications

### Firebase Services
- **Firebase SDK:** Version 10.18+
- **Firestore:** Real-time database
- **Firebase Auth:** User authentication
- **Cloud Functions:** Serverless backend (Node.js 18)
- **Cloud Storage:** Profile picture storage
- **Cloud Messaging (FCM):** Push notifications
- **Crashlytics:** Error reporting

### External APIs
- **Google Cloud Translation API:** Text translation
- **OpenAI API:** GPT-4 for AI features
- **API Key Management:** Stored in Cloud Functions environment variables

### Swift Package Dependencies
```swift
dependencies: [
    .package(url: "https://github.com/firebase/firebase-ios-sdk", from: "10.18.0")
]
```

### Testing Tools
- **XCTest:** Unit testing
- **Firebase Local Emulator Suite:** Local development/testing
- **Charles Proxy:** Network debugging (optional)
- **Xcode Instruments:** Performance profiling

### Deployment Tools
- **TestFlight:** Beta distribution
- **App Store Connect:** App management
- **Fastlane:** Automated deployment (optional, for CI/CD)

---

## Document Control

**Document Owner:** Product Manager  
**Technical Lead:** iOS Engineer  
**Stakeholders:** Gauntlet AI Review Team  
**Review Cycle:** Daily standup during 7-day sprint  
**Approval Required:** MVP gate checkpoint (24 hours)  

**Change Log:**
- **Version 1.0 (Oct 20, 2025):** Initial PRD created
- Platform decision finalized: Swift/SwiftUI (iOS)
- Backend decision finalized: Firebase
- All 12 constraint points locked in

**Next Steps:**
1. Technical lead reviews PRD for feasibility
2. Begin Day 1 development (environment setup)
3. Daily progress check against milestones (Appendix E)
4. Update PRD if critical blockers emerge

Version 1.1 (Oct 21, 2025):
Added “Cultural Insight RAG” functionality expanding AI Assistant scope to include linguistic and cultural context explanations.
Implementation: Firestore-based cultural_insights collection and updated askAI() Cloud Function prompt.
No architectural or stack changes.
Updated Developer Checklist accordingly.

---

**END OF DOCUMENT**

