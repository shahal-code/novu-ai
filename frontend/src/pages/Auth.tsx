import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, MessageCircle, X } from 'lucide-react';
import { auth, setToken } from '../lib/api';
import NovuLiveLogo from '../components/NovuLiveLogo';
import WaterBubbles from '../components/WaterBubbles';
import WaterWave from '../components/WaterWave';
import WaterFishes from '../components/WaterFishes';
import SandLayer from '../components/SandLayer';
import SeaDecorations from '../components/SeaDecorations';
import { useGyroscope } from '../hooks/useGyroscope';

type Screen = 'start' | 'email-code' | 'password';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function Auth() {
  const [screen, setScreen] = useState<Screen>('start');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isCreatingPassword, setIsCreatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { tiltX } = useGyroscope();

  useEffect(() => {
    const token = params.get('token');
    const oauthError = params.get('auth_error');
    if (token) {
      setToken(token);
      navigate('/chat', { replace: true });
      return;
    }

    if (oauthError) setError(oauthError);
  }, [navigate, params]);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      setSessionChecked(true);
      return;
    }

    auth.me()
      .then((data) => {
        if (data) navigate('/chat', { replace: true });
        else setSessionChecked(true);
      })
      .catch(() => setSessionChecked(true));
  }, [navigate]);

  const run = async (work: () => Promise<void>) => {
    setError(''); setNotice(''); setLoading(true);
    try { await work(); } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const requestEmailCode = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => { await auth.requestEmailOtp(email); setScreen('email-code'); setNotice(`We sent a six-digit code to ${email}.`); });
  };
  const verifyEmailCode = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => { await auth.verifyEmailOtp(email, code); navigate('/chat', { replace: true }); });
  };
  const submitPassword = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      if (isCreatingPassword) await auth.register(email, password);
      else await auth.login(email, password);
      navigate('/chat', { replace: true });
    });
  };
  const goBack = () => { setError(''); setNotice(''); setCode(''); setScreen('start'); };
  const divider = <div className="my-5 flex items-center gap-3 whitespace-nowrap text-[11px] font-semibold tracking-[0.12em] text-zinc-500"><span className="h-px flex-1 bg-zinc-700" />OR CONTINUE WITH EMAIL<span className="h-px flex-1 bg-zinc-700" /></div>;
  const errorBlock = error && (
    <div role="alert" className="mt-4 flex items-center justify-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300 shadow-sm backdrop-blur-sm">
      <AlertCircle size={18} className="text-rose-400 shrink-0" />
      <p>{error}</p>
    </div>
  );
  const noticeBlock = notice && <p className="mt-4 text-center text-xs text-teal-300">{notice}</p>;

  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050708] text-white">
        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />
          <p className="text-sm text-zinc-300">Checking your session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-scroll auth-bg flex min-h-full items-center justify-center p-4">
      <main className="auth-dialog relative w-full max-w-[430px] animate-fade-in px-5 py-8 sm:px-10">
        <button type="button" onClick={() => navigate('/')} className="absolute right-5 top-5 text-zinc-300 transition hover:text-white z-20" aria-label="Close sign in"><X size={18} /></button>
        {screen !== 'start' && <button type="button" onClick={goBack} className="absolute left-5 top-5 text-zinc-300 transition hover:text-white z-20" aria-label="Go back"><ArrowLeft size={18} /></button>}
        {/* Gyro-tilt background wrapper */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none transition-transform duration-300 ease-out origin-center rounded-2xl overflow-hidden"
          style={{ 
            transform: `rotate(${-tiltX}deg) scale(1.15)`, 
          }}
        >
          {/* Caustic water light spots */}
          <div className="auth-caustic-1" />
          <div className="auth-caustic-2" />
          {/* Single top wave line */}
          <WaterWave />
          {/* Sandy seabed */}
          <SandLayer />
          {/* Rising glass bubbles on click */}
          <WaterBubbles />
          {/* Swimming small glass fishes */}
          <WaterFishes count={3} />
          {/* Starfish, Jellyfish & Kelp */}
          <SeaDecorations />
        </div>

        {/* All form content sits above the water layers */}
        <div style={{ position: 'relative', zIndex: 10 }}>

        {screen === 'start' && <>
          <div className="mb-6 flex flex-col items-center"><NovuLiveLogo status={loading ? 'thinking' : emailFocused ? 'looking' : 'greeting'} className="auth-robot mb-4 h-14 w-14 rounded-2xl" /><h1 className="text-center text-3xl font-bold text-white">Log in or sign up</h1><p className="mt-3 max-w-xs text-center text-sm leading-6 text-zinc-300">Get smarter responses and keep your NovuAI chats in sync.</p></div>
          <div className="space-y-2.5">
            <a href={`${BASE_URL}/api/auth/google`} className="auth-provider"><GoogleMark />Continue with Google</a>
            <button type="button" onClick={() => { setError(''); setNotice(''); setScreen('phone'); }} className="auth-provider"><MessageCircle className="text-[#25d366]" size={18} />Continue with WhatsApp</button>
          </div>
          {divider}
          <form onSubmit={requestEmailCode} noValidate>
            <label className="sr-only" htmlFor="auth-email">Email address</label>
            <div className="relative"><Mail className="absolute left-4 top-3.5 text-zinc-400" size={17} /><input id="auth-email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} className="auth-field pl-11" type="email" placeholder="Email address" autoComplete="email" required /></div>
            <button className="auth-continue" disabled={loading}>{loading ? 'Sending…' : 'Continue'}</button>
          </form>
          {errorBlock}
          <p className="mt-6 text-center text-xs text-zinc-400">By continuing, you agree to our Terms of Use and Privacy Policy.</p>
        </>}

        {screen === 'email-code' && <section className="pt-5"><h1 className="text-center text-3xl font-bold text-white">Check your inbox</h1><p className="mt-3 text-center text-sm leading-6 text-zinc-300">Enter the verification code sent to<br /><span className="text-white">{email}</span></p><form className="mt-7" onSubmit={verifyEmailCode}><label className="auth-label" htmlFor="email-code">Code</label><input id="email-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="auth-field text-center text-xl tracking-[0.45em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus /><button className="auth-continue" disabled={loading}>{loading ? 'Verifying…' : 'Continue'}</button></form>{noticeBlock}{errorBlock}<button type="button" onClick={() => void run(async () => { await auth.requestEmailOtp(email); setNotice('A new code is on its way.'); })} className="auth-link mx-auto mt-4 block" disabled={loading}>Resend email</button>{divider}<button type="button" onClick={() => { setError(''); setNotice(''); setScreen('password'); }} className="auth-provider"><LockKeyhole size={17} />Continue with password</button></section>}

        {screen === 'password' && <section className="pt-5"><h1 className="text-center text-3xl font-bold text-white">{isCreatingPassword ? 'Create a password' : 'Welcome back'}</h1><p className="mt-3 text-center text-sm text-zinc-300">{email}</p><form className="mt-7" onSubmit={submitPassword}><label className="auth-label" htmlFor="auth-password">Password</label><div className="relative"><LockKeyhole className="absolute left-4 top-3.5 text-zinc-400" size={17} /><input id="auth-password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-field pl-11 pr-11" type={showPassword ? 'text' : 'password'} autoComplete={isCreatingPassword ? 'new-password' : 'current-password'} minLength={8} required autoFocus /><button className="absolute right-3 top-3 text-zinc-400 hover:text-white" type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><button className="auth-continue" disabled={loading}>{loading ? 'Continuing…' : isCreatingPassword ? 'Create account' : 'Continue'}</button></form>{errorBlock}<button type="button" onClick={() => { setIsCreatingPassword((creating) => !creating); setError(''); }} className="auth-link mx-auto mt-5 block">{isCreatingPassword ? 'Already have a password? Sign in' : 'New here? Create a password'}</button></section>}

        </div> {/* end z-index wrapper */}
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="h-[19px] w-[19px]" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 12.24c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.51h3.14c1.84-1.69 2.91-4.19 2.91-7.27Z" />
      <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.51c-.87.58-1.99.93-3.31.93-2.54 0-4.69-1.71-5.46-4.02H3.3v2.59A9.75 9.75 0 0 0 12 21.75Z" />
      <path fill="#FBBC05" d="M6.54 13.79A5.86 5.86 0 0 1 6.24 12c0-.62.11-1.21.3-1.79V7.62H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.38l3.24-2.59Z" />
      <path fill="#EA4335" d="M12 6.19c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.27 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.37l3.24 2.59C7.31 7.9 9.46 6.19 12 6.19Z" />
    </svg>
  );
}

