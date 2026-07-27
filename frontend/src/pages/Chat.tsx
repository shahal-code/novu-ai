import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, conversations as convApi, streamChat } from '../lib/api';
import type { Conversation, Message } from '../lib/api';
import Sidebar from '../components/Sidebar';
import MessageList from '../components/MessageList';
import InputBox from '../components/InputBox';
import WelcomeScreen from '../components/WelcomeScreen';

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [suggestionText, setSuggestionText] = useState<string>('');
  const [loadingMsgs, setLoadingMsgs] = useState<boolean>(false);
  const ACTIVE_CONVERSATION_KEY = 'novuai_active_conversation';
  const [logoStatus, setLogoStatus] = useState<'idle' | 'covering' | 'looking' | 'typing' | 'thinking' | 'success' | 'greeting'>('greeting');
  const navigate = useNavigate();
  const abortRef = useRef<AbortController | null>(null);

  // ---- Auth guard ----
  useEffect(() => {
    if (!auth.isLoggedIn()) {
      navigate('/', { replace: true });
      return;
    }
    auth.me().then((data) => {
      if (!data) {
        auth.logout();
        navigate('/', { replace: true });
      }
    });

    // Reset greeting to idle after 3s
    const timer = setTimeout(() => {
      setLogoStatus((prev) => (prev === 'greeting' ? 'idle' : prev));
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // ---- Load conversations ----
  const loadConversations = useCallback(async () => {
    try {
      const data = await convApi.list();
      setConversations(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ---- Load messages ----
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    try {
      const data = await convApi.getMessages(convId);
      setMessages(data);
    } catch {
      setMessages([]);
    }
    setLoadingMsgs(false);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
    loadMessages(id);
    setSuggestionText('');
  }, [loadMessages]);

  const handleNewChat = useCallback(() => {
    setActiveId(null);
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    setMessages([]);
    setSuggestionText('');
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      const storedId = localStorage.getItem(ACTIVE_CONVERSATION_KEY);
      if (storedId && conversations.some((conv) => conv.id === storedId)) {
        handleSelectConversation(storedId);
      }
    }
  }, [activeId, conversations, handleSelectConversation]);

  // ---- Send message ----
  const handleSend = useCallback(async (text: string) => {
    setSuggestionText('');
    setLogoStatus('success');
    
    // Switch from success to thinking shortly after send
    setTimeout(() => {
      setLogoStatus('thinking');
    }, 1500);

    let convId = activeId;

    if (!convId) {
      try {
        const newConv = await convApi.create(text);
        convId = newConv.id;
        setActiveId(convId);
        localStorage.setItem(ACTIVE_CONVERSATION_KEY, convId);
      } catch {
        return;
      }
    }

    const tempUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const savedUser = await convApi.saveMessage(convId, 'user', text);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempUserMsg.id ? savedUser : m)),
      );
    } catch {
      // keep temp message in UI
    }

    const history = [...messages, { ...tempUserMsg }];

    const tempAiId = `temp-ai-${Date.now()}`;
    let aiContent = '';
    let assistantAdded = false;
    setIsTyping(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat(
        history.map((m) => ({ role: m.role, content: m.content })),
        (text) => {
          aiContent += text;
          setMessages((prev) => {
            if (!assistantAdded) {
              assistantAdded = true;
              return [...prev, { id: tempAiId, role: 'assistant', content: aiContent }];
            }
            return prev.map((m) => (m.id === tempAiId ? { ...m, content: aiContent } : m));
          });
        },
        controller.signal,
      );
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        aiContent = 'Sorry, something went wrong. Please try again.';
        setMessages((prev) => {
          if (!assistantAdded) {
            assistantAdded = true;
            return [...prev, { id: tempAiId, role: 'assistant', content: aiContent }];
          }
          return prev.map((m) => (m.id === tempAiId ? { ...m, content: aiContent } : m));
        });
      }
    } finally {
      setIsTyping(false);
      setLogoStatus('idle');
    }

    if (aiContent && convId) {
      try {
        const savedAi = await convApi.saveMessage(convId, 'assistant', aiContent);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempAiId ? savedAi : m)),
        );
      } catch {
        // keep temp message
      }
    }

    await loadConversations();
  }, [activeId, messages, loadConversations]);



  return (
    <div className="paper-sheet flex-row auth-bg">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        logoStatus={logoStatus}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onRename={async (id, title) => {
          try {
            await convApi.rename(id, title);
            await loadConversations();
          } catch {
            // ignore rename failure for now
          }
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={() => { auth.logout(); navigate('/'); }}
      />

      <div className="flex flex-1 flex-col overflow-hidden bg-transparent relative">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/10 backdrop-blur-md px-4 shadow-sm z-10 text-white">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="font-display text-lg font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {activeId
                ? conversations.find((c) => c.id === activeId)?.title ?? 'Chat'
                : 'New Chat'}
            </h1>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            onClick={handleNewChat}
            aria-label="New chat"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M10 4v12M4 10h12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Message List */}
        {loadingMsgs ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 safe-bottom">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-teal-400" />
            <p className="text-sm font-medium text-zinc-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          <div className="flex-1 min-h-0 overflow-y-auto safe-bottom">
            <WelcomeScreen conversations={conversations} onSend={handleSend} />
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto safe-bottom">
              <MessageList
                messages={messages}
                isTyping={isTyping}
              />
            </div>
            
            {/* Input Box */}
            <div className="shrink-0 bg-gradient-to-t from-[#060a0b] to-transparent pt-4">
              <InputBox
                onSend={handleSend}
                onTyping={(typing) => setLogoStatus(typing ? 'typing' : 'idle')}
                disabled={isTyping}
                initialValue={suggestionText}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
