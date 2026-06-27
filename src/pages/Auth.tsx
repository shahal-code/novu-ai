import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { auth } from '../lib/api';
import NovuLiveLogo from '../components/NovuLiveLogo';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [lookingAtEmail, setLookingAtEmail] = useState<boolean>(false);
  const navigate = useNavigate();

  // Redirect already-logged-in users
  useEffect(() => {
    if (auth.isLoggedIn()) {
      auth.me().then((data) => {
        if (data) navigate('/chat');
      });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await auth.register(email, password);
      } else {
        await auth.login(email, password);
      }
      navigate('/chat');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError('');
  };

  return (
    <div className="page-scroll">
      <main className="auth-bg flex min-h-full flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="glass-panel w-full max-w-md animate-fade-in px-8 py-8">
          <div className="mb-8 flex flex-col items-center">
            <span className="mb-4 grid h-20 w-20 place-items-center">
              <NovuLiveLogo
                status={showPassword ? 'covering' : lookingAtEmail ? 'looking' : 'idle'}
                className="h-full w-full shadow-lg rounded-2xl"
              />
            </span>
            <h1 className="font-display text-4xl font-extrabold text-slate-800 dark:text-slate-100">
              Welcome to NovuAI
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login' ? 'Sign in to continue your chats.' : 'Create your account to start chatting.'}
            </p>
          </div>

          <div className="mb-6 flex space-x-4 border-b border-[var(--app-border)] pb-4">
            <button
              type="button"
              className={`pb-2 text-sm font-semibold transition-colors ${mode === 'login' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`pb-2 text-sm font-semibold transition-colors ${mode === 'signup' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}
              onClick={() => switchMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#6e7094] dark:text-[#c8ccff]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setLookingAtEmail(true)}
                  onBlur={() => setLookingAtEmail(false)}
                  placeholder="you@example.com"
                  className="cut-out novu-input w-full px-4 py-3 pl-10 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#6e7094] dark:text-[#c8ccff]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="cut-out novu-input w-full px-4 py-3 pl-10 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#6e7094] dark:text-[#c8ccff]">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              {mode === 'login' ? 'Register now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
