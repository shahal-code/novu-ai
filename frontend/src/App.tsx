import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth.tsx';
import Chat from './pages/Chat.tsx';
import CountryUnavailable from './pages/CountryUnavailable.tsx';

const INDIAN_COUNTRY_CODE = 'IN';
const GEO_API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/geo` : 'http://localhost:5000/api/geo';

export default function App() {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isAllowedCountry, setIsAllowedCountry] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const detectCountry = async () => {
      try {
        const response = await fetch(GEO_API_URL, { signal: controller.signal });
        if (!response.ok) throw new Error('Country detection failed');

        const data = await response.json();
        const code = (data.country_code || '').toUpperCase();
        setCountryCode(code || null);
        setIsAllowedCountry(code === INDIAN_COUNTRY_CODE);
      } catch {
        setCountryCode(null);
        setIsAllowedCountry(false);
      }
    };

    void detectCountry();
    return () => controller.abort();
  }, []);

  if (isAllowedCountry === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050708] text-white">
        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />
          <p className="text-sm text-zinc-300">Checking availability for your region…</p>
        </div>
      </div>
    );
  }

  if (!isAllowedCountry) {
    return <CountryUnavailable countryCode={countryCode ?? undefined} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth/callback" element={<Auth />} />
        <Route path="/chat" element={<Chat />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
