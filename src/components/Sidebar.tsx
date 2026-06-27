import { useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import NovuLiveLogo from './NovuLiveLogo';
import { useTheme } from '../context/ThemeContext';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  logoStatus: 'idle' | 'covering' | 'looking' | 'typing' | 'thinking' | 'success' | 'greeting';
  onSelect: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupConversations(convos: Conversation[]): Record<string, Conversation[]> {
  const groups: Record<string, Conversation[]> = {};
  for (const c of convos) {
    const label = formatDate(c.updated_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(c);
  }
  return groups;
}

export default function Sidebar({
  conversations,
  activeId,
  logoStatus,
  onSelect,
  onNewChat,
  isOpen,
  onClose,
  onSignOut,
}: SidebarProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const grouped = groupConversations(conversations);
  const { darkMode, toggleTheme } = useTheme();

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[var(--app-surface-solid)] border-r border-[var(--app-border)] transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Conversations sidebar"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--app-border)]">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center">
              <NovuLiveLogo status={logoStatus} className="h-full w-full shadow-sm rounded-xl" />
            </span>
            <span className="font-display text-lg font-extrabold text-slate-800 dark:text-slate-100">NovuAI</span>
          </div>
          <button
            className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-md dark:hover:bg-slate-800"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M15 5L5 15M5 5l10 10" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-3">
          <button
            className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm"
            onClick={onNewChat}
            aria-label="Start new chat"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <path d="M8 3v10M3 8h10" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Chat history">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-8 text-center text-slate-400">
              <svg className="mb-2 h-8 w-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-sm font-medium text-slate-500">No conversations</p>
              <span className="text-xs">Start a new chat</span>
            </div>
          ) : (
            Object.entries(grouped).map(([label, items]) => (
              <div key={label} className="mt-4">
                <p className="mb-1 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <div className="space-y-0.5">
                  {items.map((conv) => (
                    <button
                      key={conv.id}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${conv.id === activeId
                          ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary-hover)] font-medium'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      onClick={() => { onSelect(conv.id); onClose(); }}
                      title={conv.title}
                    >
                      <svg className="h-4 w-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="truncate">{conv.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>

        <div className="border-t border-[var(--app-border)] p-3 space-y-1">
          <button
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <div className="flex items-center gap-2">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </div>
          </button>

          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            onClick={onSignOut}
            aria-label="Sign out"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
