import { useState, useRef, useEffect, useCallback } from 'react';

interface InputBoxProps {
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled: boolean;
  initialValue?: string;
}

export default function InputBox({ onSend, onTyping, disabled, initialValue = '' }: InputBoxProps) {
  const [value, setValue] = useState<string>(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
      textareaRef.current?.focus();
    }
  }, [initialValue]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    
    if (onTyping) {
      onTyping(value.length > 0);
    }
  }, [value, onTyping]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = value.trim().length === 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6">
      <div className={`relative flex items-end w-full rounded-2xl bg-[var(--app-surface-solid)] border border-[var(--app-border)] shadow-sm transition-all focus-within:ring-2 focus-within:ring-[var(--app-primary-soft)] focus-within:border-[var(--app-primary)] ${disabled ? 'opacity-70' : ''}`}>
        <textarea
          ref={textareaRef}
          className="w-full resize-none bg-transparent px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 min-h-[52px]"
          placeholder="Message NovuAI..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          aria-label="Chat message input"
        />

        <button
          className={`m-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${isEmpty || disabled ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' : 'btn-primary'}`}
          onClick={handleSend}
          disabled={isEmpty || disabled}
          aria-label="Send message"
        >
          {disabled ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        NovuAI can make mistakes. Consider verifying important information.
      </p>
    </div>
  );
}
