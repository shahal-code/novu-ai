import { useState, useEffect } from 'react';
import { X, Trash2, Brain } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [facts, setFacts] = useState<{ _id: string; text: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadMemory();
    }
  }, [isOpen]);

  const loadMemory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/memory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('novuai_token')}` },
      });
      const data = await res.json();
      setFacts(data.facts || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const deleteFact = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/memory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('novuai_token')}` },
      });
      setFacts((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllMemory = async () => {
    if (!window.confirm('Are you sure you want to clear all memory? NovuAI will forget everything about you.')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/memory`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('novuai_token')}` },
      });
      setFacts([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#0a0f12] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-white">
            <Brain size={20} className="text-teal-400" />
            <h2 className="font-semibold">Memory & Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">What NovuAI remembers about you</h3>
          
          {loading ? (
            <div className="flex justify-center p-8 text-zinc-500 text-sm">Loading memories...</div>
          ) : facts.length === 0 ? (
            <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/5 border-dashed">
              <p className="text-zinc-500 text-sm">NovuAI hasn't learned anything about you yet. Try telling it your name or preferences in chat!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {facts.map((fact) => (
                <div key={fact._id} className="flex items-start justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group">
                  <span className="text-sm text-zinc-300 leading-snug">{fact.text}</span>
                  <button
                    onClick={() => deleteFact(fact._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
                    title="Forget this"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-white/10 bg-white/5">
          <button
            onClick={clearAllMemory}
            disabled={facts.length === 0}
            className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-medium border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            Clear all memory
          </button>
        </div>
      </div>
    </div>
  );
}
