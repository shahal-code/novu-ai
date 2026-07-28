import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Globe, ExternalLink } from 'lucide-react';
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
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></span>
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></span>
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"></span>
      </div>
    </div>
  );
}

function renderMarkdown(content: string, messageId: string): React.ReactNode {
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...renderTextBlocks(content.slice(lastIndex, match.index), messageId, `text-${blockIndex}`));
    }

    const language = match[1];
    const code = match[2];
    const blockId = `${messageId}-code-${blockIndex}`;

    parts.push(renderCodeBlock(code, language, blockId));
    lastIndex = match.index + match[0].length;
    blockIndex += 1;
  }

  if (lastIndex < content.length) {
    parts.push(...renderTextBlocks(content.slice(lastIndex), messageId, `text-${blockIndex}`));
  }

  return parts.length > 0 ? <div className="space-y-4">{parts}</div> : <span className="whitespace-pre-wrap">{renderInline(content)}</span>;
}

function renderTextBlocks(text: string, messageId: string, keyPrefix: string): React.ReactNode[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let paragraphLines: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let quoteLines: string[] = [];
  let blockCounter = 0;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push(
      <p key={`${messageId}-${keyPrefix}-p-${blockCounter++}`} className="whitespace-pre-wrap leading-7 text-slate-200">
        {renderInline(paragraphLines.join('\n'))}
      </p>,
    );
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push(
      <div key={`${messageId}-${keyPrefix}-list-${blockCounter++}`} className="ml-5 mb-4">
        {listType === 'ol' ? (
          <ol className="list-decimal space-y-2 text-slate-200">
            {listItems.map((item, index) => (
              <li key={`${messageId}-${keyPrefix}-li-${index}`} className="whitespace-pre-wrap">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        ) : (
          <ul className="list-disc space-y-2 text-slate-200">
            {listItems.map((item, index) => (
              <li key={`${messageId}-${keyPrefix}-li-${index}`} className="whitespace-pre-wrap">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        )}
      </div>,
    );
    listType = null;
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) return;
    blocks.push(
      <blockquote key={`${messageId}-${keyPrefix}-quote-${blockCounter++}`} className="border-l-4 border-slate-600 pl-4 italic text-slate-300">
        {renderInline(quoteLines.join(' '))}
      </blockquote>,
    );
    quoteLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    const unorderedMatch = trimmed.match(/^([-+*])\s+(.*)$/);
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    const quoteMatch = trimmed.match(/^>\s?(.*)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = Math.min(6, headingMatch[1].length);
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      blocks.push(
        <HeadingTag key={`${messageId}-${keyPrefix}-h-${blockCounter++}`} className="text-slate-100 font-semibold">
          {renderInline(headingMatch[2])}
        </HeadingTag>,
      );
      continue;
    }

    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    if (unorderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== 'ul') {
        flushList();
      }
      listType = 'ul';
      listItems.push(unorderedMatch[2]);
      continue;
    }

    if (orderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== 'ol') {
        flushList();
      }
      listType = 'ol';
      listItems.push(orderedMatch[2]);
      continue;
    }

    flushList();
    flushQuote();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushQuote();

  return blocks.length > 0 ? blocks : [<span key={`${messageId}-${keyPrefix}-empty`} className="whitespace-pre-wrap">{renderInline(text)}</span>];
}

function renderCodeBlock(code: string, language: string, blockId: string): React.ReactNode {
  return (
    <div key={blockId} className="my-4 overflow-hidden rounded-3xl border border-slate-700 bg-[#0d1117] text-[13px] shadow-sm shadow-black/20">
      <div className="flex items-center justify-between border-b border-slate-700 bg-[#161b22] px-4 py-2 text-xs font-semibold text-slate-300">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={() => handleCopyCode(code, blockId)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200">
            <path d="M8 17H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
            <rect x="8" y="8" width="12" height="12" rx="2" />
          </svg>
          {copiedCodeId === blockId ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <code className="whitespace-pre-wrap break-words font-mono text-slate-100">
          {highlightCode(code, language)}
        </code>
      </div>
    </div>
  );
}

function highlightCode(code: string, language: string): React.ReactNode[] {
  const jsKeywords = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'async', 'await', 'import', 'from', 'export', 'default', 'class', 'extends', 'new', 'try', 'catch', 'throw', 'switch', 'case', 'break', 'continue', 'typeof', 'instanceof', 'null', 'undefined', 'true', 'false', 'this', 'super', 'constructor', 'static', 'get', 'set', 'await', 'Promise', 'console', 'log', 'map', 'filter', 'reduce', 'of', 'in', 'await', 'async', 'yield', 'return', 'else', 'const', 'let', 'var'
  ]);
  const pyKeywords = new Set([
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'as', 'class', 'try', 'except', 'finally', 'with', 'lambda', 'yield', 'None', 'True', 'False', 'self', 'async', 'await', 'pass', 'break', 'continue', 'in', 'is', 'and', 'or', 'not'
  ]);

  const stringRegex = /("[^"]*"|'[^']*'|`[^`]*`)/g;
  const keywordPattern = language.startsWith('py') ? '\\b(' + Array.from(pyKeywords).join('|') + ')\\b' : '\\b(' + Array.from(jsKeywords).join('|') + ')\\b';
  const tokenRegex = new RegExp(`(${stringRegex.source}|${keywordPattern})`, 'g');

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(code.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (stringRegex.test(token)) {
      nodes.push(<span key={lastIndex} className="text-emerald-300">{token}</span>);
    } else if (language.startsWith('py') ? pyKeywords.has(token) : jsKeywords.has(token)) {
      nodes.push(<span key={lastIndex} className="text-sky-300">{token}</span>);
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < code.length) {
    nodes.push(code.slice(lastIndex));
  }

  return nodes;
}

function renderInline(text: string): React.ReactNode[] {
  const inlineCodeRegex = /`([^`]+)`/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = inlineCodeRegex.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(
        <span key={k++}>
          {renderMarkdownInline(text.slice(last, m.index))}
        </span>,
      );
    }
    nodes.push(
      <code key={k++} className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-teal-300 border border-white/10">
        {m[1]}
      </code>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    nodes.push(
      <span key={k++}>
        {renderMarkdownInline(text.slice(last))}
      </span>,
    );
  }
  return nodes;
}

function renderMarkdownInline(text: string): React.ReactNode[] {
  const markdownRegex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|!\[([^\]]*)\]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = markdownRegex.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(<span key={key++}>{text.slice(last, match.index)}</span>);
    }

    if (match[1]) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key++}>{match[4]}</em>);
    } else if (match[5] !== undefined && match[6]) {
      nodes.push(
        <a href={match[6]} target="_blank" rel="noopener noreferrer" key={key++} className="block my-3">
          <img src={match[6]} alt={match[5] || 'Image'} className="rounded-xl max-w-full max-h-96 object-contain border border-white/10 shadow-lg" loading="lazy" />
        </a>
      );
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push(<span key={key++}>{text.slice(last)}</span>);
  }

  return nodes;
}

export default function MessageList({ messages, isTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [executing, setExecuting] = useState<Record<string, boolean>>({});
  const [outputs, setOutputs] = useState<Record<string, { stdout: string; stderr: string }>>({});

  useLayoutEffect(() => {
    const node = bottomRef.current;
    if (!node) return;

    const frame = requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: 'auto', block: 'end' });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, isTyping]);

  const toggleSpeech = (id: string, text: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    
    window.speechSynthesis.cancel(); // stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyCode = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(blockId);
      window.setTimeout(() => {
        setCopiedCodeId((current) => (current === blockId ? null : current));
      }, 2000);
    } catch {
      // ignore copy errors
    }
  };

  const handleRunCode = async (code: string, language: string, blockId: string) => {
    setExecuting((prev) => ({ ...prev, [blockId]: true }));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('novuai_token')}`,
        },
        body: JSON.stringify({ code, language: language || 'python' }),
      });
      const data = await res.json();
      setOutputs((prev) => ({
        ...prev,
        [blockId]: {
          stdout: data.stdout || '',
          stderr: data.stderr || data.error || '',
        },
      }));
    } catch (err: any) {
      setOutputs((prev) => ({
        ...prev,
        [blockId]: { stdout: '', stderr: err.message },
      }));
    } finally {
      setExecuting((prev) => ({ ...prev, [blockId]: false }));
    }
  };

  function renderContent(content: string, messageId: string): React.ReactNode {
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`${messageId}-text-${blockIndex}`} className="whitespace-pre-wrap">
            {renderInline(content.slice(lastIndex, match.index))}
          </span>,
        );
      }

      const language = match[1];
      const code = match[2];
      const codeBlockId = `${messageId}-code-${blockIndex}`;

      parts.push(renderCodeBlock(code, language, codeBlockId));
      lastIndex = match.index + match[0].length;
      blockIndex += 1;
    }

    if (lastIndex < content.length) {
      parts.push(
        <span key={`${messageId}-text-end`} className="whitespace-pre-wrap">
          {renderInline(content.slice(lastIndex))}
        </span>,
      );
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{renderInline(content)}</span>;
  }

  function renderCodeBlock(code: string, language: string, blockId: string): React.ReactNode {
    const isRunning = executing[blockId];
    const output = outputs[blockId];
    
    return (
      <div key={blockId} className="my-3 overflow-hidden rounded-xl border border-slate-700 bg-[#0d1117] text-[13px] shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-700 bg-[#161b22] px-4 py-1.5 text-xs font-semibold text-slate-400">
          <span>{language || 'code'}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRunCode(code, language, blockId)}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/10 px-2 py-1 text-[11px] font-semibold text-teal-400 transition hover:bg-teal-500/20 disabled:opacity-50"
            >
              {isRunning ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              )}
              Run
            </button>
            <button
              type="button"
              onClick={() => handleCopyCode(code, blockId)}
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200">
                <path d="M8 17H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                <rect x="8" y="8" width="12" height="12" rx="2" />
              </svg>
              {copiedCodeId === blockId ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="relative overflow-x-auto p-4">
          <code className="whitespace-pre-wrap break-words font-mono text-slate-200">{code}</code>
        </div>
        {output && (
          <div className="border-t border-slate-700 bg-black p-3 font-mono text-xs">
            {output.stdout && <div className="text-zinc-300 whitespace-pre-wrap">{output.stdout}</div>}
            {output.stderr && <div className="text-rose-400 whitespace-pre-wrap">{output.stderr}</div>}
            {!output.stdout && !output.stderr && <div className="text-zinc-500 italic">No output</div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-end px-4 py-8" role="log" aria-live="polite">
      <div className="flex-1">
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

            <div className="flex flex-col gap-1 max-w-[85%] w-full">
              {msg.role === 'assistant' && msg.searchResults && msg.searchResults.length > 0 && (
                <div className="mb-2 flex flex-col gap-2 bg-black/20 rounded-2xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
                    <Globe size={14} />
                    <span>Searched the web</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.searchResults.map((res: any, idx: number) => (
                      <a
                        key={idx}
                        href={res.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-xl px-3 py-2 text-[12px] border border-white/10 truncate max-w-[200px]"
                      >
                        <span className="text-zinc-300 truncate">{res.title}</span>
                        {res.url && <ExternalLink size={12} className="text-zinc-500 shrink-0" />}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className={`px-5 py-3.5 text-[15px] leading-relaxed w-fit ${msg.role === 'user' ? 'bubble-me ml-auto' : 'bubble-them'}`}>
                {renderContent(msg.content, msg.id)}
              </div>
              
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 pl-2">
                  <button
                    onClick={() => toggleSpeech(msg.id, msg.content)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors py-1"
                    title={speakingId === msg.id ? "Stop speaking" : "Read aloud"}
                  >
                    {speakingId === msg.id ? (
                      <>
                        <VolumeX size={14} className="text-teal-400" />
                        <span className="text-teal-400">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={14} />
                        <span>Read aloud</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
