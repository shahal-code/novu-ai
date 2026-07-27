interface CountryUnavailableProps {
  countryCode?: string;
}

export default function CountryUnavailable({ countryCode }: CountryUnavailableProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050708] px-4 text-white">
      <div className="max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-pink-300">Unavailable in your region</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">This site is not available in your country.</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-300">
          NovuAI is currently available only for visitors in India.
        </p>
        {countryCode && (
          <p className="mt-4 text-sm text-zinc-400">
            Detected country code: <span className="font-semibold text-white">{countryCode}</span>
          </p>
        )}
      </div>
    </div>
  );
}
