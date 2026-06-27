import { useState, useMemo } from 'react';
import type { Conversation } from '../lib/api';
import { Plus, Mic, Newspaper, PenLine, Sparkles, Code, Terminal, Palette, Music, AudioLines, Headphones } from 'lucide-react';
import NovuLiveLogo from './NovuLiveLogo';

interface WelcomeScreenProps {
  conversations: Conversation[];
  onSend: (text: string) => void;
}

const CODING_KEYWORDS = ['code', 'react', 'html', 'error', 'bug', 'python', 'javascript', 'app', 'typescript', 'debug'];
const MUSIC_KEYWORDS = ['music', 'song', 'sing', 'lyrics', 'guitar', 'piano', 'band', 'album', 'jazz', 'hip-hop'];

export default function WelcomeScreen({ conversations, onSend }: WelcomeScreenProps) {
  const [value, setValue] = useState('');

  const interest = useMemo(() => {
    let codingScore = 0;
    let musicScore = 0;

    for (const conv of conversations) {
      const title = (conv.title || '').toLowerCase();
      if (CODING_KEYWORDS.some(k => title.includes(k))) codingScore++;
      if (MUSIC_KEYWORDS.some(k => title.includes(k))) musicScore++;
    }

    if (codingScore > musicScore && codingScore > 0) return 'coding';
    if (musicScore > codingScore && musicScore > 0) return 'music';
    return 'general';
  }, [conversations]);

  const SUGGESTIONS = {
    coding: [
      { id: 'c1', icon: <Code className="h-4 w-4" />, text: 'Help me debug a React component' },
      { id: 'c2', icon: <Terminal className="h-4 w-4" />, text: 'Explain how async/await works' },
      { id: 'c3', icon: <Palette className="h-4 w-4" />, text: 'Write a Python script for web scraping' },
    ],
    music: [
      { id: 'm1', icon: <Music className="h-4 w-4" />, text: 'Suggest some good jazz albums' },
      { id: 'm2', icon: <AudioLines className="h-4 w-4" />, text: 'How do I write a chord progression?' },
      { id: 'm3', icon: <Headphones className="h-4 w-4" />, text: 'Explain the history of hip-hop' },
    ],
    general: [
      { id: 'g1', icon: <Newspaper className="h-4 w-4" />, text: "Explain today's news simply" },
      { id: 'g2', icon: <PenLine className="h-4 w-4" />, text: 'Write polite group message' },
      { id: 'g3', icon: <Sparkles className="h-4 w-4" />, text: 'Create a short story for me' },
    ],
  };

  const activeSuggestions = SUGGESTIONS[interest as keyof typeof SUGGESTIONS];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const text = value.trim();
      if (text) onSend(text);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 w-full h-full animate-fade-in relative z-10">
      <div className="mb-8 flex place-items-center">
        <NovuLiveLogo status="greeting" className="h-24 w-24 shadow-xl shadow-emerald-500/20 rounded-3xl" />
      </div>
      <h2 className="mb-6 font-display text-2xl md:text-3xl font-medium text-slate-800 dark:text-slate-100 text-center">
        What's on your mind today?
      </h2>

      <div className="w-full max-w-2xl relative flex items-center bg-[var(--app-surface-solid)] border border-[var(--app-border)] rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-[var(--app-primary-soft)] focus-within:border-[var(--app-primary)] mb-6">
        <div className="pl-5 pr-3 text-slate-400">
          <Plus className="h-5 w-5" />
        </div>
        <input 
          type="text" 
          placeholder="Ask anything" 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent py-3.5 text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100"
        />
        <div className="flex items-center gap-3 pr-5 pl-2">
          <button className="text-slate-400 hover:text-[var(--app-primary)] transition-colors" title="Voice Input">
             <Mic className="h-5 w-5" />
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[var(--app-primary)] transition-colors uppercase tracking-wider">
            <AudioLines className="h-4 w-4" />
            Voice
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-2 pl-4">
        {activeSuggestions.map((sug) => (
          <button 
            key={sug.id}
            onClick={() => onSend(sug.text)}
            className="flex items-center gap-4 py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left group w-fit"
          >
            <span className="text-slate-400 group-hover:text-[var(--app-primary)] transition-colors">
              {sug.icon}
            </span>
            <span className="text-[13px] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
              {sug.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
