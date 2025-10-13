'use client';

import React from 'react';

/**
 * ChatLayout component props interface
 */
export interface ChatLayoutProps {
  /** Left sidebar content (channel list) */
  sidebar: React.ReactNode;
  /** Main message area content */
  messageArea: React.ReactNode;
  /** Optional right presence panel content */
  presencePanel?: React.ReactNode;
  /** Optional header content */
  header?: React.ReactNode;
}

/**
 * Main chat application layout with 3-panel design
 * 
 * Features:
 * - Three-column layout: Sidebar | Messages | Presence (optional)
 * - Responsive design with mobile/tablet breakpoints
 * - Full-height layout (100vh)
 * - Optional header section
 * - Flexible content slots
 * 
 * Layout Structure:
 * ```
 * ┌─────────────────────────────────────────┐
 * │              Header (optional)           │
 * ├──────────┬──────────────┬───────────────┤
 * │ Sidebar  │  Messages    │  Presence     │
 * │ (256px)  │  (flex-1)    │  (256px)      │
 * │          │              │  (optional)   │
 * └──────────┴──────────────┴───────────────┘
 * ```
 * 
 * @example
 * ```tsx
 * <ChatLayout
 *   sidebar={<ChannelSidebar />}
 *   messageArea={<MessageArea />}
 *   presencePanel={<UserPresencePanel />}
 * />
 * ```
 */
export default function ChatLayout({
  sidebar,
  messageArea,
  presencePanel,
  header,
}: ChatLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Optional Header */}
      {header && (
        <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          {header}
        </header>
      )}
      
      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar (Channel List) */}
        <aside 
          className="
            w-64 flex-shrink-0 
            bg-white border-r border-gray-200
            overflow-y-auto
            hidden md:block
          "
          aria-label="Channel sidebar"
        >
          {sidebar}
        </aside>
        
        {/* Message Area (Main Content) */}
        <section 
          className="
            flex-1 
            bg-white
            overflow-hidden
            flex flex-col
          "
          aria-label="Message area"
        >
          {messageArea}
        </section>
        
        {/* Presence Panel (Optional) */}
        {presencePanel && (
          <aside 
            className="
              w-64 flex-shrink-0 
              bg-white border-l border-gray-200
              overflow-y-auto
              hidden lg:block
            "
            aria-label="Presence panel"
          >
            {presencePanel}
          </aside>
        )}
      </main>
    </div>
  );
}

