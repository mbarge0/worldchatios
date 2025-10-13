# Slack Lite - System Architecture
**Project:** Slack Lite (Dry Run Edition)  
**Version:** 1.0  
**Last Updated:** October 10, 2025  
**Status:** APPROVED

---

## 1. System Overview & Purpose

### 1.1 Architecture Goals
This architecture delivers a **production-quality real-time chat application** optimized for:
- **Performance**: <200ms message latency, 10+ concurrent users
- **Maintainability**: Clean component structure, type-safe codebase
- **Scalability**: Ready for future AI features and expanded functionality
- **Portfolio Quality**: Demonstrates modern full-stack development skills

### 1.2 Technology Stack
- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript (strict mode)
- **Styling**: TailwindCSS
- **State Management**: Zustand (global state) + React Hooks (local state)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel
- **Testing**: Vitest (unit), Sutest (integration), Playwright (E2E)

### 1.3 Architecture Constraints
- **App Router Pattern**: Use Next.js 14 App Router conventions
- **Type Safety**: Strict TypeScript, no `any` types
- **Direct Supabase Client**: RLS-enforced CRUD, minimal API routes
- **Real-Time First**: WebSocket-based communication via Supabase Realtime
- **Security**: Row-Level Security (RLS) on all database tables

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Next.js App Router                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │   (auth)     │  │   (chat)     │  │   API Routes     │  │ │
│  │  │  Login Page  │  │  Chat Page   │  │  /api/users/...  │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   React Components                          │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ChannelSidebar│  │ MessageArea  │  │UserPresencePanel │  │ │
│  │  └─────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              State Management (Zustand)                     │ │
│  │  • currentChannelId  • messageCache  • user  • presence    │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Supabase Client (lib/supabase)                │ │
│  │  • Auth  • Database CRUD  • Realtime Subscriptions         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▼ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (Backend)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Supabase Auth                            │ │
│  │  • Magic Link Authentication  • Session Management          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL Database + RLS                      │ │
│  │  • users  • channels  • messages  • channel_members         │ │
│  │  • user_presence  • Row-Level Security Policies             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Realtime Engine                            │ │
│  │  • WebSocket Connections  • Broadcast Changes               │ │
│  │  • Presence Tracking  • Channel Subscriptions               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture

### 3.1 Three-Tier Component Hierarchy

#### **Tier 1: Pages (Route-Level Components)**
Location: `app/**/page.tsx`

| Page | Route | Purpose | Key Features |
|------|-------|---------|--------------|
| `(auth)/page.tsx` | `/` | Login page | Magic link email input, Supabase Auth |
| `(chat)/page.tsx` | `/chat` | Main chat interface | Layout orchestration, auth guard |

#### **Tier 2: Feature Components (Domain-Specific)**
Location: `components/{domain}/`

**Authentication Components** (`components/auth/`)
- `LoginForm.tsx` - Email input, magic link request
- `OnboardingModal.tsx` - Display name setup for first-time users

**Channel Components** (`components/channels/`)
- `ChannelSidebar.tsx` - Container for channel list and create button
- `ChannelList.tsx` - Renders list of accessible channels
- `ChannelItem.tsx` - Single channel row (name, unread indicator)
- `ChannelCreateModal.tsx` - Create new channel (name, description, privacy)

**Chat Components** (`components/chat/`)
- `MessageArea.tsx` - Container for messages and input
- `MessageList.tsx` - Scrollable message history
- `MessageItem.tsx` - Single message (user, content, timestamp, edited indicator)
- `MessageInput.tsx` - Text input + send button (detects `/` commands)
- `MessageActions.tsx` - Edit/delete buttons (shown on hover for own messages)

**Presence Components** (`components/presence/`)
- `UserPresencePanel.tsx` - Container for online users
- `UserPresenceList.tsx` - List of users with status
- `UserPresenceItem.tsx` - Single user (display name, online/offline indicator)

**Layout Components** (`components/layout/`)
- `ChatLayout.tsx` - Main 3-panel layout (ChannelSidebar | MessageArea | UserPresencePanel)

#### **Tier 3: UI Primitives (Reusable Components)**
Location: `components/ui/`

- `Button.tsx` - Primary, secondary, danger variants
- `Input.tsx` - Text input with validation states
- `Modal.tsx` - Reusable modal with backdrop
- `Toast.tsx` - Notification system
- `Avatar.tsx` - User avatar with initials fallback
- `Spinner.tsx` - Loading indicator
- `Dropdown.tsx` - Dropdown menu component

### 3.2 State Management Architecture

#### **Zustand Global Store** (`lib/store/chat-store.ts`)
```typescript
interface ChatStore {
  // Current State
  currentChannelId: string | null;
  currentUser: User | null;
  
  // Message Cache (per-channel)
  messageCache: Record<string, Message[]>;
  
  // Connection Status
  isConnected: boolean;
  isRealtimeConnected: boolean;
  
  // Presence
  onlineUsers: Set<string>; // user IDs
  
  // Actions
  setCurrentChannel: (channelId: string) => void;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
  clearCache: () => void;
}
```

#### **Custom Hooks** (`lib/hooks/`)
- `useAuth.ts` - Auth state, login, logout, session management
- `useMessages.ts` - Message CRUD, optimistic updates, realtime subscription
- `useChannels.ts` - Channel list, create, switch, membership
- `usePresence.ts` - Track/update presence, heartbeat management
- `useRealtimeSubscription.ts` - Generic realtime subscription handler

### 3.3 Component Data Flow

```
User Action (e.g., Send Message)
  ↓
MessageInput Component
  ↓
useMessages Hook (optimistic update)
  ↓
Zustand Store (add to messageCache immediately)
  ↓
Supabase Client (INSERT message)
  ↓
Realtime Broadcast (to all subscribers)
  ↓
useMessages Hook (confirm or rollback)
  ↓
Zustand Store (update with server response)
  ↓
MessageList Component (re-render)
```

---

## 4. Data Model & Database Schema

### 4.1 Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│    users    │────┐    │   channels   │         │channel_members  │
│─────────────│    │    │──────────────│         │─────────────────│
│ id (PK)     │    │    │ id (PK)      │◄────────│ channel_id (FK) │
│ email       │    │    │ name         │         │ user_id (FK)    │
│display_name │    │    │ description  │         │ joined_at       │
│ created_at  │    │    │ is_private   │         └─────────────────┘
└─────────────┘    │    │ created_by   │
       │           │    │ created_at   │
       │           │    └──────────────┘
       │           │            │
       ▼           │            ▼
┌─────────────────┐│    ┌──────────────┐
│ user_presence   ││    │  messages    │
│─────────────────││    │──────────────│
│ user_id (PK,FK) ││    │ id (PK)      │
│ online          ││    │ channel_id   │
│ last_seen       ││    │ user_id      │
└─────────────────┘│    │ content      │
                   │    │ message_type │
                   └───►│ created_at   │
                        │ updated_at   │
                        └──────────────┘
```

### 4.2 Table Specifications

See `/docs/schema.sql` for complete DDL including indexes and RLS policies.

**Key Tables:**
- `users` - User profiles (id, email, display_name)
- `channels` - Chat channels (id, name, description, is_private, created_by)
- `messages` - Chat messages (id, channel_id, user_id, content, message_type, created_at, updated_at)
- `channel_members` - Channel membership (channel_id, user_id, joined_at)
- `user_presence` - Online status (user_id, online, last_seen)

**Indexes for Performance:**
- `messages(channel_id, created_at DESC)` - Fast recent message queries
- `messages(user_id)` - User-specific message queries
- `channels(name) UNIQUE` - Prevent duplicate channel names
- `channel_members(channel_id, user_id) PK` - Efficient membership checks

---

## 5. Data & Event Flow

### 5.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. User visits app (/)
   ↓
2. LoginForm: User enters email
   ↓
3. Supabase Auth: signInWithOtp({ email })
   ↓
4. Magic link sent to email
   ↓
5. User clicks magic link
   ↓
6. Supabase: Verify token, create session
   ↓
7. Redirect to /chat
   ↓
8. Check: Does user.display_name exist?
   ├─ YES → Load ChatLayout
   │         ↓
   │         Auto-join #general (if not member)
   │         ↓
   │         Load last viewed channel or #general
   │
   └─ NO → Show OnboardingModal
             ↓
             User enters display_name
             ↓
             UPDATE users SET display_name = ? WHERE id = ?
             ↓
             Close modal, proceed to ChatLayout
```

### 5.2 Messaging Flow (Optimistic Updates)

```
┌─────────────────────────────────────────────────────────────────┐
│                      MESSAGING FLOW                              │
└─────────────────────────────────────────────────────────────────┘

SEND MESSAGE:
1. User types message, clicks Send
   ↓
2. MessageInput validates (not empty, < 2000 chars)
   ↓
3. useMessages.sendMessage() called
   ↓
4. OPTIMISTIC UPDATE:
   - Generate temp ID (uuid)
   - Add to Zustand messageCache with status: 'sending'
   - MessageList renders immediately (optimistic)
   ↓
5. Supabase INSERT:
   await supabase.from('messages').insert({
     channel_id, user_id, content
   })
   ↓
6a. SUCCESS:
    - Replace temp ID with real ID
    - Update status: 'sent'
    - Realtime broadcast triggers
    
6b. FAILURE:
    - Mark message with status: 'failed'
    - Show retry button
    - Rollback on user cancel

RECEIVE MESSAGE (Real-Time):
1. Another user sends message
   ↓
2. Supabase Realtime: INSERT event broadcast
   ↓
3. useMessages subscription callback fires
   ↓
4. Check: Is this my optimistic message? (ignore if yes)
   ↓
5. Add to Zustand messageCache
   ↓
6. MessageList re-renders with new message
```

### 5.3 Real-Time Subscription Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  REAL-TIME SUBSCRIPTION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

CHANNEL SWITCH:
1. User clicks different channel
   ↓
2. useChannels.setActiveChannel(newChannelId)
   ↓
3. UNSUBSCRIBE from old channel:
   - supabase.removeChannel(`messages:${oldChannelId}`)
   ↓
4. FETCH message history:
   - SELECT * FROM messages 
     WHERE channel_id = newChannelId 
     ORDER BY created_at DESC 
     LIMIT 50
   ↓
5. Update Zustand messageCache[newChannelId]
   ↓
6. SUBSCRIBE to new channel:
   - supabase
       .channel(`messages:${newChannelId}`)
       .on('postgres_changes', {
         event: '*',
         schema: 'public',
         table: 'messages',
         filter: `channel_id=eq.${newChannelId}`
       }, handleMessageChange)
       .subscribe()
   ↓
7. MessageList renders with new channel's messages

REALTIME EVENT HANDLING:
- INSERT: Add new message to cache
- UPDATE: Update message in cache (for edits)
- DELETE: Remove message from cache
```

### 5.4 Presence Tracking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENCE TRACKING FLOW                       │
└─────────────────────────────────────────────────────────────────┘

ON LOGIN:
1. User successfully authenticates
   ↓
2. usePresence.setOnline()
   ↓
3. INSERT INTO user_presence (user_id, online) 
   VALUES (?, true)
   ON CONFLICT (user_id) DO UPDATE SET online = true, last_seen = NOW()
   ↓
4. Start heartbeat interval (every 30s)
   ↓
5. Realtime broadcast: user came online

HEARTBEAT (every 30s):
1. setInterval fires
   ↓
2. UPDATE user_presence 
   SET last_seen = NOW() 
   WHERE user_id = ?
   ↓
3. If update fails → user offline, stop heartbeat

ON LOGOUT:
1. User clicks sign out
   ↓
2. usePresence.setOffline()
   ↓
3. UPDATE user_presence 
   SET online = false, last_seen = NOW()
   ↓
4. Clear heartbeat interval
   ↓
5. Supabase Auth: signOut()
   ↓
6. Realtime broadcast: user went offline

DISPLAY PRESENCE:
1. Subscribe to user_presence table changes
   ↓
2. On UPDATE event: 
   - If online=true: Add to Zustand onlineUsers Set
   - If online=false: Remove from onlineUsers Set
   ↓
3. UserPresenceList renders based on onlineUsers
```

---

## 6. Security Model

### 6.1 Row-Level Security (RLS) Policies

**Enable RLS on all tables:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
```

#### **Users Table Policies**
```sql
-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own display_name
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### **Channels Table Policies**
```sql
-- Users can view public channels
CREATE POLICY "channels_select_public" ON channels
  FOR SELECT USING (is_private = false);

-- Users can view private channels they're members of
CREATE POLICY "channels_select_private_member" ON channels
  FOR SELECT USING (
    is_private = true AND EXISTS (
      SELECT 1 FROM channel_members 
      WHERE channel_id = channels.id AND user_id = auth.uid()
    )
  );

-- Any authenticated user can create channels
CREATE POLICY "channels_insert_authenticated" ON channels
  FOR INSERT WITH CHECK (auth.uid() = created_by);
```

#### **Messages Table Policies**
```sql
-- Users can view messages from channels they're members of
CREATE POLICY "messages_select_member" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM channel_members 
      WHERE channel_id = messages.channel_id AND user_id = auth.uid()
    )
  );

-- Users can insert messages to channels they're members of
CREATE POLICY "messages_insert_member" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM channel_members 
      WHERE channel_id = messages.channel_id AND user_id = auth.uid()
    )
  );

-- Users can update only their own messages
CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete only their own messages
CREATE POLICY "messages_delete_own" ON messages
  FOR DELETE USING (auth.uid() = user_id);
```

#### **Channel Members Table Policies**
```sql
-- Users can view memberships for channels they're in
CREATE POLICY "members_select_own_channels" ON channel_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM channel_members cm
      WHERE cm.channel_id = channel_members.channel_id AND cm.user_id = auth.uid()
    )
  );

-- Channel creators can add members
CREATE POLICY "members_insert_creator" ON channel_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels 
      WHERE id = channel_id AND created_by = auth.uid()
    )
  );

-- Channel creators can remove members
CREATE POLICY "members_delete_creator" ON channel_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM channels 
      WHERE id = channel_id AND created_by = auth.uid()
    )
  );
```

#### **User Presence Table Policies**
```sql
-- All authenticated users can view presence
CREATE POLICY "presence_select_all" ON user_presence
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can update their own presence
CREATE POLICY "presence_update_own" ON user_presence
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own presence
CREATE POLICY "presence_insert_own" ON user_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 6.2 Environment Variable Security

**Client-Side (Public)**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (safe for client)

**Server-Side (Private)**
- `SUPABASE_SERVICE_ROLE_KEY` - Full access key (use only in server components/API routes)
- `OPENAI_API_KEY` - For future AI features (server-only)

**Security Rules:**
- Never commit `.env` files to git
- Use Vercel environment variables for production
- Separate dev/preview/production environments
- Rotate keys if exposed

### 6.3 Input Validation & Sanitization

**Client-Side Validation:**
- Message content: 1-2000 characters, trim whitespace
- Channel name: 1-50 characters, alphanumeric + hyphens/underscores
- Display name: 1-50 characters, no special characters
- Email: valid email format (handled by Supabase Auth)

**Server-Side Validation (RLS):**
- User can only perform actions on data they own
- Membership verified before message CRUD
- Channel privacy enforced via RLS

**XSS Prevention:**
- Sanitize user input before rendering (use DOMPurify if needed)
- React escapes by default, but validate `/` commands
- No `dangerouslySetInnerHTML` without sanitization

---

## 7. Real-Time Architecture

### 7.1 Supabase Realtime Configuration

**Subscription Strategy:**
```typescript
// Subscribe to messages for a specific channel
const subscribeToChannel = (channelId: string) => {
  return supabase
    .channel(`messages:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          handleNewMessage(payload.new);
        } else if (payload.eventType === 'UPDATE') {
          handleMessageUpdate(payload.new);
        } else if (payload.eventType === 'DELETE') {
          handleMessageDelete(payload.old);
        }
      }
    )
    .subscribe();
};
```

**Presence Subscription:**
```typescript
// Subscribe to presence updates
const subscribeToPresence = () => {
  return supabase
    .channel('user-presence')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_presence'
      },
      (payload) => {
        handlePresenceChange(payload.new);
      }
    )
    .subscribe();
};
```

### 7.2 Connection Management

**Auto-Reconnect:**
- Supabase client auto-reconnects on connection loss
- Display connection status in UI (toast or indicator)
- Queue messages while offline (optional for dry run)

**Cleanup on Unmount:**
```typescript
useEffect(() => {
  const channel = subscribeToChannel(currentChannelId);
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [currentChannelId]);
```

### 7.3 Performance Optimization

**Debouncing & Throttling:**
- Presence updates: debounce 5 seconds
- Scroll events: throttle 100ms
- Message input: debounce 300ms (for typing indicators, if added)

**Batching:**
- Batch multiple state updates in single render
- Use `unstable_batchedUpdates` if needed

**Memoization:**
```typescript
// Memo expensive components
const MessageItem = React.memo(({ message }) => {
  // ...
});

// Memo selectors
const selectChannelMessages = useMemo(
  () => messageCache[currentChannelId] || [],
  [messageCache, currentChannelId]
);
```

---

## 8. Testing Coverage Map

### 8.1 Unit Tests (Vitest)
**Location:** `lib/**/*.test.ts`

| Test File | What's Tested | Key Scenarios |
|-----------|---------------|---------------|
| `lib/utils.test.ts` | Utility functions | Date formatting, string sanitization, validation |
| `lib/hooks/useMessages.test.ts` | Message hook logic | Optimistic updates, rollback on failure |
| `lib/hooks/useChannels.test.ts` | Channel hook logic | Membership validation, channel switching |
| `lib/hooks/usePresence.test.ts` | Presence hook logic | Heartbeat intervals, online/offline state |
| `lib/store/chat-store.test.ts` | Zustand store | State mutations, cache updates |

**Coverage Target:** 80%+ for utility functions and hooks

### 8.2 Integration Tests (Sutest)
**Location:** `app/api/**/*.test.ts`, `lib/supabase/*.test.ts`

| Test File | What's Tested | Key Scenarios |
|-----------|---------------|---------------|
| `lib/supabase/client.test.ts` | Supabase client | Connection, auth state, query execution |
| `lib/supabase/realtime.test.ts` | Realtime subscriptions | Mock subscription events, callback execution |
| `app/api/users/display-name/route.test.ts` | Update display name | Valid update, RLS enforcement |
| RLS policy tests | Database security | Test all RLS policies with different user contexts |

**Key Integration Scenarios:**
- User can only update own display_name
- User cannot read messages from channels they're not in
- User cannot delete other users' messages
- Private channel visibility restricted to members

### 8.3 End-to-End Tests (Playwright)
**Location:** `tests/e2e/**/*.spec.ts`

| Test File | User Flow Tested | Critical Path |
|-----------|------------------|---------------|
| `auth.spec.ts` | Magic link login → Onboarding → Chat | ✅ Critical |
| `messaging.spec.ts` | Send → Receive → Edit → Delete | ✅ Critical |
| `channels.spec.ts` | Create → Join → Switch → Private access | ✅ Critical |
| `presence.spec.ts` | Login (online) → Logout (offline) → Multi-user | ⚙️ Important |
| `realtime.spec.ts` | Two browser contexts, message latency <200ms | ✅ Critical |

**Multi-User E2E Test Example:**
```typescript
test('two users can chat in real-time', async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();
  
  // User 1 logs in
  await page1.goto('/');
  await page1.fill('[data-testid="email-input"]', 'user1@test.com');
  // ... magic link flow
  
  // User 2 logs in
  await page2.goto('/');
  // ... similar
  
  // User 1 sends message
  await page1.fill('[data-testid="message-input"]', 'Hello from User 1');
  await page1.click('[data-testid="send-button"]');
  
  // User 2 receives message within 200ms
  await page2.waitForSelector('text=Hello from User 1', { timeout: 200 });
  
  expect(await page2.textContent('[data-testid="last-message"]'))
    .toBe('Hello from User 1');
});
```

### 8.4 Manual QA Checklist
**Pre-Deployment Testing:**

- [ ] **Smoke Test**: Login → Send message → Logout works end-to-end
- [ ] **Cross-Browser**: Chrome, Firefox, Safari all work
- [ ] **Mobile Responsive**: Basic functionality on phone/tablet
- [ ] **Performance**: Network throttling (3G), high latency simulation
- [ ] **Edge Cases**: Empty channels, long messages (2000 chars), special characters
- [ ] **Security**: Attempt SQL injection, XSS, unauthorized access
- [ ] **Concurrent Users**: 10+ browser tabs sending messages simultaneously

---

## 9. Performance Strategy

### 9.1 Message Loading & Caching

**Initial Load:**
- Fetch last 50 messages on channel open
- Store in Zustand `messageCache[channelId]`
- Display immediately (no loading spinner for cached channels)

**Infinite Scroll (if time permits):**
- Detect scroll to top (threshold: 100px)
- Fetch next 50 messages (offset by current count)
- Prepend to messageCache
- Maintain scroll position

**Cache Strategy:**
- Keep messages for all visited channels in memory
- Refresh cache if stale (> 5 minutes since last fetch)
- Clear cache on logout

### 9.2 Database Query Optimization

**Indexes:**
```sql
-- Fast recent message queries (used on channel load)
CREATE INDEX idx_messages_channel_created 
  ON messages(channel_id, created_at DESC);

-- User's message queries (used for edit/delete checks)
CREATE INDEX idx_messages_user 
  ON messages(user_id);

-- Prevent duplicate channel names
CREATE UNIQUE INDEX idx_channels_name 
  ON channels(name);

-- Fast membership lookups
-- (Already covered by composite PK on channel_members)
```

**Query Patterns:**
```sql
-- Optimized: Uses idx_messages_channel_created
SELECT * FROM messages 
WHERE channel_id = ? 
ORDER BY created_at DESC 
LIMIT 50;

-- Optimized: RLS policy uses this pattern
SELECT 1 FROM channel_members 
WHERE channel_id = ? AND user_id = ?;
```

### 9.3 React Performance Optimization

**Component Memoization:**
```typescript
// Memo components that render frequently
const MessageItem = React.memo(({ message }) => {
  // Only re-render if message changes
}, (prev, next) => prev.message.id === next.message.id);

const ChannelItem = React.memo(({ channel, isActive }) => {
  // Only re-render if channel or active state changes
});
```

**Zustand Selectors:**
```typescript
// Only subscribe to specific state slices
const currentChannelId = useChatStore(state => state.currentChannelId);
const currentMessages = useChatStore(
  state => state.messageCache[state.currentChannelId] || []
);
```

**Debounced Presence Updates:**
```typescript
const updatePresence = useMemo(
  () => debounce(async () => {
    await supabase
      .from('user_presence')
      .update({ last_seen: new Date().toISOString() })
      .eq('user_id', userId);
  }, 5000), // Update at most every 5 seconds
  [userId]
);
```

### 9.4 Performance Benchmarks

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Message Latency | <200ms | Playwright: timestamp on send vs. receive |
| Page Load Time | <3s | Lighthouse, Vercel Analytics |
| Concurrent Users | 10+ | Manual: 10 browser tabs stress test |
| Database Query Time | <50ms | Supabase dashboard, query logs |
| Real-Time Reconnect | <2s | Manual: disable/enable network |

---

## 10. API Routes & Endpoints

### 10.1 Minimal API Routes (Server-Side Logic Only)

**User Management:**
```typescript
// POST /api/users/display-name
// Update user's display name (first-time onboarding)
{
  displayName: string; // 1-50 chars
}
```

**Future AI Endpoints:**
```typescript
// POST /api/ai/summarize (future implementation)
// Generate AI summary of last N messages
{
  channelId: string;
  messageCount?: number; // default 10
}

Response: {
  summary: string;
  messageId: string; // ID of inserted summary message
}
```

### 10.2 Direct Supabase Client Usage

**Most operations use Supabase client directly:**
- **Auth**: `supabase.auth.signInWithOtp()`, `signOut()`
- **Messages**: `supabase.from('messages').insert()`, `update()`, `delete()`
- **Channels**: `supabase.from('channels').select()`, `insert()`
- **Presence**: `supabase.from('user_presence').upsert()`

**Benefits:**
- Faster development (no API route boilerplate)
- Automatic RLS enforcement
- Type-safe with generated types
- Built-in optimistic updates

---

## 11. Design Notes & Key Decisions

### 11.1 Why Zustand over React Context?

**Decision:** Use Zustand for global state instead of React Context.

**Rationale:**
- **Performance**: Zustand doesn't cause re-renders of all consumers (only those using changed state)
- **Simplicity**: Less boilerplate than Context + useReducer
- **DevTools**: Built-in Redux DevTools support
- **Persistence**: Easy to add localStorage persistence if needed
- **Type Safety**: Excellent TypeScript support

**Trade-off:** Additional dependency, but lightweight (1.3kb gzipped)

### 11.2 Why Direct Supabase Client vs API Routes?

**Decision:** Use Supabase client directly for most CRUD, minimal API routes.

**Rationale:**
- **Speed**: Faster development for dry run (2-day constraint)
- **Security**: RLS policies enforce access control automatically
- **Type Safety**: Generated types from database schema
- **Real-Time**: Seamless integration with Realtime subscriptions
- **Less Code**: No need to write API routes for simple CRUD

**When to Use API Routes:**
- Server-side business logic (e.g., AI summarization)
- Third-party API calls (OpenAI)
- Complex operations requiring multiple database queries
- Rate limiting or throttling

### 11.3 Optimistic Updates Strategy

**Decision:** Implement optimistic updates for messaging.

**Rationale:**
- **UX**: Instant feedback, feels faster
- **Performance**: No perceived latency
- **Engagement**: Users keep typing/interacting

**Implementation:**
1. Generate temporary ID on client
2. Add to Zustand cache with `status: 'sending'`
3. Send to Supabase
4. On success: replace temp ID with real ID
5. On failure: show retry button or rollback

**Trade-off:** More complex error handling, but worth it for UX

### 11.4 Message Caching Strategy

**Decision:** Cache messages per-channel in Zustand, keep in memory.

**Rationale:**
- **Instant Channel Switching**: No loading when switching between visited channels
- **Reduced API Calls**: Only fetch once per channel
- **Offline Support**: (Future) Can work with cached data

**Cache Invalidation:**
- Stale after 5 minutes (refetch on channel switch if stale)
- Clear on logout
- Refresh on explicit user action (pull-to-refresh, if added)

**Trade-off:** Memory usage grows with channel visits, but acceptable for dry run scope

### 11.5 Presence Heartbeat Approach

**Decision:** Use 30-second heartbeat with manual login/logout updates.

**Rationale:**
- **Battery Efficient**: Not too frequent on mobile
- **Accurate**: Shows offline within 30s of inactivity
- **Simple**: Easy to implement and debug

**Alternative Considered:** Supabase Presence API
- **Pros**: Automatic tracking, built-in
- **Cons**: Less control, overkill for global presence

**Decision:** Manual heartbeat for dry run, can switch to Presence API later

---

## 12. Directory Structure (Final)

```
slack-ai-dryrun/
├── app/
│   ├── (auth)/
│   │   └── page.tsx                    # Login page (magic link)
│   ├── (chat)/
│   │   └── page.tsx                    # Main chat interface
│   ├── api/
│   │   ├── users/
│   │   │   └── display-name/
│   │   │       └── route.ts            # Update display name
│   │   └── ai/                         # Future AI endpoints
│   │       └── summarize/
│   │           └── route.ts            # AI summarization
│   ├── layout.tsx                      # Root layout
│   ├── error.tsx                       # Global error boundary
│   ├── loading.tsx                     # Global loading UI
│   └── globals.css                     # Global styles
│
├── components/
│   ├── ui/                             # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Avatar.tsx
│   │   ├── Spinner.tsx
│   │   └── Dropdown.tsx
│   ├── auth/                           # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── OnboardingModal.tsx
│   ├── channels/                       # Channel components
│   │   ├── ChannelSidebar.tsx
│   │   ├── ChannelList.tsx
│   │   ├── ChannelItem.tsx
│   │   └── ChannelCreateModal.tsx
│   ├── chat/                           # Messaging components
│   │   ├── MessageArea.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageItem.tsx
│   │   ├── MessageInput.tsx
│   │   └── MessageActions.tsx
│   ├── presence/                       # Presence components
│   │   ├── UserPresencePanel.tsx
│   │   ├── UserPresenceList.tsx
│   │   └── UserPresenceItem.tsx
│   └── layout/
│       └── ChatLayout.tsx              # Main 3-panel layout
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server Supabase client
│   │   └── types.ts                    # Generated database types
│   ├── hooks/
│   │   ├── useAuth.ts                  # Auth hook
│   │   ├── useMessages.ts              # Message CRUD + subscription
│   │   ├── useChannels.ts              # Channel management
│   │   ├── usePresence.ts              # Presence tracking
│   │   └── useRealtimeSubscription.ts  # Generic realtime hook
│   ├── store/
│   │   └── chat-store.ts               # Zustand global store
│   └── utils.ts                        # Utility functions
│
├── types/
│   ├── database.ts                     # Supabase generated types
│   ├── auth.ts                         # Auth types
│   └── chat.ts                         # Message, Channel types
│
├── config/
│   ├── env.ts                          # Environment validation (Zod)
│   └── supabase.ts                     # Supabase config
│
├── tests/
│   ├── unit/
│   │   ├── utils.test.ts
│   │   ├── hooks.test.ts
│   │   └── store.test.ts
│   ├── integration/
│   │   ├── supabase.test.ts
│   │   ├── rls-policies.test.ts
│   │   └── api-routes.test.ts
│   └── e2e/
│       ├── auth.spec.ts
│       ├── messaging.spec.ts
│       ├── channels.spec.ts
│       ├── presence.spec.ts
│       └── realtime.spec.ts
│
├── docs/
│   ├── architecture.md                 # This file
│   ├── schema.sql                      # Database schema + RLS
│   ├── api.md                          # API documentation
│   ├── testing.md                      # Testing guide
│   └── requirements/
│       └── slack-lite-dry-run-prd.md   # PRD
│
├── public/                             # Static assets
├── .env.local                          # Environment variables (gitignored)
├── .env.example                        # Example env file
├── next.config.ts                      # Next.js config
├── tailwind.config.ts                  # Tailwind config
├── tsconfig.json                       # TypeScript config
├── vitest.config.ts                    # Vitest config
├── playwright.config.ts                # Playwright config
└── package.json                        # Dependencies
```

---

## 13. Next Steps (Build Phase)

### 13.1 Immediate Actions (Day 1 Morning)

**1. Environment Setup** (30 minutes)
- [ ] Create Supabase project
- [ ] Note down `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- [ ] Create `.env.local` with environment variables
- [ ] Update `config/env.ts` with Zod validation
- [ ] Test Supabase connection

**2. Database Initialization** (45 minutes)
- [ ] Run `/docs/schema.sql` in Supabase SQL editor
- [ ] Verify tables created: users, channels, messages, channel_members, user_presence
- [ ] Enable RLS on all tables
- [ ] Test RLS policies with test users
- [ ] Create #general channel manually (or via seed script)

**3. Supabase Client Setup** (30 minutes)
- [ ] Implement `lib/supabase/client.ts` (browser client)
- [ ] Implement `lib/supabase/server.ts` (server client)
- [ ] Generate TypeScript types: `npx supabase gen types typescript`
- [ ] Save types to `lib/supabase/types.ts`
- [ ] Test client connection in a simple component

**4. Authentication Flow** (1.5 hours)
- [ ] Implement `LoginForm` component (email input + magic link)
- [ ] Implement auth callback route (`app/auth/callback/route.ts`)
- [ ] Implement `useAuth` hook (session management)
- [ ] Test magic link login flow end-to-end
- [ ] Implement `OnboardingModal` for display_name setup
- [ ] Test first-time user flow

**Checkpoint 1:** Auth working, users can log in and set display name ✅

### 13.2 Day 1 Afternoon

**5. Channel Management** (1 hour)
- [ ] Implement `ChannelList` and `ChannelItem` components
- [ ] Implement `useChannels` hook (fetch, create, switch)
- [ ] Auto-join user to #general on first login
- [ ] Implement `ChannelCreateModal` (name, description, privacy)
- [ ] Test channel creation and switching

**6. Real-Time Messaging** (2 hours)
- [ ] Implement Zustand `chat-store` (messageCache, currentChannel)
- [ ] Implement `useMessages` hook (CRUD + subscription)
- [ ] Implement `MessageList`, `MessageItem`, `MessageInput`
- [ ] Test sending messages (optimistic updates)
- [ ] Test real-time subscription (open two browser windows)
- [ ] Test message editing and deletion

**7. Basic UI Layout** (1 hour)
- [ ] Implement `ChatLayout` (3-panel design)
- [ ] Implement `ChannelSidebar`
- [ ] Implement `MessageArea`
- [ ] Apply TailwindCSS styling
- [ ] Test responsive design (desktop + mobile)

**Checkpoint 2:** Can send/receive real-time messages in #general channel ✅

### 13.3 Day 2 Morning

**8. Private Channels & Membership** (1.5 hours)
- [ ] Implement private channel creation logic
- [ ] Implement channel membership management
- [ ] Test RLS policies for private channels
- [ ] Ensure non-members can't see private channels
- [ ] Test message access control

**9. User Presence** (1.5 hours)
- [ ] Implement `usePresence` hook (heartbeat, online/offline)
- [ ] Implement `UserPresencePanel` and `UserPresenceList`
- [ ] Subscribe to presence updates
- [ ] Test presence with multiple users
- [ ] Test heartbeat on login/logout

**10. UI/UX Polish** (1 hour)
- [ ] Add loading states (Spinner components)
- [ ] Add error states (Toast notifications)
- [ ] Improve message timestamps
- [ ] Add "(edited)" indicator to messages
- [ ] Implement sign-out button
- [ ] Final responsive design tweaks

**Checkpoint 3:** All core features functional locally ✅

### 13.4 Day 2 Afternoon

**11. Testing Infrastructure** (2 hours)
- [ ] Set up Vitest (unit tests)
- [ ] Write unit tests for hooks and utils
- [ ] Set up Playwright (E2E tests)
- [ ] Write E2E tests for auth flow
- [ ] Write E2E tests for messaging (two-user test)
- [ ] Run all tests, fix failures

**12. Deployment** (1.5 hours)
- [ ] Connect repo to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Deploy to production
- [ ] Test deployed app (auth, messaging, realtime)
- [ ] Verify performance (<200ms latency)
- [ ] Fix any production-specific issues

**13. Documentation** (30 minutes)
- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Add live demo URL
- [ ] Create `/docs/retro.md` with reflections

**Final Checkpoint:** Live deployment working, all tests passing ✅

---

## 14. Risk Mitigation

### 14.1 Technical Risks & Mitigation

| Risk | Mitigation Strategy | Fallback Plan |
|------|-------------------|---------------|
| **Supabase Realtime complexity** | Test realtime early (Day 1 AM), follow docs precisely | Use polling (5s interval) if realtime fails |
| **Magic link auth issues** | Test auth flow first, use Supabase Auth UI helpers | Fallback to email/password auth |
| **RLS policy errors** | Test RLS policies in Supabase SQL editor with test users | Simplify policies, ensure basic access control |
| **Performance under load** | Test with 10+ browser tabs, optimize queries with indexes | Reduce concurrent user target if needed |
| **Time constraints** | Strict schedule adherence, prioritize critical path | Use fallback plans per PRD section 10.2 |

### 14.2 Testing Risks & Mitigation

| Risk | Mitigation Strategy | Fallback Plan |
|------|-------------------|---------------|
| **Playwright setup complexity** | Use starter template, test simple flow first | Focus on manual QA, skip E2E if blocked |
| **Realtime testing difficulty** | Mock Supabase client at integration level, validate in E2E | Manual two-browser testing |
| **Test execution time** | Run tests in parallel, use Playwright sharding | Prioritize critical path tests only |

---

## 15. Success Criteria Alignment

### 15.1 Architecture Supports All PRD Requirements

**Authentication ✅**
- Magic link via Supabase Auth
- Display name onboarding flow
- Session persistence

**Channels ✅**
- Public and private channels
- Channel creation by any user
- Membership management with RLS

**Messaging ✅**
- Real-time via Supabase Realtime
- Optimistic updates for <200ms perceived latency
- Edit/delete with RLS enforcement

**Presence ✅**
- Heartbeat-based tracking
- Real-time updates via Supabase

**Performance ✅**
- Indexed queries for <50ms response
- Memoized components
- Zustand for efficient state updates

**Testing ✅**
- Unit (Vitest), Integration (Sutest), E2E (Playwright)
- RLS policy testing
- Multi-user realtime testing

**Deployment ✅**
- Vercel-ready architecture
- Environment variable security
- Production monitoring

---

## 16. Future Expansion (Post Dry Run)

### 16.1 AI Summarization Architecture (Already Planned)

**Command Detection:**
```typescript
// In MessageInput.tsx
const handleSend = async (content: string) => {
  if (content.startsWith('/summarize')) {
    await handleSummarizeCommand();
    return;
  }
  // Normal message flow...
};
```

**API Route:**
```typescript
// POST /api/ai/summarize
export async function POST(req: Request) {
  const { channelId, messageCount = 10 } = await req.json();
  
  // Fetch last N messages
  const messages = await supabase
    .from('messages')
    .select('content, user:users(display_name)')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(messageCount);
  
  // Call OpenAI
  const summary = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Summarize this chat conversation.' },
      { role: 'user', content: JSON.stringify(messages) }
    ]
  });
  
  // Insert summary as special message
  const summaryMessage = await supabase
    .from('messages')
    .insert({
      channel_id: channelId,
      user_id: 'system', // Or AI user ID
      content: summary.choices[0].message.content,
      message_type: 'ai_summary'
    });
  
  return Response.json(summaryMessage);
}
```

**UI Panel:**
```typescript
// Separate panel for AI summaries
<div className="ai-summaries-panel">
  {messages
    .filter(m => m.message_type === 'ai_summary')
    .map(summary => (
      <SummaryCard key={summary.id} summary={summary} />
    ))}
</div>
```

### 16.2 Other Future Enhancements
- File uploads (Supabase Storage)
- Message search (PostgreSQL full-text search)
- Reactions (new `message_reactions` table)
- Push notifications (Supabase Edge Functions)
- Voice/video calls (WebRTC integration)

---

**Architecture Status:** ✅ APPROVED  
**Ready for Implementation:** YES  
**Next Document:** Implementation Checklist (to be generated separately)

---

*This architecture document serves as the technical blueprint for Slack Lite. All implementation must align with the specifications defined here. Any deviations should be documented and approved.*

