import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Paperclip, Loader2, X, FileText, Image as ImageIcon } from 'lucide-react';

interface InputBoxProps {
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled: boolean;
  initialValue?: string;
}

export default function InputBox({ onSend, onTyping, disabled, initialValue = '' }: InputBoxProps) {
  const [value, setValue] = useState<string>(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; content?: string; dataUrl?: string } | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
      textareaRef.current?.focus();
    }
  }, [initialValue]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('novuai_token')}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setAttachedFile({
        name: data.name,
        type: data.type,
        content: data.content,
        dataUrl: data.dataUrl,
      });
    } catch (err: any) {
      alert(`Error uploading file: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

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
    let finalContent = trimmed;

    if (attachedFile) {
      if (attachedFile.type === 'document' && attachedFile.content) {
        finalContent = `[Attached Document: ${attachedFile.name}]\n\n--- DOCUMENT CONTENT ---\n${attachedFile.content}\n--- END DOCUMENT ---\n\n${trimmed}`;
      } else if (attachedFile.type === 'image') {
        finalContent = `[Attached Image: ${attachedFile.name}] ${trimmed}`;
      }
    }

    if (!finalContent || disabled) return;
    
    onSend(finalContent);
    setValue('');
    setAttachedFile(null);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, attachedFile, onSend]);

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
          className="w-full resize-none bg-transparent pl-12 pr-2 py-4 text-[15px] text-white placeholder-zinc-400 focus:outline-none min-h-[56px] rounded-[24px]"
          placeholder="Message NovuAI..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          aria-label="Chat message input"
        />

        {attachedFile && (
          <div className="absolute left-4 -top-12 flex items-center gap-2 bg-zinc-800/80 backdrop-blur border border-white/10 rounded-xl px-3 py-1.5 shadow-lg animate-in fade-in slide-in-from-bottom-2">
            {attachedFile.type === 'image' ? <ImageIcon size={14} className="text-teal-400" /> : <FileText size={14} className="text-teal-400" />}
            <span className="text-xs font-medium text-white max-w-[150px] truncate">{attachedFile.name}</span>
            <button onClick={() => setAttachedFile(null)} className="ml-1 text-zinc-400 hover:text-rose-400 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.txt,image/*,audio/*,video/*"
          onChange={handleFileUpload}
        />

        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || disabled}
            className={`p-2 transition-colors ${isUploading ? 'text-teal-400' : 'text-zinc-400 hover:text-white'}`}
            title="Attach file (PDF, TXT, Image)"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 m-2">
          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`flex h-10 w-10 items-center justify-center rounded-[18px] transition-all ${isListening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
            title="Voice Input"
          >
            <Mic size={20} />
          </button>

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
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500">
        NovuAI can make mistakes. Consider verifying important information.
      </p>
    </div>
  );
}
