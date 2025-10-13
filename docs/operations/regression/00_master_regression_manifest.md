# 🧭 Master Regression Manifest
## Slack Lite - Dry Run Edition

**Project:** Slack Lite (Dry Run Edition)  
**Version:** 1.0  
**Created:** October 10, 2025  
**Last Updated:** October 10, 2025 (Post Phase 04)  
**Status:** ACTIVE

---

## Overview

This document defines **all regression testing expectations** across the project lifecycle for Slack Lite.

**Purpose:**
- Identify features introduced by each phase
- Specify which prior systems must remain functional after new development
- Define critical integration points and dependencies
- Provide systematic regression testing guidance for all phases

**Usage:**
- Reference this manifest at the start of each phase's debug validation
- Use phase-specific sections to generate regression checklists
- Update only when project structure or phase definitions change
- Link from debug documents to confirm regression coverage

**This manifest defines WHAT must be verified, not WHAT was verified.**  
Actual regression test outcomes are documented in per-phase debug reports.

---

## Phase Summary Table

| Phase | Status | Core Features Introduced | Regression Scope | Dependencies |
|-------|--------|--------------------------|------------------|--------------|
| **01: Environment** | ✅ Complete | Supabase, database schema, config | None (baseline) | None |
| **02: Authentication** | ✅ Complete | Magic link, onboarding, user profiles | Phase 01: DB accessible | Phase 01 |
| **03: Channels** | ✅ Complete | List, create, switch channels | Phase 01: DB, Phase 02: Auth | Phase 01, 02 |
| **04: Messaging** | ✅ Complete | Real-time messaging, CRUD, optimistic UI | Phase 01: DB, Phase 02: Auth, Phase 03: Channels | Phase 01, 02, 03 |
| **05: Layout & UI** | 🔜 Planned | ChatLayout, UI primitives, responsive | All prior phases, especially 03 & 04 UI | Phase 01-04 |
| **06: Private Channels** | 🔜 Planned | Private channels, membership, RLS | Phase 03: Public channels, Phase 04: Messaging | Phase 01-04 |
| **07: Presence** | 🔜 Planned | Online/offline status, heartbeat | Phase 02: Auth sessions, Phase 04: Real-time | Phase 01, 02, 04 |
| **08: Polish** | 🔜 Planned | Error handling, loading states, UX polish | All features from Phases 02-07 | Phase 01-07 |
| **09: Testing** | 🔜 Planned | Unit, integration, E2E test suites | ALL phases - comprehensive coverage | Phase 01-08 |
| **10: Deployment** | 🔜 Planned | Vercel production deploy, env config | All features in production environment | Phase 01-09 |
| **11: Documentation** | 🔜 Planned | README, setup guide, retrospective | All features documented accurately | Phase 01-10 |

**Total Phases:** 11  
**Completed:** 4 (36%)  
**Remaining:** 7 (64%)

---

## Phase Details

### Phase 01: Environment Setup

**Phase Number:** 01  
**Module:** Module 1 - Environment Setup  
**Status:** ✅ Complete  
**Timeline:** Day 1 Morning (30-45 minutes)

#### Introduced Features

**Infrastructure:**
- ✅ Supabase project created and configured
- ✅ Database schema deployed (users, channels, messages, channel_members, user_presence)
- ✅ RLS policies enabled on all tables
- ✅ Indexes created for performance (messages, channels)
- ✅ #general channel pre-seeded

**Configuration:**
- ✅ Environment variables (.env.local)
- ✅ Supabase clients (browser, server)
- ✅ TypeScript types generated from database
- ✅ Next.js 15 project initialized

**Files Created:**
- `config/env.ts` - Environment validation
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/types.ts` - Generated database types

#### Regression Scope

**None** - This is the baseline phase.

All subsequent phases depend on Phase 01 remaining stable.

#### Dependencies

**External:**
- Supabase project (cloud service)
- Next.js 15 framework
- Node.js 18+ environment

**Internal:**
- None (foundation phase)

#### Critical Validation Points

**Database Accessibility:**
- [ ] Can connect to Supabase from browser client
- [ ] Can connect to Supabase from server client
- [ ] All 5 tables exist and queryable
- [ ] RLS policies active and enforcing

**Schema Integrity:**
- [ ] users table has correct columns
- [ ] channels table has correct columns
- [ ] messages table has correct columns
- [ ] channel_members table has correct columns
- [ ] user_presence table has correct columns
- [ ] All foreign key relationships intact

**Build System:**
- [ ] Next.js app compiles without errors
- [ ] TypeScript types resolve correctly
- [ ] Environment variables load properly

---

### Phase 02: Authentication

**Phase Number:** 02  
**Module:** Module 2 - Authentication  
**Status:** ✅ Complete  
**Timeline:** Day 1 Morning (1.5 hours)

#### Introduced Features

**Authentication System:**
- ✅ Magic link email authentication (Supabase Auth)
- ✅ Email input and validation
- ✅ Magic link callback handler
- ✅ Session management and persistence
- ✅ Protected route pattern (/chat requires auth)
- ✅ Redirect logic (auth → /chat, unauth → /)

**User Onboarding:**
- ✅ First-time user detection (display_name check)
- ✅ Onboarding modal with display name input
- ✅ Display name validation (1-50 chars)
- ✅ User profile creation/update in database
- ✅ Auto-join to #general channel

**User Management:**
- ✅ useAuth hook (user, loading, logout)
- ✅ User session state management
- ✅ Logout functionality
- ✅ User email display in header

**Files Created:**
- `app/(auth)/page.tsx` - Login page
- `app/auth/callback/route.ts` - Auth callback handler
- `components/auth/LoginForm.tsx` - Email input form
- `components/auth/OnboardingModal.tsx` - Display name setup
- `lib/hooks/useAuth.ts` - Authentication hook
- `lib/hooks/useAuth.test.ts` - Auth tests (exists)

#### Regression Scope

**Phase 01 (Environment):**
- [ ] Database connection still works
- [ ] Supabase clients functional
- [ ] Environment variables loading
- [ ] TypeScript compilation clean

**Database Operations:**
- [ ] Can query users table
- [ ] Can insert user profiles
- [ ] Can update display_name
- [ ] RLS policies enforcing correctly

#### Dependencies

**Phase 01:**
- Supabase Auth configured
- users table exists
- Database clients available

**External:**
- Email delivery service (for magic links)
- Supabase Auth service

#### Critical Validation Points

**Authentication Flow:**
- [ ] User can enter email on login page
- [ ] Magic link email sent (check inbox or logs)
- [ ] Clicking magic link redirects to /chat
- [ ] Session created and accessible
- [ ] Protected routes enforce authentication

**Onboarding Flow:**
- [ ] First-time user sees onboarding modal
- [ ] Can enter display name
- [ ] Display name saves to database
- [ ] Modal closes after completion
- [ ] User proceeds to chat interface

**Session Management:**
- [ ] Session persists across browser refreshes
- [ ] User email displayed in header
- [ ] Logout button visible and functional
- [ ] Logout clears session and redirects to /

**Database Integrity:**
- [ ] User record created in users table
- [ ] User ID matches auth.users (Supabase Auth)
- [ ] Display name persisted correctly
- [ ] Timestamps (created_at) populated

**Console & Errors:**
- [ ] No console errors during auth flow
- [ ] No TypeScript errors in auth components
- [ ] Error states handle invalid email gracefully

---

### Phase 03: Channels

**Phase Number:** 03  
**Module:** Module 3 - Channels  
**Status:** ✅ Complete  
**Timeline:** Day 1 Afternoon (1 hour)

#### Introduced Features

**Channel Management:**
- ✅ Channel list display (public channels)
- ✅ Channel creation with modal form
- ✅ Channel name validation (1-50 chars, alphanumeric + hyphens/underscores)
- ✅ Channel description (optional)
- ✅ Privacy setting (public/private flag)
- ✅ Auto-join creator to new channel

**Channel State:**
- ✅ useChannels hook (fetch, create, switch)
- ✅ Active channel tracking (activeChannelId, now in Zustand as of Phase 04)
- ✅ Channel switching with visual feedback
- ✅ Loading states while fetching channels
- ✅ Error handling for channel operations

**UI Components:**
- ✅ ChannelSidebar - Container with header
- ✅ ChannelList - Maps channels with empty state
- ✅ ChannelItem - Individual channel row with active state
- ✅ ChannelCreateModal - Form with validation
- ✅ Chat page layout - Sidebar + main content area

**Database Operations:**
- ✅ Fetch public channels (WHERE is_private=false)
- ✅ Create channel (INSERT into channels)
- ✅ Auto-join creator (INSERT into channel_members)
- ✅ Duplicate name detection

**Files Created:**
- `lib/hooks/useChannels.ts` - Channel management hook
- `components/channels/ChannelSidebar.tsx`
- `components/channels/ChannelList.tsx`
- `components/channels/ChannelItem.tsx`
- `components/channels/ChannelCreateModal.tsx`

#### Regression Scope

**Phase 01 (Environment):**
- [ ] Database schema unchanged (channels, channel_members tables)
- [ ] Supabase connection stable
- [ ] Build process still clean

**Phase 02 (Authentication):**
- [ ] Login flow still works
- [ ] User session persists
- [ ] useAuth hook still provides user data
- [ ] Onboarding modal still appears for new users
- [ ] Logout button still functional
- [ ] User email still displayed in header

**Integration Points:**
- [ ] Authenticated user can access /chat
- [ ] User ID used for created_by and channel_members
- [ ] No auth-related console errors

#### Dependencies

**Phase 01:**
- channels table with correct schema
- channel_members table
- Database clients functional

**Phase 02:**
- User authenticated (useAuth provides user.id)
- User profile exists (display_name, email)
- Protected route pattern working

#### Critical Validation Points

**Channel Display:**
- [ ] Navigate to /chat (requires auth from Phase 02)
- [ ] Channel list displays on left sidebar
- [ ] #general appears in list (pre-seeded)
- [ ] Channels sorted alphabetically
- [ ] Loading spinner shows while fetching

**Channel Creation:**
- [ ] Click "Create Channel" button (+ icon)
- [ ] Modal opens with form fields
- [ ] Enter channel name (e.g., "engineering")
- [ ] Enter description (optional)
- [ ] Set privacy (public/private toggle)
- [ ] Click "Create"
- [ ] Modal closes on success
- [ ] New channel appears in list
- [ ] New channel automatically selected (active state)

**Channel Switching:**
- [ ] Click different channel in list
- [ ] Active indicator moves (indigo background)
- [ ] Previous channel becomes inactive (gray background)
- [ ] Main content area updates
- [ ] No console errors on switch

**Validation & Error Handling:**
- [ ] Empty name rejected with error message
- [ ] Special characters rejected (e.g., "test!")
- [ ] Spaces in name rejected (e.g., "test channel")
- [ ] Duplicate name rejected with clear error
- [ ] Error messages clear and actionable
- [ ] Create button disabled for invalid input

**Database Integrity:**
- [ ] Channel record created in channels table
- [ ] created_by matches current user ID
- [ ] is_private flag set correctly
- [ ] channel_members entry created for creator
- [ ] Name stored as lowercase
- [ ] Timestamps populated correctly

**Phase 02 Integration:**
- [ ] Only authenticated users can create channels
- [ ] User ID from Phase 02 used correctly
- [ ] Session from Phase 02 still valid

---

### Phase 04: Messaging

**Phase Number:** 04  
**Module:** Module 4 - Messaging  
**Status:** ✅ Complete  
**Timeline:** Day 1 Afternoon (2 hours)

#### Introduced Features

**State Management:**
- ✅ Zustand global store (chat-store.ts)
- ✅ Message caching per channel (Record<channelId, Message[]>)
- ✅ Connection status tracking (isConnected, isRealtimeConnected)
- ✅ activeChannelId migrated from React state to Zustand

**Message Operations:**
- ✅ Send messages with optimistic updates
- ✅ Edit own messages with "(edited)" indicator
- ✅ Delete own messages (hard delete from database)
- ✅ Fetch last 50 messages on channel load
- ✅ Message content validation (1-2000 characters)

**Real-Time Features:**
- ✅ Supabase Realtime subscription to messages table
- ✅ INSERT event handler (new messages)
- ✅ UPDATE event handler (edited messages)
- ✅ DELETE event handler (deleted messages)
- ✅ Deduplication logic (prevents duplicate optimistic messages)
- ✅ Subscription cleanup on channel switch

**UI Components:**
- ✅ MessageArea - Container with header
- ✅ MessageList - Scrollable list with auto-scroll
- ✅ MessageItem - Avatar, content, timestamp, actions
- ✅ MessageInput - Auto-resize textarea with validation
- ✅ MessageActions - Edit/delete buttons on hover

**UX Features:**
- ✅ User avatars with initials
- ✅ Timestamp formatting (relative & absolute)
- ✅ Status indicators (sending, sent, failed)
- ✅ Auto-scroll to bottom (smart detection)
- ✅ Empty state ("No messages yet")
- ✅ Loading states while fetching
- ✅ Keyboard shortcuts (Enter, Shift+Enter)
- ✅ Character count display
- ✅ Error handling with retry option

**Files Created:**
- `lib/store/chat-store.ts` - Zustand store
- `lib/hooks/useMessages.ts` - Message operations + real-time
- `components/chat/MessageArea.tsx`
- `components/chat/MessageList.tsx`
- `components/chat/MessageItem.tsx`
- `components/chat/MessageInput.tsx`
- `components/chat/MessageActions.tsx`

**Files Modified:**
- `lib/hooks/useChannels.ts` - Migrated to Zustand
- `app/chat/page.tsx` - Integrated MessageArea

#### Regression Scope

**Phase 01 (Environment):**
- [ ] Database connection still works
- [ ] messages table accessible and queryable
- [ ] Indexes still present (idx_messages_channel_created)
- [ ] RLS policies on messages table enforcing correctly
- [ ] Build process clean (no new TypeScript errors)

**Phase 02 (Authentication):**
- [ ] Login flow still works (magic link)
- [ ] User session persists across refreshes
- [ ] useAuth hook provides correct user data (id, email)
- [ ] Onboarding modal still appears for new users
- [ ] Logout button functional
- [ ] User email displayed in header
- [ ] Protected routes still enforce authentication
- [ ] No auth-related console errors

**Phase 03 (Channels):**
- [ ] Channel list still displays correctly
- [ ] Can still create new channels
- [ ] Channel creation modal works
- [ ] Channel switching works (now with Zustand)
- [ ] Active channel indicator shows correctly
- [ ] useChannels hook still exposes activeChannelId
- [ ] Channel sidebar visible and functional
- [ ] Can switch between #general, #engineering, #marketing
- [ ] Validation still works (channel names)
- [ ] Database integration intact (channels, channel_members)

**Zustand Migration (Phase 03 → 04):**
- [ ] activeChannelId migration didn't break channel switching
- [ ] Channel state still accessible
- [ ] No breaking changes to useChannels API
- [ ] Backward compatibility maintained

**Integration Points:**
- [ ] User from Phase 02 works in messaging
- [ ] Channels from Phase 03 work with messages
- [ ] Message filtering by channel ID works
- [ ] Channel switching loads correct messages

#### Dependencies

**Phase 01:**
- messages table with proper schema
- users table for display_name JOIN
- channel_members for membership verification
- Supabase Realtime enabled

**Phase 02:**
- User authenticated (user.id for message ownership)
- User profile with display_name (for message display)
- Session management (for real-time subscriptions)

**Phase 03:**
- Channel list available (useChannels hook)
- activeChannelId tracking (now in Zustand)
- User is member of channels (for sending messages)
- Channel switching triggers message load

#### Critical Validation Points

**Message Sending:**
- [ ] Navigate to /chat (requires Phase 02 auth)
- [ ] Select a channel (requires Phase 03 channels)
- [ ] Type message in input field
- [ ] Click Send (or press Enter)
- [ ] Message appears instantly in list (optimistic update)
- [ ] User avatar shows with initials
- [ ] Display name shown ("Matt" or user's name)
- [ ] Timestamp shows "just now"
- [ ] Message persists after refresh
- [ ] Message saved in database (query Supabase)

**Real-Time Messaging (Two-Browser Test):**
- [ ] Open Browser A: http://localhost:3000/chat
- [ ] Open Browser B (incognito): http://localhost:3000/chat
- [ ] Both log in (can be same user)
- [ ] Both select #general channel
- [ ] Browser A: Send "Real-time test"
- [ ] Browser B: Message appears within 1-2 seconds
- [ ] Verify bidirectional sync (Browser B → Browser A)
- [ ] No duplicate messages in sender's view
- [ ] Console shows real-time subscription logs

**Message Editing:**
- [ ] Hover over own message
- [ ] Edit button appears
- [ ] Click Edit
- [ ] Enter new content in prompt dialog
- [ ] Message content updates
- [ ] "(edited)" indicator appears next to timestamp
- [ ] Edit propagates in real-time to other browsers
- [ ] updated_at timestamp changes in database

**Message Deletion:**
- [ ] Hover over own message
- [ ] Delete button appears
- [ ] Click Delete
- [ ] Confirm deletion dialog
- [ ] Message removed from UI instantly
- [ ] Message removed from other browsers in real-time
- [ ] Hard delete from database (record gone, not soft delete)

**Multi-Channel Behavior:**
- [ ] Send message in #general
- [ ] Switch to #engineering (Phase 03 functionality)
- [ ] Verify #general message NOT shown
- [ ] Send message in #engineering
- [ ] Switch back to #general
- [ ] Verify only #general messages shown
- [ ] Messages isolated to correct channels
- [ ] Console shows unsubscribe logs on channel switch

**UI/UX Features:**
- [ ] Auto-scroll to bottom on new message
- [ ] Auto-scroll disabled when user scrolls up
- [ ] Empty state shown for channels with no messages
- [ ] Loading spinner shown while fetching messages
- [ ] Timestamp formats correctly ("just now", "5m ago", full)
- [ ] Enter key sends message
- [ ] Shift+Enter creates new line
- [ ] Character count displayed (when >1800 chars)
- [ ] Send button disabled for empty input
- [ ] Send button disabled for >2000 chars

**Error Handling:**
- [ ] Failed message shows "Failed to send" with retry
- [ ] Network offline handled gracefully
- [ ] Invalid content shows validation error
- [ ] Error messages clear and user-friendly

**Performance:**
- [ ] Optimistic update feels instant (<50ms)
- [ ] Real-time latency <500ms (target <200ms)
- [ ] No lag when switching channels
- [ ] Smooth scroll animations
- [ ] No memory leaks (subscription cleanup working)

**Database Integrity:**
- [ ] Messages in database with correct channel_id
- [ ] user_id references correct user
- [ ] content stored correctly
- [ ] message_type = 'user' for all messages
- [ ] created_at and updated_at populated
- [ ] updated_at > created_at for edited messages

#### Technical Dependencies

**Zustand Store:**
- [ ] chat-store.ts exports useChatStore
- [ ] messageCache structure correct
- [ ] currentChannelId accessible
- [ ] All 8 actions functional

**Real-Time Subscription:**
- [ ] Subscription establishes on channel load
- [ ] INSERT/UPDATE/DELETE events firing
- [ ] Cleanup prevents multiple subscriptions
- [ ] Console logs visible for debugging

---

### Phase 05: Layout & UI

**Phase Number:** 05  
**Module:** Module 5 - Layout & UI  
**Status:** 🔜 Planned  
**Timeline:** Day 1 Afternoon (1 hour)

#### Introduced Features (Planned)

**Layout Components:**
- ChatLayout.tsx - 3-panel design (sidebar | messages | presence)
- Responsive design (desktop-first, mobile-friendly)
- Header with app title and user info

**UI Primitives:**
- Button.tsx - Primary, secondary, danger variants
- Input.tsx - Text input with validation states
- Modal.tsx - Reusable modal with backdrop
- Toast.tsx - Notification system
- Avatar.tsx - User avatar with fallback
- Spinner.tsx - Loading indicator
- Dropdown.tsx - Menu component

**Styling:**
- TailwindCSS theme configuration
- Custom colors, fonts, spacing
- Global styles and utilities
- Design system foundation

#### Regression Scope

**Phase 01 (Environment):**
- [ ] Build process still works with new components
- [ ] TailwindCSS configuration intact

**Phase 02 (Authentication):**
- [ ] Login flow unaffected by UI changes
- [ ] Onboarding modal still works (or replaced with new Modal.tsx)
- [ ] User session display still correct

**Phase 03 (Channels):**
- [ ] Channel sidebar still visible in new layout
- [ ] Channel list still renders correctly
- [ ] Channel creation modal works (or replaced with new Modal.tsx)
- [ ] Channel switching still functional
- [ ] Active channel indicator still shows

**Phase 04 (Messaging):**
- [ ] MessageArea still displays in new layout
- [ ] Send messages still works
- [ ] Edit/delete still functional
- [ ] Real-time messaging unaffected
- [ ] Optimistic updates still instant
- [ ] All message UI features intact

**UI Consistency:**
- [ ] New UI primitives don't break existing components
- [ ] Button.tsx compatible with existing button patterns
- [ ] Input.tsx compatible with existing inputs
- [ ] Modal.tsx works for channel creation and onboarding
- [ ] Colors and styling consistent across all components

#### Dependencies

**Phase 01-04:**
- All prior features must work within new layout
- TailwindCSS from Phase 01
- Components from Phases 02-04 must integrate with UI primitives

#### Critical Validation Points

**Layout Integration:**
- [ ] 3-panel layout displays correctly
- [ ] Sidebar, message area, and presence panel all visible
- [ ] Responsive design works (resize browser window)
- [ ] Mobile layout functional (if implemented)

**UI Primitive Replacement:**
- [ ] Old modals replaced with new Modal.tsx (or still working)
- [ ] Buttons updated to use Button.tsx (or still working)
- [ ] Inputs updated to use Input.tsx (or still working)
- [ ] No visual regressions

**Cross-Phase Flow:**
- [ ] Login (Phase 02) → Channel list (Phase 03) → Messages (Phase 04) all working
- [ ] UI changes don't break functionality
- [ ] All interactive elements still responsive

---

### Phase 06: Private Channels

**Phase Number:** 06  
**Module:** Module 6 - Private Channels  
**Status:** 🔜 Planned  
**Timeline:** Day 2 Morning (1.5 hours)

#### Introduced Features (Planned)

**Private Channel Logic:**
- is_private toggle in channel creation modal
- Private channel creation (is_private=true)
- Channel visibility filtering (public + user's private)
- Member invitation system
- Membership management

**RLS Enhancements:**
- Private channel visibility restricted to members
- Non-members cannot see private channels
- Non-members cannot read messages from private channels
- Only channel creator can invite members

**Database Operations:**
- Enhanced channel query (public OR member)
- Member invitation (INSERT into channel_members)
- Membership verification before message access

#### Regression Scope

**Phase 01 (Environment):**
- [ ] Database schema supports is_private flag
- [ ] RLS policies still enforcing correctly
- [ ] No RLS policy conflicts

**Phase 02 (Authentication):**
- [ ] Auth still works
- [ ] User session stable
- [ ] Logout functional

**Phase 03 (Public Channels):** ← **CRITICAL REGRESSION**
- [ ] Public channels still visible to all users
- [ ] Can still create public channels (is_private=false)
- [ ] Public channel switching still works
- [ ] #general still accessible
- [ ] Public channel creation unaffected

**Phase 04 (Messaging):**
- [ ] Can send messages in public channels
- [ ] Can send messages in private channels (if member)
- [ ] Cannot send messages in private channels (if not member) - RLS blocks
- [ ] Real-time messaging works in both public and private
- [ ] Message isolation per channel maintained

**RLS Integrity:**
- [ ] Public channel queries still work
- [ ] Private channel queries respect membership
- [ ] Message queries respect channel access
- [ ] No unauthorized access to private data

#### Dependencies

**Phase 01:**
- is_private column in channels table
- channel_members table for membership
- RLS policies configured

**Phase 03:**
- Channel creation flow
- Channel list display
- useChannels hook

**Phase 04:**
- Message sending respects channel membership
- Real-time subscriptions work for both public/private

#### Critical Validation Points

**Private Channel Creation:**
- [ ] Create channel with is_private=true
- [ ] Verify creator is auto-joined as member
- [ ] Verify other users cannot see it

**Private Channel Access:**
- [ ] Creator can see private channel in list
- [ ] Creator can send messages
- [ ] Non-member cannot see channel in list
- [ ] Non-member cannot access messages (RLS blocks)

**Member Invitation:**
- [ ] Creator can invite members
- [ ] Invited user sees channel in list
- [ ] Invited user can send messages
- [ ] Non-invited user still cannot access

**Public Channel Regression:** ← **HIGH PRIORITY**
- [ ] All Phase 03 public channel tests still pass
- [ ] #general still accessible to all
- [ ] Public channel creation still works
- [ ] No breaking changes to public channel functionality

---

### Phase 07: Presence

**Phase Number:** 07  
**Module:** Module 7 - Presence  
**Status:** 🔜 Planned  
**Timeline:** Day 2 Morning (1.5 hours)

#### Introduced Features (Planned)

**Presence Tracking:**
- Online/offline status display
- Heartbeat system (30-second interval)
- setOnline on login
- setOffline on logout
- last_seen timestamp updates

**UI Components:**
- UserPresencePanel - Container for online users
- UserPresenceList - List with online/offline indicators
- UserPresenceItem - Individual user with status

**Real-Time:**
- Subscribe to user_presence table updates
- Update UI when users go online/offline
- Zustand onlineUsers Set

#### Regression Scope

**Phase 01 (Environment):**
- [ ] user_presence table accessible
- [ ] Database connection stable

**Phase 02 (Authentication):**
- [ ] Login still works (now triggers setOnline)
- [ ] Logout still works (now triggers setOffline)
- [ ] Session management unaffected
- [ ] User ID available for presence tracking

**Phase 03 (Channels):**
- [ ] Channel list still displays
- [ ] Channel switching still works
- [ ] No interference with channel sidebar

**Phase 04 (Messaging):**
- [ ] Real-time messaging still works
- [ ] Message subscription unaffected by presence subscription
- [ ] No subscription conflicts
- [ ] Optimistic updates still instant

**Real-Time System:**
- [ ] Multiple Realtime subscriptions work (messages + presence)
- [ ] No connection issues with 2+ subscriptions
- [ ] Cleanup works for both subscriptions

#### Dependencies

**Phase 01:**
- user_presence table exists
- Supabase Realtime enabled

**Phase 02:**
- User authentication for presence tracking
- Login/logout hooks for presence updates

**Phase 04:**
- Real-time subscription pattern established
- Zustand store for presence state

#### Critical Validation Points

**Presence Display:**
- [ ] UserPresencePanel visible in chat layout
- [ ] Online users shown with green indicator
- [ ] Offline users shown with gray indicator
- [ ] User's own presence shown

**Presence Updates:**
- [ ] Login triggers online status
- [ ] Logout triggers offline status
- [ ] Heartbeat updates last_seen every 30 seconds
- [ ] Other users see presence changes in real-time

**Multi-User Presence:**
- [ ] Two users online → both see each other
- [ ] User goes offline → others see change
- [ ] Presence list updates in real-time

---

### Phase 08: Polish & Error Handling

**Phase Number:** 08  
**Module:** Module 8 - Polish & Error Handling  
**Status:** 🔜 Planned  
**Timeline:** Day 2 Morning (1 hour)

#### Introduced Features (Planned)

**Loading States:**
- Spinners for MessageList fetching
- Loading states for LoginForm
- Loading states for ChannelCreateModal

**Error Handling:**
- Global error boundary (app/error.tsx)
- Feature-level error boundaries
- Toast notification system
- Error handling for failed sends
- Error handling for auth failures

**UX Polish:**
- Message timestamps with formatting
- "(edited)" indicator on messages
- Empty states for all lists
- Sign-out button
- Auto-scroll to bottom improvements
- Optimistic UI for channel creation

#### Regression Scope

**ALL PRIOR PHASES (01-07):**
- [ ] No features broken by error boundary additions
- [ ] No features broken by loading state changes
- [ ] No features broken by toast notifications
- [ ] All existing functionality intact

**Specific Checks:**
- [ ] Auth flow still works with new error handling
- [ ] Channel operations still work with new loading states
- [ ] Messaging still works with new error boundaries
- [ ] Presence tracking unaffected by polish changes

#### Dependencies

**All Phases 01-07:**
- Polish layer must not break existing features
- Error boundaries must catch errors without blocking functionality

#### Critical Validation Points

**Error Boundaries:**
- [ ] Trigger error in component → error boundary catches
- [ ] Error UI displays user-friendly message
- [ ] App doesn't crash completely

**Toast Notifications:**
- [ ] Toast shows on success (e.g., channel created)
- [ ] Toast shows on error (e.g., message send failed)
- [ ] Toast auto-dismisses after timeout
- [ ] Multiple toasts stack correctly

**Loading States:**
- [ ] All async operations show loading indicators
- [ ] Loading doesn't block user interaction unnecessarily
- [ ] Loading states clear on completion

---

### Phase 09: Testing Infrastructure

**Phase Number:** 09  
**Module:** Module 9 - Testing Infrastructure  
**Status:** 🔜 Planned  
**Timeline:** Day 2 Afternoon (2 hours)

#### Introduced Features (Planned)

**Unit Testing:**
- Vitest configuration
- Tests for lib/utils.ts
- Tests for all hooks (useAuth, useChannels, useMessages, usePresence)
- Tests for Zustand store (chat-store)
- Target: 80%+ coverage for utilities and hooks

**E2E Testing:**
- Playwright configuration
- E2E tests for auth flow
- E2E tests for messaging flow
- E2E tests for channels flow
- E2E tests for presence flow
- Two-browser real-time tests (automated)

**Performance Testing:**
- 10+ concurrent users test
- Message latency measurement (<200ms)
- Real-time reconnection testing

#### Regression Scope

**ALL PHASES (01-08):** ← **MAXIMUM REGRESSION SCOPE**
- [ ] All features from Phases 01-08 must still work
- [ ] No regressions introduced by test infrastructure
- [ ] No regressions from code refactoring for testability

**Special Considerations:**
- [ ] Code refactored for testability still functions identically
- [ ] Mock implementations don't affect production code
- [ ] Test data doesn't pollute production database
- [ ] All existing features covered by at least one test

**Critical Regression Areas:**
- [ ] Auth flow (Phase 02)
- [ ] Channel management (Phase 03)
- [ ] Real-time messaging (Phase 04)
- [ ] UI/UX (Phase 05)
- [ ] Private channels (Phase 06)
- [ ] Presence (Phase 07)
- [ ] Error handling (Phase 08)

#### Dependencies

**All Phases 01-08:**
- Every feature must remain functional
- Test infrastructure must not break production code

#### Critical Validation Points

**Test Coverage:**
- [ ] All critical paths covered by E2E tests
- [ ] All hooks covered by unit tests
- [ ] All utility functions covered
- [ ] Performance benchmarks pass

**Regression Test Suite:**
- [ ] Automated regression suite runs successfully
- [ ] All tests passing
- [ ] No flaky tests
- [ ] Test results documented

**Production Code:**
- [ ] All features still work after test setup
- [ ] No test-only code in production bundles
- [ ] Performance not degraded by test infrastructure

---

### Phase 10: Deployment

**Phase Number:** 10  
**Module:** Module 10 - Deployment  
**Status:** 🔜 Planned  
**Timeline:** Day 2 Afternoon (1.5 hours)

#### Introduced Features (Planned)

**Deployment:**
- Vercel project connected to GitHub
- Production environment configuration
- Environment variables in Vercel
- Preview and production environments
- Automatic deployments on push

**Production Validation:**
- Auth flow in production
- Real-time messaging in production
- Performance verification
- Lighthouse audit

#### Regression Scope

**ALL PHASES (01-09) IN PRODUCTION ENVIRONMENT:**
- [ ] All features work in production (not just dev)
- [ ] Environment variables correctly configured
- [ ] Database connection works from Vercel
- [ ] Real-time subscriptions work in production
- [ ] Auth flow works with production URLs

**Production-Specific Checks:**
- [ ] Magic link emails work from production
- [ ] Callback redirects to correct production URL
- [ ] CORS configured correctly
- [ ] No console errors in production build
- [ ] Bundle size acceptable
- [ ] Performance targets met in production

**Critical Production Regression:**
- [ ] Login works in production (Phase 02)
- [ ] Channels work in production (Phase 03)
- [ ] Messaging works in production (Phase 04)
- [ ] Real-time works in production (Phase 04)
- [ ] All UI renders correctly in production (Phase 05)
- [ ] Private channels work in production (Phase 06)
- [ ] Presence works in production (Phase 07)
- [ ] Error handling works in production (Phase 08)
- [ ] All tests pass in CI/CD (Phase 09)

#### Dependencies

**All Phases 01-09:**
- Every feature must work in production environment
- Vercel deployment must not break any functionality

#### Critical Validation Points

**Deployment Success:**
- [ ] Production build succeeds
- [ ] App deploys to Vercel
- [ ] Public URL accessible
- [ ] No deployment errors

**Production Functionality:**
- [ ] Can log in from production URL
- [ ] Can create channels
- [ ] Can send messages
- [ ] Real-time works between two users
- [ ] All features from dev work in production

**Performance:**
- [ ] Lighthouse score >80
- [ ] Message latency <200ms in production
- [ ] Page load <3 seconds
- [ ] 10+ concurrent users supported

---

### Phase 11: Documentation

**Phase Number:** 11  
**Module:** Module 11 - Documentation  
**Status:** 🔜 Planned  
**Timeline:** Day 2 Afternoon (30 minutes)

#### Introduced Features (Planned)

**Documentation:**
- README.md - Project overview, setup, features
- Tech stack documentation
- Setup instructions
- Environment variable documentation
- Live demo URL
- Testing instructions

**Retrospective:**
- docs/retro.md - Lessons learned
- Technical wins and challenges
- Workflow reflections
- Metrics and performance data

#### Regression Scope

**ALL PHASES (01-10):**
- [ ] Documentation accurately reflects all features
- [ ] Setup instructions work for fresh install
- [ ] Environment variables documented correctly
- [ ] All features described in README actually work

**Documentation Accuracy:**
- [ ] Tech stack list is accurate
- [ ] Feature list matches implementation
- [ ] Setup steps are complete and correct
- [ ] Live demo URL works and shows all features

#### Dependencies

**All Phases 01-10:**
- Documentation must accurately reflect all implemented features
- Setup guide must work for reproducing the project

#### Critical Validation Points

**Documentation Completeness:**
- [ ] README has all required sections
- [ ] Setup instructions complete
- [ ] Environment variables documented
- [ ] Live demo URL included and functional

**Setup Verification:**
- [ ] Fresh clone works with README instructions
- [ ] Dependencies install correctly
- [ ] Environment setup instructions accurate
- [ ] Database setup steps complete

**Accuracy:**
- [ ] All features in README actually exist
- [ ] No features described that aren't implemented
- [ ] Screenshots (if any) match current UI
- [ ] API documentation matches implementation

---

## Critical User Flows (Cross-Phase)

### Flow 1: First-Time User Journey

**Phases Involved:** 02 → 03 → 04

**Step-by-Step Flow:**
1. **Phase 02:** User visits app (/)
2. **Phase 02:** Enters email, receives magic link
3. **Phase 02:** Clicks link, redirected to /chat
4. **Phase 02:** Onboarding modal appears
5. **Phase 02:** Enters display name (e.g., "Matt")
6. **Phase 02:** Auto-joined to #general
7. **Phase 03:** Channel list displays with #general active
8. **Phase 04:** MessageList shows (empty or with messages)
9. **Phase 04:** Types first message "Hello world"
10. **Phase 04:** Clicks Send or presses Enter
11. **Phase 04:** Message appears instantly in list
12. **Phase 04:** Message persists in database

**Regression Test:**
- [ ] Complete flow works end-to-end
- [ ] No errors at any step
- [ ] User can navigate seamlessly
- [ ] Data persists correctly
- [ ] No console errors

---

### Flow 2: Returning User Journey

**Phases Involved:** 02 → 03 → 04

**Step-by-Step Flow:**
1. **Phase 02:** User visits app (/) with existing session
2. **Phase 02:** Session restored, redirected to /chat
3. **Phase 02:** No onboarding modal (already has display_name)
4. **Phase 03:** Last viewed channel loaded (or #general)
5. **Phase 03:** Channel list displays with user's channels
6. **Phase 04:** Message history loads automatically
7. **Phase 04:** Can send new messages
8. **Phase 04:** Can switch channels
9. **Phase 04:** Message history loads for each channel

**Regression Test:**
- [ ] Complete flow works without onboarding
- [ ] Session persistence works
- [ ] Previous state restored correctly
- [ ] No duplicate onboarding prompts
- [ ] All data loads correctly

---

### Flow 3: Multi-User Real-Time Collaboration

**Phases Involved:** 02 → 03 → 04 → 07 (when presence added)

**Step-by-Step Flow:**
1. **Phase 02:** User A logs in
2. **Phase 02:** User B logs in
3. **Phase 07:** Both users see each other online (when implemented)
4. **Phase 03:** Both users navigate to #general
5. **Phase 04:** User A sends "Hello from User A"
6. **Phase 04:** User B receives message in real-time (<200ms)
7. **Phase 04:** User B sends "Hello from User B"
8. **Phase 04:** User A receives message in real-time
9. **Phase 04:** User A edits their message
10. **Phase 04:** User B sees edit with "(edited)" indicator
11. **Phase 04:** User A deletes a message
12. **Phase 04:** User B sees message disappear

**Regression Test:**
- [ ] Both users can authenticate (Phase 02)
- [ ] Both users see same channels (Phase 03)
- [ ] Real-time messaging works bidirectionally (Phase 04)
- [ ] Edits propagate in real-time (Phase 04)
- [ ] Deletes propagate in real-time (Phase 04)
- [ ] No duplicate messages
- [ ] Presence shows correctly (Phase 07, when implemented)
- [ ] Latency <200ms for message delivery

---

### Flow 4: Channel Management & Message Isolation

**Phases Involved:** 03 → 04

**Step-by-Step Flow:**
1. **Phase 03:** User creates channel "engineering"
2. **Phase 03:** Automatically switched to "engineering"
3. **Phase 04:** Send message "Engineering discussion"
4. **Phase 03:** Switch to #general
5. **Phase 04:** Verify "Engineering discussion" NOT shown
6. **Phase 04:** Send message "General chat" in #general
7. **Phase 03:** Switch back to "engineering"
8. **Phase 04:** Verify "General chat" NOT shown
9. **Phase 04:** Verify "Engineering discussion" still visible
10. **Phase 04:** Real-time works in both channels

**Regression Test:**
- [ ] Channel creation still works (Phase 03)
- [ ] Channel switching immediate (Phase 03)
- [ ] Messages isolated to correct channels (Phase 04)
- [ ] No cross-channel message leakage
- [ ] Real-time subscriptions switch correctly
- [ ] No stale messages from previous channels
- [ ] Console shows unsubscribe logs

---

### Flow 5: Logout & Cleanup

**Phases Involved:** 02 → 04 → 07 (when presence added)

**Step-by-Step Flow:**
1. **Phase 02:** User logged in and active
2. **Phase 04:** Real-time subscriptions active
3. **Phase 07:** Presence heartbeat active (when implemented)
4. **Phase 02:** User clicks "Sign out"
5. **Phase 07:** Presence set to offline (when implemented)
6. **Phase 04:** Real-time subscriptions cleaned up
7. **Phase 02:** Session cleared
8. **Phase 02:** Redirected to login page (/)
9. **Phase 02:** Try to access /chat → redirected back to /

**Regression Test:**
- [ ] Logout button works (Phase 02)
- [ ] Session cleared correctly (Phase 02)
- [ ] Real-time subscriptions cleaned up (Phase 04)
- [ ] Presence updated to offline (Phase 07, when implemented)
- [ ] Protected routes still enforce auth (Phase 02)
- [ ] No memory leaks from uncleaned subscriptions
- [ ] Console shows cleanup logs

---

## System Integration Points

### Database Schema Stability

**Critical Tables:**
- `users` - Must remain stable for auth and messaging
- `channels` - Must remain stable for channel management
- `messages` - Must remain stable for messaging
- `channel_members` - Must remain stable for access control
- `user_presence` - Must remain stable for presence tracking

**Regression Checks:**
- [ ] No schema changes break existing queries
- [ ] All foreign key relationships intact
- [ ] Indexes still present and optimized
- [ ] RLS policies still enforcing correctly
- [ ] No orphan records created

---

### State Management Stability

**Phase 03 → 04 Migration:**
- React state (activeChannelId) → Zustand (currentChannelId)

**Critical Checks:**
- [ ] Zustand store accessible from all components
- [ ] State updates trigger re-renders correctly
- [ ] No state synchronization issues
- [ ] Message cache isolated per channel
- [ ] No memory leaks from Zustand store

**Phase 04+ (All Future Phases):**
- [ ] Zustand store remains stable
- [ ] New features don't corrupt messageCache
- [ ] State management patterns consistent

---

### Real-Time Subscription Stability

**Phase 04 Introduces:**
- Supabase Realtime subscription to messages table

**Phase 07 Will Add:**
- Supabase Realtime subscription to user_presence table

**Critical Checks:**
- [ ] Multiple subscriptions don't conflict
- [ ] Cleanup prevents memory leaks
- [ ] Connection status tracked accurately
- [ ] Reconnection works after network interruption
- [ ] Subscription filters work correctly (channel_id)

**Phase 04+ Regression:**
- [ ] Adding new subscriptions doesn't break message subscription
- [ ] Message subscription still fires INSERT/UPDATE/DELETE events
- [ ] Deduplication still works
- [ ] Latency still <200ms

---

### Build System Stability

**Critical Build Checks (All Phases):**
- [ ] `pnpm build` succeeds
- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings
- [ ] Bundle size acceptable (<500 kB target)
- [ ] All routes compile successfully
- [ ] Production build matches dev behavior

**Type Safety:**
- [ ] No `any` types introduced
- [ ] All new types properly defined
- [ ] Import paths resolve correctly
- [ ] No circular dependencies

**Code Quality:**
- [ ] ESLint rules enforced
- [ ] React best practices followed
- [ ] Hooks follow Rules of Hooks
- [ ] Proper error handling in all async operations

---

## Regression Testing Methodology

### Per-Phase Regression Process

**Timing:** Execute regression tests during Debug Loop (Section 8-10 of phase-XX-debug.md)

**Minimum Regression (5-10 minutes):**
1. **Quick Smoke Test:**
   - Login (Phase 02)
   - Navigate to channel (Phase 03)
   - Send message (Phase 04)
   - Verify no console errors
   
2. **Code Review:**
   - Verify no breaking changes to prior phase APIs
   - Check backward compatibility
   - Review modified files

3. **Build Validation:**
   - Production build succeeds
   - No new TypeScript errors
   - No new ESLint warnings

**Comprehensive Regression (15-25 minutes):**
1. **All Prior Phase Features:**
   - Test each phase's core features systematically
   - Verify all user stories still work
   - Check database integrity

2. **Integration Testing:**
   - Test critical user flows (4-5 flows)
   - Verify cross-phase data flow
   - Check state management

3. **Performance Validation:**
   - No performance degradation
   - Latency still within targets
   - No memory leaks

**Full Regression (Module 9 - Automated):**
- Execute complete automated test suite
- Unit tests for all modules
- E2E tests for all user flows
- Performance benchmarks
- Cross-browser testing

---

### Regression Test Documentation

**Per-Phase Checklist:**
Each phase should have: `/docs/operations/regression/phase-XX-regression-checklist.md`

**Contents:**
1. Prior phase summaries
2. Regression test scenarios
3. Expected results
4. Actual results (✅/❌)
5. Issues discovered
6. Overall regression status

**Debug Document Integration:**
Reference from `phase-XX-debug.md` Section 8-10:
```markdown
## Regression Verification

**Checklist:** See `/docs/operations/regression/phase-XX-regression-checklist.md`

**Results:**
- Phase 01: ✅ Passed
- Phase 02: ✅ Passed
- ...

**Overall:** ✅ All prior phases functional
```

---

## Regression Risk Matrix

### High-Risk Regression Areas

**Risk 1: Zustand Migration (Phase 03 → 04)**
- **Risk:** activeChannelId migration breaks channel switching
- **Phases Affected:** 03, 04
- **Mitigation:** Backward compatible API maintained
- **Test:** Channel switching after Phase 04
- **Status:** ✅ Tested and working (Phase 04 complete)

**Risk 2: Real-Time Subscription Conflicts (Phase 04 + 07)**
- **Risk:** Multiple subscriptions (messages + presence) conflict
- **Phases Affected:** 04, 07
- **Mitigation:** Separate channel names for subscriptions
- **Test:** Verify both subscriptions active simultaneously
- **Status:** 🔜 Test in Phase 07

**Risk 3: RLS Policy Conflicts (Phase 06)**
- **Risk:** Private channel RLS breaks public channel access
- **Phases Affected:** 03, 04, 06
- **Mitigation:** Careful RLS policy design (OR conditions)
- **Test:** Verify public channels still accessible after Phase 06
- **Status:** 🔜 Test in Phase 06

**Risk 4: Code Refactoring for Tests (Phase 09)**
- **Risk:** Refactoring code for testability breaks functionality
- **Phases Affected:** ALL (01-08)
- **Mitigation:** Comprehensive regression suite before refactoring
- **Test:** Full test suite + manual validation
- **Status:** 🔜 Plan in Phase 09

**Risk 5: Production Environment Differences (Phase 10)**
- **Risk:** Features work in dev but break in production
- **Phases Affected:** ALL
- **Mitigation:** Preview deployments, staged rollout
- **Test:** Complete regression suite in production
- **Status:** 🔜 Test in Phase 10

---

## Regression Checklist Templates

### Quick Regression Checklist (5 minutes)

**Use this for every phase after completing build:**

```markdown
## Quick Regression Check - Phase XX

**Date:** [Date]
**Tester:** [Name]

### Smoke Test
- [ ] Login works (Phase 02)
- [ ] Channel list displays (Phase 03)
- [ ] Can send message (Phase 04)
- [ ] No console errors

### Build Validation
- [ ] Production build succeeds
- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings

### Result
✅ PASSED / ⚠️ ISSUES FOUND / ❌ REGRESSION DETECTED

**Notes:** [Any observations]
```

---

### Comprehensive Regression Checklist (20 minutes)

**Use this before marking phase complete:**

```markdown
## Comprehensive Regression - Phase XX

**Date:** [Date]
**Tester:** [Name]

### Phase 01: Environment
- [ ] Database accessible
- [ ] All tables queryable
- [ ] Build process clean

### Phase 02: Authentication
- [ ] Login flow works
- [ ] Onboarding works
- [ ] Session persists
- [ ] Logout functional

### Phase 03: Channels
- [ ] Channel list displays
- [ ] Can create channels
- [ ] Can switch channels
- [ ] Active indicator works

### Phase 04: Messaging
- [ ] Can send messages
- [ ] Real-time works (two-browser test)
- [ ] Can edit messages
- [ ] Can delete messages

[... Additional phases as implemented ...]

### Critical User Flows
- [ ] First-time user journey (Phases 02-04)
- [ ] Returning user journey (Phases 02-04)
- [ ] Multi-user real-time (Phases 02-04)

### System Checks
- [ ] No console errors
- [ ] Database integrity maintained
- [ ] Performance acceptable

### Result
✅ PASSED / ⚠️ PARTIAL / ❌ FAILED

**Issues Found:** [List]
**Notes:** [Observations]
```

---

## Regression Test Schedule

### When to Execute Regression Tests

**During Each Phase:**

**Planning (Phase-XX-plan.md):**
- Review regression expectations from this manifest
- Identify specific prior features that might be affected
- Plan mitigation strategies

**Building (Phase-XX-build.md):**
- Continuous awareness of backward compatibility
- Code review for breaking changes
- Maintain APIs where possible

**Debugging (Phase-XX-debug.md):**
- **Section 8-10: Regression Verification** ← **PRIMARY REGRESSION GATE**
- Execute regression checklist
- Document results
- Fix any regressions before phase completion

**Reflection (Phase-XX-reflect.md):**
- Note any regression issues encountered
- Document lessons learned
- Update regression strategies

---

### Recommended Frequency

| Phase Type | Regression Scope | Time | Frequency |
|------------|------------------|------|-----------|
| **Minor Feature** | Quick smoke test | 5 min | Every phase |
| **Major Feature** | Comprehensive | 20 min | Every phase |
| **Infrastructure Change** | Full regression | 30 min | Phase 09, 10 |
| **Pre-Deployment** | Production regression | 30 min | Phase 10 |
| **Post-Deployment** | Production validation | 20 min | After Phase 10 |

---

## Phase Dependency Graph

### Visual Dependency Map

```
Phase 01: Environment Setup
    ↓
    ├─→ Phase 02: Authentication
    │       ↓
    │       ├─→ Phase 03: Channels
    │       │       ↓
    │       │       ├─→ Phase 04: Messaging ← (Currently here)
    │       │       │       ↓
    │       │       │       ├─→ Phase 05: Layout & UI
    │       │       │       │       ↓
    │       │       │       │       └─→ Phase 08: Polish
    │       │       │       │
    │       │       │       └─→ Phase 06: Private Channels
    │       │       │               ↓
    │       │       │               └─→ Phase 08: Polish
    │       │       │
    │       │       └─→ Phase 07: Presence
    │       │               ↓
    │       │               └─→ Phase 08: Polish
    │       │
    │       └─→ All Phases: Uses Phase 02 auth
    │
    └─→ All Phases: Uses Phase 01 database

Phase 08: Polish & Error Handling
    ↓
Phase 09: Testing Infrastructure (tests ALL prior phases)
    ↓
Phase 10: Deployment (validates ALL in production)
    ↓
Phase 11: Documentation (documents ALL features)
```

**Key Insights:**
- Phase 01 is foundation for ALL phases
- Phase 02 auth required by ALL feature phases
- Phases 03-04 are sequential and interdependent
- Phases 05-07 can partially parallelize (with dependencies)
- Phase 08 integrates all UX improvements
- Phases 09-11 are validating/documenting all prior work

---

## Regression Ownership by Phase

### Who Tests What

| Phase | Regression Responsibility |
|-------|---------------------------|
| **Phase 01** | Tests: None (baseline) |
| **Phase 02** | Tests: Phase 01 (DB access) |
| **Phase 03** | Tests: Phase 01 (DB), Phase 02 (Auth) |
| **Phase 04** | Tests: Phase 01 (DB), Phase 02 (Auth), Phase 03 (Channels) |
| **Phase 05** | Tests: Phase 01-04 (all UI must work in new layout) |
| **Phase 06** | Tests: Phase 01-05 (focus on Phase 03 public channels) |
| **Phase 07** | Tests: Phase 01-06 (focus on Phase 02 auth, Phase 04 real-time) |
| **Phase 08** | Tests: Phase 01-07 (all features must work with polish) |
| **Phase 09** | Tests: **ALL Phases 01-08** (comprehensive automated suite) |
| **Phase 10** | Tests: **ALL Phases 01-09** (everything in production) |
| **Phase 11** | Tests: **ALL Phases 01-10** (documentation accuracy) |

**Cumulative Responsibility:**
Each phase's regression scope increases as more features are added.

---

## Critical Integration Points

### Database Layer (Phase 01 - Foundation)

**Stability Requirements:**
- Schema changes must be additive only (no breaking changes)
- Migrations must preserve existing data
- RLS policies must not conflict
- Indexes must remain performant

**Regression for Every Phase:**
- [ ] Database connection works
- [ ] All tables accessible
- [ ] Queries return expected results
- [ ] RLS enforcing correctly
- [ ] No orphan records

---

### Authentication Layer (Phase 02 - Required by All)

**Stability Requirements:**
- User session must persist across all features
- useAuth hook API must remain stable
- Logout must clean up all resources

**Regression for Phases 03-11:**
- [ ] Can access authenticated routes
- [ ] User ID available for operations
- [ ] Session doesn't expire unexpectedly
- [ ] Logout clears all state
- [ ] Protected routes still enforce auth

---

### Channel Layer (Phase 03 - Required by Messaging)

**Stability Requirements:**
- useChannels hook API must remain stable
- activeChannelId must be accessible (Zustand or export)
- Channel switching must trigger re-renders

**Regression for Phases 04-11:**
- [ ] activeChannelId accessible via useChannels or useChatStore
- [ ] Channel switching works
- [ ] Channel list displays
- [ ] Can create channels
- [ ] Active indicator shows

---

### Messaging Layer (Phase 04 - Core Feature)

**Stability Requirements:**
- Real-time subscriptions must remain active
- Message CRUD operations must work
- Optimistic updates must function

**Regression for Phases 05-11:**
- [ ] Can send messages
- [ ] Real-time sync works
- [ ] Edit/delete functional
- [ ] No duplicate messages
- [ ] Subscription cleanup works

---

### State Management (Phase 04+ - Zustand)

**Stability Requirements:**
- Zustand store must remain accessible
- Store actions must not change signatures
- State updates must trigger re-renders

**Regression for Phases 05-11:**
- [ ] useChatStore accessible
- [ ] messageCache structure intact
- [ ] currentChannelId accessible
- [ ] All store actions functional

---

## Special Regression Considerations

### Phase 06: Private Channels (High RLS Risk)

**Why High Risk:**
- Adds complex RLS logic
- Must not break public channel access
- Query modifications could affect Phase 03/04

**Critical Regression Tests:**
- [ ] ✅ Public channels still visible to all users
- [ ] ✅ #general still accessible
- [ ] ✅ Can still create public channels
- [ ] ✅ Public channel messages still accessible
- [ ] ✅ Existing channel list query still works

**Additional Tests:**
- [ ] Private channels only visible to members
- [ ] Non-members cannot see private channel messages
- [ ] RLS blocks unauthorized access
- [ ] No accidental data exposure

---

### Phase 09: Testing Infrastructure (Refactoring Risk)

**Why High Risk:**
- May refactor code for testability
- Large scope - tests ALL prior phases
- Could introduce bugs while adding tests

**Critical Regression Tests:**
- [ ] ALL features from Phases 01-08 still work
- [ ] No functionality broken by test setup
- [ ] No test-only code in production bundles
- [ ] Mocks don't affect production behavior

**Recommended Approach:**
1. Run full manual regression BEFORE refactoring
2. Write tests for current behavior
3. Refactor incrementally
4. Run tests + manual validation after each change
5. Full regression at end of Phase 09

---

### Phase 10: Deployment (Environment Risk)

**Why High Risk:**
- Production environment differs from development
- Environment variables must be correct
- URL redirects must work
- Real-time may behave differently

**Critical Regression Tests (Production):**
- [ ] Login works with production URL
- [ ] Magic link redirects to correct production URL
- [ ] Database connection works from Vercel
- [ ] Real-time subscriptions work in production
- [ ] All features work identically to dev
- [ ] Performance meets targets in production
- [ ] No console errors in production

**Staging Strategy:**
1. Deploy to Vercel preview environment first
2. Run full regression on preview
3. Fix any environment-specific issues
4. Deploy to production
5. Run regression on production
6. Monitor for errors

---

## Regression Metrics & Success Criteria

### Regression Test Success Criteria

**Per Phase:**
- ✅ **PASS:** All regression tests passing, 0 breaking changes
- ⚠️ **PARTIAL:** Some tests failing, non-critical issues, fixes planned
- ❌ **FAIL:** Critical regressions, blocking issues, must fix before proceeding

**Success Threshold:**
- Minimum: 95% of regression tests passing
- Target: 100% of critical path tests passing
- Acceptable: Minor UI regressions (non-blocking)
- Unacceptable: Data corruption, auth breaks, messaging fails

---

### Regression Velocity Targets

**Time Budgets:**
- Quick smoke test: 5 minutes per phase
- Comprehensive regression: 20 minutes per phase
- Full automated suite: 5-10 minutes (Phase 09+)
- Production regression: 30 minutes (Phase 10)

**Efficiency Goals:**
- Regression should be <20% of phase time
- Example: Phase 04 (125 min) → Regression (20 min) = 16%
- Automated tests reduce manual regression time

---

## Update History

### Manifest Updates

| Date | Version | Changes | Updated By |
|------|---------|---------|------------|
| Oct 10, 2025 | 1.0 | Initial creation - Post Phase 04 | AI Assistant |
| TBD | 1.1 | Add Phase 05-07 actuals after completion | TBD |
| TBD | 1.2 | Add Phase 09 automated test details | TBD |
| TBD | 2.0 | Post-deployment update with production results | TBD |

---

## Using This Manifest

### For Each New Phase

**Step 1: Review (During Planning)**
1. Read this manifest section for current phase
2. Identify regression scope (what to test)
3. Note dependencies (what you need)
4. Plan regression test time (5-20 minutes)

**Step 2: Monitor (During Build)**
1. Check for breaking changes to prior APIs
2. Maintain backward compatibility where possible
3. Document any intentional breaking changes

**Step 3: Execute (During Debug)**
1. Generate phase-specific regression checklist
2. Execute regression tests (quick or comprehensive)
3. Document results in debug report
4. Fix any regressions before phase completion

**Step 4: Document (During Reflection)**
1. Note regression issues in reflection doc
2. Update manifest if new dependencies discovered
3. Share lessons learned for future phases

---

### For Automated Testing (Phase 09)

**Use this manifest to:**
1. Identify all features that need automated tests
2. Prioritize test coverage based on regression risk
3. Create comprehensive E2E test suite
4. Validate all user flows systematically

**Test Suite Structure:**
```
tests/e2e/
  ├── auth.spec.ts          (Phase 02 features)
  ├── channels.spec.ts      (Phase 03 features)
  ├── messaging.spec.ts     (Phase 04 features)
  ├── realtime.spec.ts      (Phase 04 real-time)
  ├── private-channels.spec.ts  (Phase 06 features)
  ├── presence.spec.ts      (Phase 07 features)
  └── user-flows.spec.ts    (Critical flows 1-5)
```

---

## Regression Best Practices

### Do's ✅

1. **Execute regression tests BEFORE marking phase complete**
   - Don't defer to later
   - Catch regressions early
   - Fix while context fresh

2. **Document regression results in debug report**
   - Record what was tested
   - Note pass/fail for each area
   - Explain any issues found

3. **Test critical user flows, not just features**
   - End-to-end scenarios
   - Cross-phase integration
   - Real user journeys

4. **Maintain backward compatibility**
   - Keep public APIs stable
   - Use deprecation warnings for changes
   - Provide migration guides

5. **Automate regression tests (Phase 09+)**
   - Reduce manual testing burden
   - Increase consistency
   - Enable continuous validation

---

### Don'ts ❌

1. **Don't skip regression testing**
   - Even if "just a small change"
   - Technical debt compounds
   - Regressions discovered late are expensive

2. **Don't test only new features**
   - Always validate prior phases
   - Integration is critical
   - Cumulative functionality matters

3. **Don't ignore minor regressions**
   - "Small" bugs accumulate
   - User experience degrades
   - Fix early, fix fast

4. **Don't test in isolation**
   - Test with real data
   - Test with prior phase features
   - Test integration points

5. **Don't defer regression fixes**
   - Fix regressions immediately
   - Don't pile up technical debt
   - Regression-free phases are stable phases

---

## Notes

### Document Purpose

This manifest defines **regression testing strategy** for the entire project.

**What This Document IS:**
- ✅ Permanent reference for regression planning
- ✅ Feature inventory by phase
- ✅ Dependency map between phases
- ✅ Test scenario guide
- ✅ Risk identification tool

**What This Document IS NOT:**
- ❌ Record of test execution results
- ❌ Bug tracking log
- ❌ Performance benchmark data
- ❌ Test automation scripts

**For Execution Results:**
See per-phase debug documents: `/docs/operations/phases/phase-XX-debug.md`

---

### Maintenance

**Update Triggers:**
1. New phase added to roadmap
2. Phase structure changed
3. Major dependency shift
4. Architecture refactoring

**Don't Update For:**
- Test results (goes in debug docs)
- Bug fixes (goes in debug docs)
- Performance changes (goes in debug docs)
- Routine phase completion

---

### Integration with Other Documents

**References FROM This Manifest:**
- PRD: `/docs/foundation/slack-lite-dry-run-prd.md`
- Architecture: `/docs/foundation/architecture.md`
- Dev Checklist: `/docs/foundation/dev_checklist.md`

**References TO This Manifest:**
- Phase debug docs (Section 8-10: Regression Verification)
- Phase planning docs (for regression scope identification)
- Testing strategy docs (Phase 09)

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Oct 10, 2025 | Initial creation with all 11 phases | AI Assistant |
| - | - | Future: Update after each phase completion | TBD |

---

**Manifest Version:** 1.0  
**Status:** ACTIVE  
**Next Review:** After Phase 05 completion  
**Owner:** Development Team

---


