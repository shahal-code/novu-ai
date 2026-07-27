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
      <div className={`input-glass relative flex items-end w-full ${disabled ? 'opacity-70' : ''}`}>
        <textarea
          ref={textareaRef}
          className="w-full resize-none bg-transparent px-5 py-4 text-[15px] text-white placeholder-zinc-400 focus:outline-none min-h-[56px] rounded-[24px]"
          placeholder="Message NovuAI..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          aria-label="Chat message input"
        />

        <button
          className={`m-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] transition-all ${isEmpty || disabled ? 'bg-white/10 text-zinc-500' : 'bg-white text-black hover:-translate-y-[1px]'}`}
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
      <p className="mt-3 text-center text-xs text-zinc-500">
        NovuAI can make mistakes. Consider verifying important information.
      </p>
    </div>
  );
}
