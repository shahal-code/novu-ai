import { useState, useMemo } from 'react';
import type { Conversation } from '../lib/api';
import { Newspaper, PenLine, Sparkles, Code, Terminal, Palette, Music, AudioLines, Headphones } from 'lucide-react';
import WaterBubbles from './WaterBubbles';
import WaterWave from './WaterWave';
import WaterFishes from './WaterFishes';
import SeaDecorations from './SeaDecorations';
import SandLayer from './SandLayer';
import InputBox from './InputBox';

interface WelcomeScreenProps {
  conversations: Conversation[];
  onSend: (text: string) => void;
}

const CODING_KEYWORDS = ['code', 'react', 'html', 'error', 'bug', 'python', 'javascript', 'app', 'typescript', 'debug'];
const MUSIC_KEYWORDS = ['music', 'song', 'sing', 'lyrics', 'guitar', 'piano', 'band', 'album', 'jazz', 'hip-hop'];

export default function WelcomeScreen({ conversations, onSend }: WelcomeScreenProps) {
  const [value, setValue] = useState('');

  const typedTopic = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return null;

    if (CODING_KEYWORDS.some((k) => query.includes(k))) return 'coding';
    if (MUSIC_KEYWORDS.some((k) => query.includes(k))) return 'music';
    return 'general';
  }, [value]);

  const interest = useMemo(() => {
    if (typedTopic) return typedTopic;

    let codingScore = 0;
    let musicScore = 0;

    for (const conv of conversations) {
      const title = (conv.title || '').toLowerCase();
      if (CODING_KEYWORDS.some((k) => title.includes(k))) codingScore++;
      if (MUSIC_KEYWORDS.some((k) => title.includes(k))) musicScore++;
    }

    if (codingScore > musicScore && codingScore > 0) return 'coding';
    if (musicScore > codingScore && musicScore > 0) return 'music';
    return 'general';
  }, [conversations, typedTopic]);

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
    <div className="flex flex-1 flex-col items-center justify-center px-4 w-full h-full animate-fade-in relative z-10 overflow-hidden">
      {/* Water effects applied to full screen background instead of a card */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="auth-caustic-1" />
        <div className="auth-caustic-2" />
        <WaterWave />
        <SandLayer />
        <WaterBubbles />
        <WaterFishes count={6} />
        <SeaDecorations />
      </div>

      <main className="relative w-full max-w-3xl animate-fade-in flex flex-col items-center z-10 px-4">
        <div className="mb-8 flex flex-col items-center">
          <h2 className="text-center text-3xl font-display font-semibold text-white">
            Where should we begin?
          </h2>
        </div>

        {/* Water-swing wrapper — input bobs & sways like it floats on the surface */}
        <div className="w-full" style={{ animation: 'inputWaterSwing 4s ease-in-out infinite' }}>
          <InputBox onSend={onSend} disabled={false} />
        </div>

        <style>{`
          @keyframes inputWaterSwing {
            0%   { transform: translateY(0px) rotate(-0.4deg); }
            25%  { transform: translateY(-5px) rotate(0.3deg); }
            50%  { transform: translateY(-2px) rotate(-0.3deg); }
            75%  { transform: translateY(-6px) rotate(0.4deg); }
            100% { transform: translateY(0px) rotate(-0.4deg); }
          }
        `}</style>

      <div className="w-full flex flex-col gap-1 mt-4">
        {activeSuggestions.map((sug) => (
          <button 
            key={sug.id}
            onClick={() => onSend(sug.text)}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-300 text-left"
          >
            <span className="text-zinc-500">
              {sug.icon}
            </span>
            <span className="text-[15px] font-medium">
              {sug.text}
            </span>
          </button>
        ))}
      </div>
      </main>
    </div>
  );
}
