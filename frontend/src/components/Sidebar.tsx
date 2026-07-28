import { useRef, useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import NovuLiveLogo from './NovuLiveLogo';
import { useTheme } from '../context/ThemeContext';
import WaterBubbles from './WaterBubbles';
import WaterWave from './WaterWave';
import WaterFishes from './WaterFishes';
import SeaDecorations from './SeaDecorations';
import SandLayer from './SandLayer';

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
  onRename: (id: string, title: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
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
  onRename,
  isOpen,
  onClose,
  onSignOut,
  onOpenSettings,
}: SidebarProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const filtered = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const grouped = groupConversations(filtered);
  const { darkMode } = useTheme();

  const handleStartRename = (conv: Conversation) => {
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const handleCancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleConfirmRename = async () => {
    if (!renamingId || !renameValue.trim()) {
      handleCancelRename();
      return;
    }

    await onRename(renamingId, renameValue.trim());
    setRenamingId(null);
    setRenameValue('');
  };

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
        className={`sidebar-glass fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Conversations sidebar"
      >
        {/* Water caustic shimmer elements */}
        <div style={{ position: 'absolute', width: '120px', height: '80px', bottom: '35%', left: '10%', background: 'radial-gradient(ellipse,rgba(94,234,212,0.15),transparent 70%)', filter: 'blur(14px)', borderRadius: '50%', pointerEvents: 'none', animation: 'causticShift 9s ease-in-out infinite', zIndex: 1 }} />
        <div style={{ position: 'absolute', width: '90px', height: '60px', bottom: '20%', right: '5%', background: 'radial-gradient(ellipse,rgba(45,212,191,0.12),transparent 70%)', filter: 'blur(12px)', borderRadius: '50%', pointerEvents: 'none', animation: 'causticShift 12s ease-in-out infinite reverse', zIndex: 1 }} />
        {/* Single top wave */}
        <WaterWave style={{ top: 'calc(42% + 2rem)' }} />
        {/* Sandy seabed */}
        <SandLayer />
        {/* Rising glass bubbles on click */}
        <WaterBubbles />
        {/* Swimming small glass fishes */}
        <WaterFishes count={2} />
        {/* Starfish and Jellyfish */}
        <SeaDecorations />
        <div className="flex flex-col gap-3 p-4 border-b border-white/10" style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center">
                <NovuLiveLogo status={logoStatus} className="h-full w-full shadow-sm rounded-xl" />
              </span>
              <span className="font-display text-lg font-extrabold text-white">NovuAI</span>
            </div>
            <button
              className="md:hidden p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white rounded-md transition-colors"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M15 5L5 15M5 5l10 10" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-teal-400 focus:outline-none"
              aria-label="Search conversations"
            />
          </div>
        </div>

        <div className="p-3" style={{ position: 'relative', zIndex: 10 }}>
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

        <nav className="flex-1 overflow-y-auto px-3 pb-4" style={{ position: 'relative', zIndex: 10 }} aria-label="Chat history">
          {conversations.filter((conv) => conv.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-8 text-center text-zinc-500">
              <svg className="mb-2 h-8 w-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-sm font-medium text-zinc-400">No conversations</p>
              <span className="text-xs">Start a new chat</span>
            </div>
          ) : (
            Object.entries(grouped).map(([label, items]) => (
              <div key={label} className="mt-4">
                <p className="mb-1 px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
                <div className="space-y-0.5">
                  {items.map((conv) => (
                    <div
                      key={conv.id}
                      className={`rounded-lg px-2 py-2 transition-colors ${conv.id === activeId
                        ? 'bg-white/10 text-white'
                        : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {renamingId === conv.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                            aria-label="Rename conversation"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmRename();
                              if (e.key === 'Escape') handleCancelRename();
                            }}
                          />
                          <button
                            className="rounded-lg p-2 text-teal-300 hover:bg-white/10"
                            onClick={handleConfirmRename}
                            aria-label="Save conversation title"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-zinc-300 hover:bg-white/10"
                            onClick={handleCancelRename}
                            aria-label="Cancel rename"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex w-full items-center justify-between gap-2 text-sm">
                          <button
                            className="flex min-w-0 flex-1 items-center gap-2 text-left text-zinc-400 hover:text-white"
                            onClick={() => { onSelect(conv.id); onClose(); }}
                            title={conv.title}
                            type="button"
                          >
                            <svg className="h-4 w-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="truncate">{conv.title}</span>
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRename(conv);
                            }}
                            aria-label="Rename conversation"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>

        <div className="border-t border-white/10 p-3 flex flex-col gap-1" style={{ position: 'relative', zIndex: 10 }}>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            onClick={onOpenSettings}
            aria-label="Settings"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Memory & Settings
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
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
