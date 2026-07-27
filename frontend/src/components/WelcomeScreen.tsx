import { useState, useMemo } from 'react';
import type { Conversation } from '../lib/api';
import { Plus, Mic, Newspaper, PenLine, Sparkles, Code, Terminal, Palette, Music, AudioLines, Headphones } from 'lucide-react';
import NovuLiveLogo from './NovuLiveLogo';
import WaterBubbles from './WaterBubbles';
import WaterWave from './WaterWave';

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
      <main className="auth-dialog relative w-full max-w-[500px] animate-fade-in px-5 py-10 sm:px-10 flex flex-col items-center">
        {/* Caustic water light spots */}
        <div className="auth-caustic-1" />
        <div className="auth-caustic-2" />
        {/* Single top wave line */}
        <WaterWave />
        {/* Rising glass bubbles on click */}
        <WaterBubbles />
        <div className="mb-6 flex flex-col items-center">
          <NovuLiveLogo status="greeting" className="auth-robot mb-4 h-14 w-14 rounded-2xl" />
          <h2 className="text-center text-3xl font-bold text-white">
            What's on your mind today?
          </h2>
        </div>

        <div className="w-full relative flex items-center mb-6">
        <div className="absolute left-4 text-zinc-400 z-10">
          <Plus className="h-5 w-5" />
        </div>
        <input 
          type="text" 
          placeholder="Ask anything" 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="auth-field w-full pl-12 pr-24 py-3.5 text-[15px]"
        />
        <div className="absolute right-3 flex items-center gap-2 z-10">
          <button className="text-zinc-400 hover:text-white transition-colors p-1" title="Voice Input">
             <Mic className="h-5 w-5" />
          </button>
          <div className="h-4 w-px bg-zinc-600" />
          <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider pl-1 pr-1">
            <AudioLines className="h-4 w-4" />
            Voice
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2.5">
        {activeSuggestions.map((sug) => (
          <button 
            key={sug.id}
            onClick={() => onSend(sug.text)}
            className="auth-provider justify-start pl-6"
          >
            <span className="text-zinc-400">
              {sug.icon}
            </span>
            <span className="text-[14px]">
              {sug.text}
            </span>
          </button>
        ))}
      </div>
      </main>
    </div>
  );
}
