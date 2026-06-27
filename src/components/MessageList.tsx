import { useEffect, useRef } from 'react';
import NovuLiveLogo from './NovuLiveLogo';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex w-full items-end gap-3 mb-6" aria-label="AI is typing">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        <NovuLiveLogo className="h-full w-full" />
      </div>
      <div className="bubble-them flex items-center gap-1 px-4 py-3 min-h-[44px]">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></span>
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></span>
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></span>
      </div>
    </div>
  );
}

function renderContent(content: string): React.ReactNode {
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={keyIdx++} className="whitespace-pre-wrap">
          {renderInline(content.slice(lastIndex, match.index))}
        </span>,
      );
    }
    parts.push(
      <div key={keyIdx++} className="my-3 overflow-hidden rounded-xl border border-slate-700 bg-[#0d1117] text-[13px] shadow-sm">
        {match[1] && (
          <div className="flex items-center justify-between border-b border-slate-700 bg-[#161b22] px-4 py-1.5 text-xs font-semibold text-slate-400">
            <span>{match[1]}</span>
          </div>
        )}
        <div className="overflow-x-auto p-4">
          <code className="font-mono text-slate-200">{match[2]}</code>
        </div>
      </div>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={keyIdx++} className="whitespace-pre-wrap">
        {renderInline(content.slice(lastIndex))}
      </span>,
    );
  }

  return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{content}</span>;
}

function renderInline(text: string): React.ReactNode[] {
  const inlineCodeRegex = /`([^`]+)`/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = inlineCodeRegex.exec(text)) !== null) {
    if (m.index > last) nodes.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    nodes.push(
      <code key={k++} className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-teal-700 dark:bg-slate-800 dark:text-teal-300 border border-slate-200 dark:border-slate-700">
        {m[1]}
      </code>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(<span key={k++}>{text.slice(last)}</span>);
  return nodes;
}

export default function MessageList({ messages, isTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8" role="log" aria-live="polite">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`mb-6 flex w-full items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-message-pop`}
        >
          {msg.role === 'assistant' && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center" aria-hidden="true">
              <NovuLiveLogo className="h-full w-full" />
            </div>
          )}

          <div className={`max-w-[85%] px-5 py-3.5 text-[15px] leading-relaxed ${msg.role === 'user' ? 'bubble-me' : 'bubble-them'}`}>
            {renderContent(msg.content)}
          </div>
        </div>
      ))}

      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
