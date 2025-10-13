# Slack Lite - Development Checklist
**Project:** Slack Lite (Dry Run Edition)  
**Timeline:** 2 Days  
**Last Updated:** October 10, 2025

---

## Overview

This checklist translates the PRD and architecture into concrete, testable sub-tasks. Each task includes acceptance criteria, dependencies, and testing expectations.

**Progress Tracking:**
- Total Tasks: 95
- Completed: 0
- In Progress: 0
- Remaining: 95

---

## Module 1: Environment Setup
**Timeline:** Day 1 Morning (30-45 minutes)  
**Objective:** Set up Supabase project, database, and development environment

### 1.1 Supabase Project Setup

- [ ] **Create Supabase project**
  - **Acceptance Criteria:** New Supabase project exists with project URL and keys
  - **Dependencies:** None
  - **Testing:** Can access Supabase dashboard
  - **Deliverables:** Project URL, anon key, service role key (saved securely)

- [ ] **Copy credentials to secure location**
  - **Acceptance Criteria:** Credentials stored in password manager or secure note
  - **Dependencies:** 1.1.1
  - **Testing:** Can retrieve credentials
  - **Deliverables:** Secure credential storage confirmed

### 1.2 Database Initialization

- [ ] **Run schema.sql in Supabase SQL Editor**
  - **Acceptance Criteria:** All tables created (users, channels, messages, channel_members, user_presence)
  - **Dependencies:** 1.1.1
  - **Testing:** Query `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
  - **Deliverables:** 5 tables visible in Supabase dashboard
  - **File:** `/docs/schema.sql`

- [ ] **Verify RLS enabled on all tables**
  - **Acceptance Criteria:** All 5 tables have RLS enabled
  - **Dependencies:** 1.2.1
  - **Testing:** Query `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
  - **Deliverables:** All tables show `rowsecurity = true`

- [ ] **Verify indexes created**
  - **Acceptance Criteria:** Indexes exist on messages and channels tables
  - **Dependencies:** 1.2.1
  - **Testing:** Query `SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`
  - **Deliverables:** `idx_messages_channel_created`, `idx_messages_user`, `idx_channels_name` visible

- [ ] **Seed #general channel**
  - **Acceptance Criteria:** #general channel exists with known UUID
  - **Dependencies:** 1.2.1
  - **Testing:** Query `SELECT * FROM channels WHERE name = 'general'`
  - **Deliverables:** #general channel record exists

- [ ] **Test RLS policies with test user**
  - **Acceptance Criteria:** Create test user, verify can only see own data
  - **Dependencies:** 1.2.2, 1.2.4
  - **Testing:** Sign in as test user, query tables via Supabase client
  - **Deliverables:** RLS policies enforce access control

### 1.3 Environment Configuration

- [ ] **Create .env.local file**
  - **Acceptance Criteria:** File exists with all required variables
  - **Dependencies:** 1.1.2
  - **Testing:** File readable, not committed to git
  - **Deliverables:** `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Create .env.example file**
  - **Acceptance Criteria:** Template file with placeholder values
  - **Dependencies:** 1.3.1
  - **Testing:** File committed to git
  - **Deliverables:** `.env.example` with variable names and descriptions

- [ ] **Implement config/env.ts with Zod validation**
  - **Acceptance Criteria:** Environment variables validated at runtime
  - **Dependencies:** 1.3.1
  - **Testing:** Start app, verify env validation works
  - **Deliverables:** `config/env.ts` exports validated env object
  - **File:** `config/env.ts`

### 1.4 Supabase Client Setup

- [ ] **Implement lib/supabase/client.ts (browser client)**
  - **Acceptance Criteria:** Singleton Supabase client for browser
  - **Dependencies:** 1.3.1
  - **Testing:** Import client, verify can query database
  - **Deliverables:** `lib/supabase/client.ts` exports `supabase` client
  - **File:** `lib/supabase/client.ts`

- [ ] **Implement lib/supabase/server.ts (server client)**
  - **Acceptance Criteria:** Server-side Supabase client with cookies
  - **Dependencies:** 1.3.1
  - **Testing:** Use in API route, verify auth works
  - **Deliverables:** `lib/supabase/server.ts` exports `createServerClient`
  - **File:** `lib/supabase/server.ts`

- [ ] **Generate TypeScript types from database**
  - **Acceptance Criteria:** Database types generated and saved
  - **Dependencies:** 1.2.1, 1.4.1
  - **Testing:** Import types, verify match database schema
  - **Deliverables:** `lib/supabase/types.ts` with generated types
  - **Command:** `npx supabase gen types typescript --project-id <project-id>`
  - **File:** `lib/supabase/types.ts`

- [ ] **Test Supabase connection**
  - **Acceptance Criteria:** Can query database from Next.js app
  - **Dependencies:** 1.4.1, 1.4.3
  - **Testing:** Create simple test page, query channels table
  - **Deliverables:** Successful database query from client

**Checkpoint 1A:** Environment configured, database initialized, Supabase connected ✅

---

## Module 2: Authentication
**Timeline:** Day 1 Morning (1.5 hours)  
**Objective:** Implement magic link authentication with onboarding

### 2.1 Authentication Components

- [ ] **Create app/(auth)/page.tsx login page**
  - **Acceptance Criteria:** Login page renders at `/` route
  - **Dependencies:** None
  - **Testing:** Navigate to `/`, see login page
  - **Deliverables:** `app/(auth)/page.tsx` with route group
  - **File:** `app/(auth)/page.tsx`

- [ ] **Implement components/auth/LoginForm.tsx**
  - **Acceptance Criteria:** Email input, submit button, loading state
  - **Dependencies:** 2.1.1
  - **Testing:** Enter email, click submit, verify UI updates
  - **Deliverables:** `components/auth/LoginForm.tsx` with email validation
  - **File:** `components/auth/LoginForm.tsx`

- [ ] **Add magic link send functionality**
  - **Acceptance Criteria:** Calls `supabase.auth.signInWithOtp()`
  - **Dependencies:** 2.1.2, 1.4.1
  - **Testing:** Submit email, check inbox for magic link
  - **Deliverables:** Magic link email sent successfully

- [ ] **Add success/error states to LoginForm**
  - **Acceptance Criteria:** Show "Check your email" or error message
  - **Dependencies:** 2.1.3
  - **Testing:** Submit valid/invalid email, verify messages
  - **Deliverables:** User feedback on login attempt

### 2.2 Authentication Flow

- [ ] **Create app/auth/callback/route.ts**
  - **Acceptance Criteria:** Handles magic link token exchange
  - **Dependencies:** 1.4.2
  - **Testing:** Click magic link, verify redirects to app
  - **Deliverables:** `app/auth/callback/route.ts` with token verification
  - **File:** `app/auth/callback/route.ts`

- [ ] **Implement redirect to /chat after auth**
  - **Acceptance Criteria:** Successful auth redirects to `/chat`
  - **Dependencies:** 2.2.1
  - **Testing:** Complete magic link flow, verify lands on /chat
  - **Deliverables:** Redirect logic in callback route

- [ ] **Implement lib/hooks/useAuth.ts**
  - **Acceptance Criteria:** Hook manages auth state and session
  - **Dependencies:** 1.4.1
  - **Testing:** Use hook in component, verify session updates
  - **Deliverables:** `lib/hooks/useAuth.ts` with `user`, `loading`, `login`, `logout`
  - **File:** `lib/hooks/useAuth.ts`

- [ ] **Add session persistence across refreshes**
  - **Acceptance Criteria:** Refresh page, user still authenticated
  - **Dependencies:** 2.2.3
  - **Testing:** Login, refresh browser, verify still logged in
  - **Deliverables:** Supabase session restored on page load

### 2.3 User Onboarding

- [ ] **Create components/auth/OnboardingModal.tsx**
  - **Acceptance Criteria:** Modal with display name input
  - **Dependencies:** None (UI component)
  - **Testing:** Open modal, enter name, submit
  - **Deliverables:** `components/auth/OnboardingModal.tsx` with form
  - **File:** `components/auth/OnboardingModal.tsx`

- [ ] **Add display name validation**
  - **Acceptance Criteria:** 1-50 chars, no special characters
  - **Dependencies:** 2.3.1
  - **Testing:** Try invalid names, verify errors shown
  - **Deliverables:** Client-side validation with error messages

- [ ] **Implement display name save to database**
  - **Acceptance Criteria:** UPDATE users SET display_name WHERE id
  - **Dependencies:** 2.3.2, 1.4.1
  - **Testing:** Submit name, verify saved in users table
  - **Deliverables:** Display name persisted in database

- [ ] **Add onboarding check on /chat load**
  - **Acceptance Criteria:** Show modal if display_name is null
  - **Dependencies:** 2.3.1, 2.2.3
  - **Testing:** Login as new user, verify modal appears
  - **Deliverables:** Conditional modal display logic

- [ ] **Auto-join new user to #general**
  - **Acceptance Criteria:** INSERT into channel_members on first login
  - **Dependencies:** 2.3.3, 1.2.4
  - **Testing:** New user logs in, verify member of #general
  - **Deliverables:** Auto-join logic in onboarding flow

### 2.4 Authentication Testing

- [ ] **Write unit tests for useAuth hook**
  - **Acceptance Criteria:** Test login, logout, session state
  - **Dependencies:** 2.2.3
  - **Testing:** Run `pnpm test`, verify tests pass
  - **Deliverables:** `lib/hooks/useAuth.test.ts` with 80%+ coverage
  - **File:** `lib/hooks/useAuth.test.ts`

- [ ] **Write E2E test for magic link flow**
  - **Acceptance Criteria:** Test full login flow in Playwright
  - **Dependencies:** 2.2.2, 2.3.4
  - **Testing:** Run `pnpm test:e2e`, verify passes
  - **Deliverables:** `tests/e2e/auth.spec.ts` with login flow
  - **File:** `tests/e2e/auth.spec.ts`

- [ ] **Test onboarding flow end-to-end**
  - **Acceptance Criteria:** New user sees modal, enters name, proceeds to chat
  - **Dependencies:** 2.4.2
  - **Testing:** E2E test for first-time user
  - **Deliverables:** Onboarding test in `tests/e2e/auth.spec.ts`

**Checkpoint 1B:** Authentication working, users can log in and set display name ✅

---

## Module 3: Channels
**Timeline:** Day 1 Afternoon (1 hour)  
**Objective:** Implement channel list, creation, and switching

### 3.1 Channel Components

- [ ] **Create components/channels/ChannelList.tsx**
  - **Acceptance Criteria:** Renders list of accessible channels
  - **Dependencies:** None (UI component)
  - **Testing:** Display with mock data
  - **Deliverables:** `components/channels/ChannelList.tsx` with map over channels
  - **File:** `components/channels/ChannelList.tsx`

- [ ] **Create components/channels/ChannelItem.tsx**
  - **Acceptance Criteria:** Single channel row with name, active state
  - **Dependencies:** 3.1.1
  - **Testing:** Click channel, verify active state updates
  - **Deliverables:** `components/channels/ChannelItem.tsx` with click handler
  - **File:** `components/channels/ChannelItem.tsx`

- [ ] **Create components/channels/ChannelSidebar.tsx**
  - **Acceptance Criteria:** Container with ChannelList + create button
  - **Dependencies:** 3.1.1
  - **Testing:** Render sidebar, verify layout
  - **Deliverables:** `components/channels/ChannelSidebar.tsx` with layout
  - **File:** `components/channels/ChannelSidebar.tsx`

- [ ] **Create components/channels/ChannelCreateModal.tsx**
  - **Acceptance Criteria:** Modal with name, description, privacy inputs
  - **Dependencies:** None (UI component)
  - **Testing:** Open modal, fill form, submit
  - **Deliverables:** `components/channels/ChannelCreateModal.tsx` with form
  - **File:** `components/channels/ChannelCreateModal.tsx`

### 3.2 Channel Logic

- [ ] **Implement lib/hooks/useChannels.ts**
  - **Acceptance Criteria:** Hook fetches channels, creates, switches
  - **Dependencies:** 1.4.1
  - **Testing:** Call hook methods, verify database updates
  - **Deliverables:** `lib/hooks/useChannels.ts` with CRUD operations
  - **File:** `lib/hooks/useChannels.ts`

- [ ] **Add fetch channels query (public + user's private)**
  - **Acceptance Criteria:** SELECT channels WHERE is_private=false OR member
  - **Dependencies:** 3.2.1
  - **Testing:** Query returns #general and user's channels
  - **Deliverables:** `fetchChannels()` function in useChannels

- [ ] **Add create channel mutation**
  - **Acceptance Criteria:** INSERT into channels, auto-join creator
  - **Dependencies:** 3.2.1
  - **Testing:** Create channel, verify appears in list
  - **Deliverables:** `createChannel()` function in useChannels

- [ ] **Add auto-join logic for public channels**
  - **Acceptance Criteria:** Clicking public channel auto-joins if not member
  - **Dependencies:** 3.2.1
  - **Testing:** Click public channel, verify joined
  - **Deliverables:** `joinChannel()` function in useChannels

- [ ] **Add channel switching logic**
  - **Acceptance Criteria:** Set currentChannelId in Zustand store
  - **Dependencies:** 3.2.1, 4.1.1 (Zustand store)
  - **Testing:** Click channel, verify currentChannelId updates
  - **Deliverables:** `switchChannel()` function in useChannels

- [ ] **Add validation for channel names**
  - **Acceptance Criteria:** 1-50 chars, alphanumeric + hyphens/underscores
  - **Dependencies:** 3.2.3
  - **Testing:** Try invalid names, verify errors
  - **Deliverables:** Validation in ChannelCreateModal

### 3.3 Channel Testing

- [ ] **Write unit tests for useChannels hook**
  - **Acceptance Criteria:** Test fetch, create, switch operations
  - **Dependencies:** 3.2.1
  - **Testing:** Run `pnpm test`, verify tests pass
  - **Deliverables:** `lib/hooks/useChannels.test.ts` with 80%+ coverage
  - **File:** `lib/hooks/useChannels.test.ts`

- [ ] **Write E2E test for channel creation**
  - **Acceptance Criteria:** Create channel, verify appears in list
  - **Dependencies:** 3.2.3, 3.1.4
  - **Testing:** Run `pnpm test:e2e`, verify passes
  - **Deliverables:** `tests/e2e/channels.spec.ts` with create flow
  - **File:** `tests/e2e/channels.spec.ts`

- [ ] **Write E2E test for channel switching**
  - **Acceptance Criteria:** Switch channels, verify message area updates
  - **Dependencies:** 3.2.5
  - **Testing:** E2E test for channel switch
  - **Deliverables:** Channel switch test in `tests/e2e/channels.spec.ts`

**Checkpoint 1C:** Channels working, users can create and switch channels ✅

---

## Module 4: Messaging
**Timeline:** Day 1 Afternoon (2 hours)  
**Objective:** Implement real-time messaging with optimistic updates

### 4.1 State Management

- [ ] **Create lib/store/chat-store.ts with Zustand**
  - **Acceptance Criteria:** Store with messageCache, currentChannelId, user
  - **Dependencies:** None
  - **Testing:** Import store, read/write state
  - **Deliverables:** `lib/store/chat-store.ts` with ChatStore interface
  - **File:** `lib/store/chat-store.ts`

- [ ] **Add messageCache structure (Record<channelId, Message[]>)**
  - **Acceptance Criteria:** Store messages per channel
  - **Dependencies:** 4.1.1
  - **Testing:** Add messages, verify cached by channel
  - **Deliverables:** `messageCache` state and actions

- [ ] **Add Zustand actions (addMessage, updateMessage, deleteMessage)**
  - **Acceptance Criteria:** Actions mutate messageCache correctly
  - **Dependencies:** 4.1.2
  - **Testing:** Call actions, verify state updates
  - **Deliverables:** Store actions for message CRUD

- [ ] **Add connection status tracking**
  - **Acceptance Criteria:** isConnected, isRealtimeConnected flags
  - **Dependencies:** 4.1.1
  - **Testing:** Toggle flags, verify UI updates
  - **Deliverables:** Connection state in store

### 4.2 Message Components

- [ ] **Create components/chat/MessageList.tsx**
  - **Acceptance Criteria:** Scrollable list of messages
  - **Dependencies:** None (UI component)
  - **Testing:** Render with mock messages
  - **Deliverables:** `components/chat/MessageList.tsx` with scroll container
  - **File:** `components/chat/MessageList.tsx`

- [ ] **Create components/chat/MessageItem.tsx**
  - **Acceptance Criteria:** Display user, content, timestamp, edited indicator
  - **Dependencies:** 4.2.1
  - **Testing:** Render message, verify all fields shown
  - **Deliverables:** `components/chat/MessageItem.tsx` memoized component
  - **File:** `components/chat/MessageItem.tsx`

- [ ] **Create components/chat/MessageInput.tsx**
  - **Acceptance Criteria:** Text input + send button, Enter to send
  - **Dependencies:** None (UI component)
  - **Testing:** Type message, click send/press Enter
  - **Deliverables:** `components/chat/MessageInput.tsx` with validation
  - **File:** `components/chat/MessageInput.tsx`

- [ ] **Add message content validation (1-2000 chars)**
  - **Acceptance Criteria:** Trim whitespace, reject empty/too long
  - **Dependencies:** 4.2.3
  - **Testing:** Try invalid messages, verify errors
  - **Deliverables:** Client-side validation in MessageInput

- [ ] **Create components/chat/MessageActions.tsx**
  - **Acceptance Criteria:** Edit/delete buttons shown on hover for own messages
  - **Dependencies:** 4.2.2
  - **Testing:** Hover message, verify buttons appear
  - **Deliverables:** `components/chat/MessageActions.tsx` with auth check
  - **File:** `components/chat/MessageActions.tsx`

- [ ] **Create components/chat/MessageArea.tsx container**
  - **Acceptance Criteria:** Contains MessageList + MessageInput
  - **Dependencies:** 4.2.1, 4.2.3
  - **Testing:** Render area, verify layout
  - **Deliverables:** `components/chat/MessageArea.tsx` with flex layout
  - **File:** `components/chat/MessageArea.tsx`

### 4.3 Message Logic & Real-Time

- [ ] **Implement lib/hooks/useMessages.ts**
  - **Acceptance Criteria:** Hook manages messages, optimistic updates, realtime
  - **Dependencies:** 1.4.1, 4.1.1
  - **Testing:** Send message, verify optimistic update then confirmation
  - **Deliverables:** `lib/hooks/useMessages.ts` with full message lifecycle
  - **File:** `lib/hooks/useMessages.ts`

- [ ] **Add sendMessage with optimistic update**
  - **Acceptance Criteria:** Add to cache with temp ID, then INSERT to DB
  - **Dependencies:** 4.3.1
  - **Testing:** Send message, verify instant UI update
  - **Deliverables:** `sendMessage()` with optimistic logic

- [ ] **Add rollback on send failure**
  - **Acceptance Criteria:** If INSERT fails, remove from cache or mark failed
  - **Dependencies:** 4.3.2
  - **Testing:** Simulate network error, verify rollback
  - **Deliverables:** Error handling with retry option

- [ ] **Add editMessage mutation**
  - **Acceptance Criteria:** UPDATE message SET content, updated_at
  - **Dependencies:** 4.3.1
  - **Testing:** Edit message, verify updated in DB and cache
  - **Deliverables:** `editMessage()` function

- [ ] **Add deleteMessage mutation**
  - **Acceptance Criteria:** Hard DELETE from messages table
  - **Dependencies:** 4.3.1
  - **Testing:** Delete message, verify removed from DB and cache
  - **Deliverables:** `deleteMessage()` function

- [ ] **Implement real-time subscription to messages**
  - **Acceptance Criteria:** Subscribe to postgres_changes on messages table
  - **Dependencies:** 4.3.1, 1.4.1
  - **Testing:** Open two browsers, send message, verify appears in both
  - **Deliverables:** Realtime subscription in useMessages

- [ ] **Add subscription cleanup on channel switch**
  - **Acceptance Criteria:** Unsubscribe from old channel on switch
  - **Dependencies:** 4.3.6
  - **Testing:** Switch channels, verify old subscription removed
  - **Deliverables:** useEffect cleanup in useMessages

- [ ] **Add fetch last 50 messages on channel load**
  - **Acceptance Criteria:** SELECT messages ORDER BY created_at DESC LIMIT 50
  - **Dependencies:** 4.3.1
  - **Testing:** Load channel, verify 50 messages fetched
  - **Deliverables:** `fetchMessages()` function in useMessages

- [ ] **Filter out own optimistic messages from realtime**
  - **Acceptance Criteria:** Don't duplicate optimistic message on INSERT event
  - **Dependencies:** 4.3.6
  - **Testing:** Send message, verify no duplicate
  - **Deliverables:** Deduplication logic in realtime handler

### 4.4 Message Testing

- [ ] **Write unit tests for useMessages hook**
  - **Acceptance Criteria:** Test send, edit, delete, optimistic updates
  - **Dependencies:** 4.3.1
  - **Testing:** Run `pnpm test`, verify tests pass
  - **Deliverables:** `lib/hooks/useMessages.test.ts` with 80%+ coverage
  - **File:** `lib/hooks/useMessages.test.ts`

- [ ] **Write unit tests for Zustand chat-store**
  - **Acceptance Criteria:** Test all store actions
  - **Dependencies:** 4.1.1
  - **Testing:** Run `pnpm test`, verify tests pass
  - **Deliverables:** `lib/store/chat-store.test.ts`
  - **File:** `lib/store/chat-store.test.ts`

- [ ] **Write E2E test for sending messages**
  - **Acceptance Criteria:** Send message, verify appears in list
  - **Dependencies:** 4.3.2, 4.2.3
  - **Testing:** Run `pnpm test:e2e`, verify passes
  - **Deliverables:** `tests/e2e/messaging.spec.ts` with send flow
  - **File:** `tests/e2e/messaging.spec.ts`

- [ ] **Write E2E test for editing messages**
  - **Acceptance Criteria:** Edit message, verify "(edited)" indicator
  - **Dependencies:** 4.3.4, 4.2.5
  - **Testing:** E2E test for edit flow
  - **Deliverables:** Edit test in `tests/e2e/messaging.spec.ts`

- [ ] **Write E2E test for deleting messages**
  - **Acceptance Criteria:** Delete message, verify removed from UI
  - **Dependencies:** 4.3.5
  - **Testing:** E2E test for delete flow
  - **Deliverables:** Delete test in `tests/e2e/messaging.spec.ts`

- [ ] **Write two-browser real-time test**
  - **Acceptance Criteria:** User A sends, User B receives within 200ms
  - **Dependencies:** 4.3.6
  - **Testing:** Playwright with two contexts, measure latency
  - **Deliverables:** `tests/e2e/realtime.spec.ts` with latency check
  - **File:** `tests/e2e/realtime.spec.ts`

**Checkpoint 1D:** Real-time messaging working in #general channel ✅

---

## Module 5: Layout & UI
**Timeline:** Day 1 Afternoon (1 hour)  
**Objective:** Build ChatLayout and UI primitives

### 5.1 Main Layout

- [ ] **Create app/(chat)/page.tsx**
  - **Acceptance Criteria:** Chat page at /chat route with auth guard
  - **Dependencies:** 2.2.3 (useAuth)
  - **Testing:** Navigate to /chat, verify auth required
  - **Deliverables:** `app/(chat)/page.tsx` with conditional rendering
  - **File:** `app/(chat)/page.tsx`

- [ ] **Create components/layout/ChatLayout.tsx**
  - **Acceptance Criteria:** 3-panel layout (sidebar | messages | presence)
  - **Dependencies:** 3.1.3, 4.2.6, 7.2.1 (components)
  - **Testing:** Render layout, verify 3 panels visible
  - **Deliverables:** `components/layout/ChatLayout.tsx` with responsive grid
  - **File:** `components/layout/ChatLayout.tsx`

- [ ] **Add responsive design (desktop-first, mobile-friendly)**
  - **Acceptance Criteria:** Layout works on desktop and mobile
  - **Dependencies:** 5.1.2
  - **Testing:** Resize browser, verify layout adapts
  - **Deliverables:** TailwindCSS breakpoints in ChatLayout

### 5.2 UI Primitives

- [ ] **Create components/ui/Button.tsx**
  - **Acceptance Criteria:** Primary, secondary, danger variants
  - **Dependencies:** None
  - **Testing:** Render all variants, verify styles
  - **Deliverables:** `components/ui/Button.tsx` with variant prop
  - **File:** `components/ui/Button.tsx`

- [ ] **Create components/ui/Input.tsx**
  - **Acceptance Criteria:** Text input with validation states
  - **Dependencies:** None
  - **Testing:** Render with error, verify error styles
  - **Deliverables:** `components/ui/Input.tsx` with error prop
  - **File:** `components/ui/Input.tsx`

- [ ] **Create components/ui/Modal.tsx**
  - **Acceptance Criteria:** Reusable modal with backdrop, close button
  - **Dependencies:** None
  - **Testing:** Open/close modal, verify backdrop click closes
  - **Deliverables:** `components/ui/Modal.tsx` with onClose callback
  - **File:** `components/ui/Modal.tsx`

- [ ] **Create components/ui/Toast.tsx**
  - **Acceptance Criteria:** Toast notification system
  - **Dependencies:** None
  - **Testing:** Show toast, verify auto-dismisses after 3s
  - **Deliverables:** `components/ui/Toast.tsx` with timeout
  - **File:** `components/ui/Toast.tsx`

- [ ] **Create components/ui/Avatar.tsx**
  - **Acceptance Criteria:** User avatar with initials fallback
  - **Dependencies:** None
  - **Testing:** Render with/without image, verify initials shown
  - **Deliverables:** `components/ui/Avatar.tsx` with fallback
  - **File:** `components/ui/Avatar.tsx`

- [ ] **Create components/ui/Spinner.tsx**
  - **Acceptance Criteria:** Loading spinner component
  - **Dependencies:** None
  - **Testing:** Render spinner, verify animation
  - **Deliverables:** `components/ui/Spinner.tsx` with CSS animation
  - **File:** `components/ui/Spinner.tsx`

### 5.3 Styling

- [ ] **Configure TailwindCSS theme**
  - **Acceptance Criteria:** Custom colors, fonts, spacing
  - **Dependencies:** None
  - **Testing:** Use custom theme values, verify styles apply
  - **Deliverables:** `tailwind.config.ts` with custom theme
  - **File:** `tailwind.config.ts`

- [ ] **Add global styles in app/globals.css**
  - **Acceptance Criteria:** Base styles, reset, utility classes
  - **Dependencies:** None
  - **Testing:** Check styles apply globally
  - **Deliverables:** `app/globals.css` with custom styles
  - **File:** `app/globals.css`

### 5.4 UI Testing

- [ ] **Test responsive design on mobile**
  - **Acceptance Criteria:** Layout works on phone/tablet
  - **Dependencies:** 5.1.3
  - **Testing:** Manual test on mobile device or DevTools
  - **Deliverables:** Mobile-friendly UI confirmed

- [ ] **Test all UI primitives render correctly**
  - **Acceptance Criteria:** All components in Storybook or test page
  - **Dependencies:** 5.2.1-5.2.6
  - **Testing:** Visual regression or manual check
  - **Deliverables:** UI component tests passing

**Checkpoint 1E:** ChatLayout complete, UI looks professional ✅

---

## Module 6: Private Channels
**Timeline:** Day 2 Morning (1.5 hours)  
**Objective:** Implement private channels with membership management

### 6.1 Private Channel Logic

- [ ] **Add is_private toggle to ChannelCreateModal**
  - **Acceptance Criteria:** Checkbox or toggle for privacy setting
  - **Dependencies:** 3.1.4
  - **Testing:** Create private channel, verify is_private=true
  - **Deliverables:** Privacy toggle in create modal

- [ ] **Update createChannel to handle private channels**
  - **Acceptance Criteria:** Set is_private flag, auto-add creator as member
  - **Dependencies:** 6.1.1, 3.2.3
  - **Testing:** Create private channel, verify creator is member
  - **Deliverables:** Private channel creation logic

- [ ] **Filter channel list to show only accessible channels**
  - **Acceptance Criteria:** Query returns public + user's private channels
  - **Dependencies:** 3.2.2
  - **Testing:** Create private channel as User A, verify User B can't see it
  - **Deliverables:** RLS-enforced channel query

- [ ] **Add member invitation logic**
  - **Acceptance Criteria:** Channel creator can add members
  - **Dependencies:** 6.1.2
  - **Testing:** Invite user to private channel, verify they can access
  - **Deliverables:** `inviteMember()` function in useChannels

### 6.2 RLS Policy Testing

- [ ] **Test RLS: users can't see private channels they're not in**
  - **Acceptance Criteria:** Query as User B, don't see User A's private channel
  - **Dependencies:** 6.1.3, 1.2.5
  - **Testing:** Create test users, verify isolation
  - **Deliverables:** RLS test in integration suite

- [ ] **Test RLS: users can't read messages from private channels**
  - **Acceptance Criteria:** Query messages, RLS blocks non-members
  - **Dependencies:** 6.2.1
  - **Testing:** Try to query messages as non-member, verify fails
  - **Deliverables:** Message RLS test

- [ ] **Test RLS: only channel creator can invite members**
  - **Acceptance Criteria:** Non-creator can't INSERT into channel_members
  - **Dependencies:** 6.1.4
  - **Testing:** Try to invite as non-creator, verify fails
  - **Deliverables:** Membership RLS test

### 6.3 Private Channel Testing

- [ ] **Write E2E test for private channel creation**
  - **Acceptance Criteria:** Create private channel, verify not visible to others
  - **Dependencies:** 6.1.2
  - **Testing:** Run `pnpm test:e2e`, verify passes
  - **Deliverables:** Private channel test in `tests/e2e/channels.spec.ts`

- [ ] **Write E2E test for member invitation**
  - **Acceptance Criteria:** Invite user, verify they can access channel
  - **Dependencies:** 6.1.4
  - **Testing:** Two-user E2E test
  - **Deliverables:** Invitation test in `tests/e2e/channels.spec.ts`

**Checkpoint 2A:** Private channels working with RLS enforcement ✅

---

## Module 7: Presence
**Timeline:** Day 2 Morning (1.5 hours)  
**Objective:** Implement user presence tracking with heartbeat

### 7.1 Presence Components

- [ ] **Create components/presence/UserPresencePanel.tsx**
  - **Acceptance Criteria:** Container for online users list
  - **Dependencies:** None (UI component)
  - **Testing:** Render panel, verify layout
  - **Deliverables:** `components/presence/UserPresencePanel.tsx`
  - **File:** `components/presence/UserPresencePanel.tsx`

- [ ] **Create components/presence/UserPresenceList.tsx**
  - **Acceptance Criteria:** List of users with online/offline status
  - **Dependencies:** 7.1.1
  - **Testing:** Render with mock users, verify list
  - **Deliverables:** `components/presence/UserPresenceList.tsx`
  - **File:** `components/presence/UserPresenceList.tsx`

- [ ] **Create components/presence/UserPresenceItem.tsx**
  - **Acceptance Criteria:** User name + green/gray indicator
  - **Dependencies:** 7.1.2
  - **Testing:** Render with online/offline, verify colors
  - **Deliverables:** `components/presence/UserPresenceItem.tsx`
  - **File:** `components/presence/UserPresenceItem.tsx`

### 7.2 Presence Logic

- [ ] **Implement lib/hooks/usePresence.ts**
  - **Acceptance Criteria:** Hook manages presence with heartbeat
  - **Dependencies:** 1.4.1, 4.1.1
  - **Testing:** Login, verify online status set
  - **Deliverables:** `lib/hooks/usePresence.ts` with heartbeat
  - **File:** `lib/hooks/usePresence.ts`

- [ ] **Add setOnline on login**
  - **Acceptance Criteria:** UPSERT user_presence SET online=true
  - **Dependencies:** 7.2.1
  - **Testing:** Login, verify user_presence record created
  - **Deliverables:** `setOnline()` function in usePresence

- [ ] **Add setOffline on logout**
  - **Acceptance Criteria:** UPDATE user_presence SET online=false
  - **Dependencies:** 7.2.1
  - **Testing:** Logout, verify online=false
  - **Deliverables:** `setOffline()` function in usePresence

- [ ] **Implement 30-second heartbeat**
  - **Acceptance Criteria:** setInterval updates last_seen every 30s
  - **Dependencies:** 7.2.2
  - **Testing:** Login, wait 30s, verify last_seen updated
  - **Deliverables:** Heartbeat interval in usePresence

- [ ] **Add heartbeat cleanup on unmount/logout**
  - **Acceptance Criteria:** clearInterval when user leaves or logs out
  - **Dependencies:** 7.2.4
  - **Testing:** Logout, verify interval cleared
  - **Deliverables:** Cleanup in useEffect return

- [ ] **Debounce heartbeat updates (5 seconds)**
  - **Acceptance Criteria:** Don't update more than once per 5s
  - **Dependencies:** 7.2.4
  - **Testing:** Verify max update frequency
  - **Deliverables:** Debounced heartbeat function

### 7.3 Presence Real-Time

- [ ] **Subscribe to user_presence table updates**
  - **Acceptance Criteria:** Listen for UPDATE events on user_presence
  - **Dependencies:** 7.2.1, 1.4.1
  - **Testing:** User logs in/out, verify event received
  - **Deliverables:** Realtime subscription in usePresence

- [ ] **Update Zustand onlineUsers set on presence change**
  - **Acceptance Criteria:** Add/remove users from onlineUsers Set
  - **Dependencies:** 7.3.1, 4.1.1
  - **Testing:** User goes online/offline, verify Set updates
  - **Deliverables:** Presence event handler

- [ ] **Render online users in UserPresencePanel**
  - **Acceptance Criteria:** Display users from onlineUsers Set
  - **Dependencies:** 7.3.2, 7.1.2
  - **Testing:** Multiple users online, verify all shown
  - **Deliverables:** Connected UserPresencePanel component

### 7.4 Presence Testing

- [ ] **Write unit tests for usePresence hook**
  - **Acceptance Criteria:** Test setOnline, setOffline, heartbeat
  - **Dependencies:** 7.2.1
  - **Testing:** Run `pnpm test`, verify tests pass
  - **Deliverables:** `lib/hooks/usePresence.test.ts` with 80%+ coverage
  - **File:** `lib/hooks/usePresence.test.ts`

- [ ] **Write E2E test for presence tracking**
  - **Acceptance Criteria:** User logs in, appears online; logs out, goes offline
  - **Dependencies:** 7.2.2, 7.2.3
  - **Testing:** Run `pnpm test:e2e`, verify passes
  - **Deliverables:** `tests/e2e/presence.spec.ts`
  - **File:** `tests/e2e/presence.spec.ts`

- [ ] **Write multi-user presence test**
  - **Acceptance Criteria:** Two users, verify each sees the other online
  - **Dependencies:** 7.3.3
  - **Testing:** Playwright with two contexts
  - **Deliverables:** Multi-user test in `tests/e2e/presence.spec.ts`

**Checkpoint 2B:** Presence tracking working with real-time updates ✅

---

## Module 8: Polish & Error Handling
**Timeline:** Day 2 Morning (1 hour)  
**Objective:** Add loading states, error handling, and final UX polish

### 8.1 Loading States

- [ ] **Add loading spinner to MessageList while fetching**
  - **Acceptance Criteria:** Show Spinner when loading messages
  - **Dependencies:** 4.2.1, 5.2.6
  - **Testing:** Load channel, verify spinner shown
  - **Deliverables:** Loading state in MessageList

- [ ] **Add loading state to LoginForm**
  - **Acceptance Criteria:** Disable button, show spinner during auth
  - **Dependencies:** 2.1.2
  - **Testing:** Submit login, verify loading state
  - **Deliverables:** Loading state in LoginForm

- [ ] **Add loading state to ChannelCreateModal**
  - **Acceptance Criteria:** Show spinner while creating channel
  - **Dependencies:** 3.1.4
  - **Testing:** Create channel, verify loading state
  - **Deliverables:** Loading state in ChannelCreateModal

### 8.2 Error Handling

- [ ] **Create app/error.tsx global error boundary**
  - **Acceptance Criteria:** Catch page-level errors, show friendly message
  - **Dependencies:** None
  - **Testing:** Throw error, verify error page shown
  - **Deliverables:** `app/error.tsx` with error UI
  - **File:** `app/error.tsx`

- [ ] **Add error boundaries to feature components**
  - **Acceptance Criteria:** Wrap ChatLayout, MessageArea in error boundaries
  - **Dependencies:** 8.2.1
  - **Testing:** Trigger component error, verify graceful failure
  - **Deliverables:** Error boundaries in critical components

- [ ] **Implement Toast notification system**
  - **Acceptance Criteria:** Global toast provider, show success/error toasts
  - **Dependencies:** 5.2.4
  - **Testing:** Trigger toast, verify appears and dismisses
  - **Deliverables:** Toast provider in root layout

- [ ] **Add error handling for failed message sends**
  - **Acceptance Criteria:** Show toast on send failure, offer retry
  - **Dependencies:** 8.2.3, 4.3.3
  - **Testing:** Simulate network error, verify toast + retry
  - **Deliverables:** Error handling in useMessages

- [ ] **Add error handling for auth failures**
  - **Acceptance Criteria:** Show toast for invalid email, expired link
  - **Dependencies:** 8.2.3, 2.1.4
  - **Testing:** Try invalid email, verify error message
  - **Deliverables:** Error handling in LoginForm

### 8.3 UX Polish

- [ ] **Add message timestamps with formatting**
  - **Acceptance Criteria:** Show "just now", "5m ago", or "Apr 10, 3:45 PM"
  - **Dependencies:** 4.2.2
  - **Testing:** Send messages, verify timestamp updates
  - **Deliverables:** Timestamp formatter in utils

- [ ] **Add "(edited)" indicator to edited messages**
  - **Acceptance Criteria:** Show small text next to edited messages
  - **Dependencies:** 4.2.2, 4.3.4
  - **Testing:** Edit message, verify indicator shown
  - **Deliverables:** Conditional rendering in MessageItem

- [ ] **Add empty state for channels with no messages**
  - **Acceptance Criteria:** Show "No messages yet" when channel empty
  - **Dependencies:** 4.2.1
  - **Testing:** Create new channel, verify empty state
  - **Deliverables:** Empty state in MessageList

- [ ] **Implement sign-out button**
  - **Acceptance Criteria:** Button calls supabase.auth.signOut()
  - **Dependencies:** 2.2.3
  - **Testing:** Click sign out, verify redirected to login
  - **Deliverables:** Sign-out button in ChatLayout header

- [ ] **Add auto-scroll to bottom on new messages**
  - **Acceptance Criteria:** MessageList scrolls down when new message arrives
  - **Dependencies:** 4.2.1
  - **Testing:** Receive message, verify scrolls to bottom
  - **Deliverables:** Auto-scroll logic in MessageList

- [ ] **Add optimistic UI for channel creation**
  - **Acceptance Criteria:** Channel appears in list immediately
  - **Dependencies:** 3.2.3
  - **Testing:** Create channel, verify instant feedback
  - **Deliverables:** Optimistic update in useChannels

**Checkpoint 2C:** UI polished, errors handled gracefully ✅

---

## Module 9: Testing Infrastructure
**Timeline:** Day 2 Afternoon (2 hours)  
**Objective:** Set up comprehensive testing suite

### 9.1 Unit Testing Setup

- [ ] **Install and configure Vitest**
  - **Acceptance Criteria:** vitest.config.ts configured, can run tests
  - **Dependencies:** None
  - **Testing:** Run `pnpm test`, verify Vitest runs
  - **Deliverables:** `vitest.config.ts`, test script in package.json
  - **File:** `vitest.config.ts`

- [ ] **Write tests for lib/utils.ts**
  - **Acceptance Criteria:** Test all utility functions
  - **Dependencies:** 9.1.1
  - **Testing:** Run tests, verify 80%+ coverage
  - **Deliverables:** `lib/utils.test.ts`
  - **File:** `lib/utils.test.ts`

- [ ] **Verify all hook tests passing (already written)**
  - **Acceptance Criteria:** useAuth, useMessages, useChannels, usePresence tests pass
  - **Dependencies:** 2.4.1, 3.3.1, 4.4.1, 7.4.1
  - **Testing:** Run `pnpm test`, verify all pass
  - **Deliverables:** All hook tests green

### 9.2 E2E Testing Setup

- [ ] **Install and configure Playwright**
  - **Acceptance Criteria:** playwright.config.ts configured, can run E2E tests
  - **Dependencies:** None
  - **Testing:** Run `pnpm test:e2e`, verify Playwright runs
  - **Deliverables:** `playwright.config.ts`, E2E script in package.json
  - **File:** `playwright.config.ts`

- [ ] **Verify all E2E tests passing (already written)**
  - **Acceptance Criteria:** auth, messaging, channels, presence tests pass
  - **Dependencies:** 2.4.2, 3.3.2, 4.4.3, 7.4.2
  - **Testing:** Run `pnpm test:e2e`, verify all pass
  - **Deliverables:** All E2E tests green

### 9.3 Performance Testing

- [ ] **Write 10+ concurrent users test**
  - **Acceptance Criteria:** 10 browser contexts, all send/receive messages
  - **Dependencies:** 9.2.1, 4.4.6
  - **Testing:** Run test, verify no errors
  - **Deliverables:** `tests/e2e/performance.spec.ts`
  - **File:** `tests/e2e/performance.spec.ts`

- [ ] **Measure message latency (<200ms)**
  - **Acceptance Criteria:** Timestamp on send vs receive, log latency
  - **Dependencies:** 9.3.1, 4.4.6
  - **Testing:** Run test, verify <200ms average
  - **Deliverables:** Latency measurement in realtime test

- [ ] **Test real-time reconnection**
  - **Acceptance Criteria:** Disconnect network, verify reconnects within 2s
  - **Dependencies:** 9.2.1
  - **Testing:** Manual test with DevTools network throttling
  - **Deliverables:** Reconnection confirmed working

### 9.4 Manual QA

- [ ] **Run smoke test checklist**
  - **Acceptance Criteria:** Login → Send message → Logout works
  - **Dependencies:** All previous modules
  - **Testing:** Manual flow test
  - **Deliverables:** Smoke test passing

- [ ] **Test cross-browser (Chrome, Firefox, Safari)**
  - **Acceptance Criteria:** App works in all 3 browsers
  - **Dependencies:** All previous modules
  - **Testing:** Manual test in each browser
  - **Deliverables:** Cross-browser compatibility confirmed

- [ ] **Test on mobile device**
  - **Acceptance Criteria:** Basic functionality works on phone
  - **Dependencies:** 5.1.3
  - **Testing:** Test on real device or emulator
  - **Deliverables:** Mobile functionality confirmed

- [ ] **Test edge cases (long messages, special chars, empty channels)**
  - **Acceptance Criteria:** No crashes or UI breaks
  - **Dependencies:** All previous modules
  - **Testing:** Manual edge case testing
  - **Deliverables:** Edge cases handled gracefully

**Checkpoint 2D:** All tests passing, app is stable ✅

---

## Module 10: Deployment
**Timeline:** Day 2 Afternoon (1.5 hours)  
**Objective:** Deploy to Vercel and verify production works

### 10.1 Deployment Setup

- [ ] **Connect GitHub repo to Vercel**
  - **Acceptance Criteria:** Vercel project linked to repo
  - **Dependencies:** None (external)
  - **Testing:** Push commit, verify Vercel builds
  - **Deliverables:** Vercel project created

- [ ] **Configure environment variables in Vercel**
  - **Acceptance Criteria:** NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY set
  - **Dependencies:** 10.1.1, 1.3.1
  - **Testing:** Deploy, verify env vars available
  - **Deliverables:** Production env vars configured

- [ ] **Set up separate preview and production environments**
  - **Acceptance Criteria:** Preview deploys for branches, production for main
  - **Dependencies:** 10.1.1
  - **Testing:** Create branch, verify preview deploy
  - **Deliverables:** Environment separation configured

### 10.2 Production Deployment

- [ ] **Deploy to production**
  - **Acceptance Criteria:** Push to main, Vercel deploys automatically
  - **Dependencies:** 10.1.2
  - **Testing:** Visit production URL, verify loads
  - **Deliverables:** Live production URL

- [ ] **Test auth flow in production**
  - **Acceptance Criteria:** Magic link works, can log in
  - **Dependencies:** 10.2.1
  - **Testing:** Login on production, verify works
  - **Deliverables:** Production auth working

- [ ] **Test real-time messaging in production**
  - **Acceptance Criteria:** Two users can chat in real-time
  - **Dependencies:** 10.2.1
  - **Testing:** Open two browsers on production URL
  - **Deliverables:** Production real-time working

- [ ] **Verify no console errors in production**
  - **Acceptance Criteria:** Open DevTools, check console
  - **Dependencies:** 10.2.1
  - **Testing:** Navigate app, verify no errors logged
  - **Deliverables:** Clean console in production

### 10.3 Performance Verification

- [ ] **Run Lighthouse audit**
  - **Acceptance Criteria:** Score >80 on Performance
  - **Dependencies:** 10.2.1
  - **Testing:** Run Lighthouse in Chrome DevTools
  - **Deliverables:** Lighthouse report with scores

- [ ] **Test with 10+ concurrent users**
  - **Acceptance Criteria:** Open 10 browser tabs, send messages
  - **Dependencies:** 10.2.3
  - **Testing:** Manual stress test
  - **Deliverables:** App handles 10+ users without issues

- [ ] **Measure message latency in production**
  - **Acceptance Criteria:** <200ms from send to receive
  - **Dependencies:** 10.2.3
  - **Testing:** Two-browser test with network timeline
  - **Deliverables:** Latency measurement <200ms

- [ ] **Verify page load time <3 seconds**
  - **Acceptance Criteria:** Initial page load completes quickly
  - **Dependencies:** 10.2.1
  - **Testing:** Network tab in DevTools
  - **Deliverables:** Page load time measured

### 10.4 Production Fixes

- [ ] **Fix any production-specific bugs**
  - **Acceptance Criteria:** All critical bugs resolved
  - **Dependencies:** 10.2.1-10.3.4
  - **Testing:** Retest after fixes
  - **Deliverables:** Production app stable

- [ ] **Verify all features work in production**
  - **Acceptance Criteria:** Auth, channels, messaging, presence all functional
  - **Dependencies:** 10.4.1
  - **Testing:** Full manual QA in production
  - **Deliverables:** Production feature checklist complete

**Checkpoint 2E:** App deployed, production working perfectly ✅

---

## Module 11: Documentation
**Timeline:** Day 2 Afternoon (30 minutes)  
**Objective:** Complete documentation and retrospective

### 11.1 README

- [ ] **Update README with project overview**
  - **Acceptance Criteria:** Clear description of project and features
  - **Dependencies:** None
  - **Testing:** Read README, verify complete
  - **Deliverables:** Updated `README.md`
  - **File:** `README.md`

- [ ] **Add tech stack section**
  - **Acceptance Criteria:** List all technologies used
  - **Dependencies:** 11.1.1
  - **Testing:** Verify accuracy
  - **Deliverables:** Tech stack in README

- [ ] **Add setup instructions**
  - **Acceptance Criteria:** Step-by-step setup guide
  - **Dependencies:** 11.1.1
  - **Testing:** Follow instructions, verify work
  - **Deliverables:** Setup instructions in README

- [ ] **Document environment variables**
  - **Acceptance Criteria:** List all required env vars with descriptions
  - **Dependencies:** 11.1.3
  - **Testing:** Verify completeness
  - **Deliverables:** Env vars documented in README

- [ ] **Add live demo URL**
  - **Acceptance Criteria:** Link to production deployment
  - **Dependencies:** 10.2.1
  - **Testing:** Click link, verify works
  - **Deliverables:** Live URL in README

- [ ] **Add testing instructions**
  - **Acceptance Criteria:** How to run unit and E2E tests
  - **Dependencies:** 11.1.1
  - **Testing:** Follow instructions, verify work
  - **Deliverables:** Testing section in README

### 11.2 Retrospective

- [ ] **Create docs/retro.md**
  - **Acceptance Criteria:** Retrospective document exists
  - **Dependencies:** None
  - **Testing:** File exists and is readable
  - **Deliverables:** `docs/retro.md` created
  - **File:** `docs/retro.md`

- [ ] **Document what worked well (technical)**
  - **Acceptance Criteria:** List technical wins (Supabase Realtime, Zustand, etc.)
  - **Dependencies:** 11.2.1
  - **Testing:** Review for completeness
  - **Deliverables:** Technical successes documented

- [ ] **Document what worked well (workflow)**
  - **Acceptance Criteria:** List process successes (checkpoints, planning, etc.)
  - **Dependencies:** 11.2.1
  - **Testing:** Review for completeness
  - **Deliverables:** Workflow successes documented

- [ ] **Document technical blockers**
  - **Acceptance Criteria:** List challenges faced (auth, RLS, performance, etc.)
  - **Dependencies:** 11.2.1
  - **Testing:** Review for accuracy
  - **Deliverables:** Technical blockers documented

- [ ] **Document workflow friction**
  - **Acceptance Criteria:** List process inefficiencies
  - **Dependencies:** 11.2.1
  - **Testing:** Review for accuracy
  - **Deliverables:** Workflow friction documented

- [ ] **Document lessons learned for Gauntlet Week 1**
  - **Acceptance Criteria:** Actionable insights for future projects
  - **Dependencies:** 11.2.2-11.2.5
  - **Testing:** Review for usefulness
  - **Deliverables:** Lessons learned section

- [ ] **Add metrics (dev time, test coverage, performance)**
  - **Acceptance Criteria:** Concrete numbers on project outcomes
  - **Dependencies:** 11.2.1
  - **Testing:** Verify accuracy
  - **Deliverables:** Metrics section with data

**Final Checkpoint:** Documentation complete, project delivered! 🎉

---

## Summary

### Total Tasks: 95

**By Module:**
- Module 1 (Environment Setup): 13 tasks
- Module 2 (Authentication): 17 tasks
- Module 3 (Channels): 14 tasks
- Module 4 (Messaging): 25 tasks
- Module 5 (Layout & UI): 13 tasks
- Module 6 (Private Channels): 9 tasks
- Module 7 (Presence): 16 tasks
- Module 8 (Polish & Error Handling): 16 tasks
- Module 9 (Testing Infrastructure): 12 tasks
- Module 10 (Deployment): 14 tasks
- Module 11 (Documentation): 13 tasks

**By Timeline:**
- Day 1 Morning: Modules 1-2 (30 tasks)
- Day 1 Afternoon: Modules 3-5 (52 tasks total, ~35 Day 1 PM)
- Day 2 Morning: Modules 6-8 (41 tasks)
- Day 2 Afternoon: Modules 9-11 (39 tasks)

**Critical Path:**
1. Environment Setup → Auth → Channels → Messaging (Day 1)
2. Private Channels → Presence → Polish (Day 2 Morning)
3. Testing → Deployment → Documentation (Day 2 Afternoon)

**Key Milestones:**
- ✅ Checkpoint 1A: Environment ready
- ✅ Checkpoint 1B: Auth working
- ✅ Checkpoint 1C: Channels functional
- ✅ Checkpoint 1D: Real-time messaging works
- ✅ Checkpoint 1E: UI complete
- ✅ Checkpoint 2A: Private channels with RLS
- ✅ Checkpoint 2B: Presence tracking
- ✅ Checkpoint 2C: UI polished
- ✅ Checkpoint 2D: Tests passing
- ✅ Checkpoint 2E: Production deployed
- 🎉 Final: Documentation complete

---

**Next Steps:**
1. Review this checklist with the team
2. Begin Module 1: Environment Setup
3. Update progress regularly
4. Use checkpoints for stability verification
5. Adjust timeline if blockers arise

**References:**
- PRD: `/docs/requirements/slack-lite-dry-run-prd.md`
- Architecture: `/docs/architecture.md`
- Database Schema: `/docs/schema.sql`

