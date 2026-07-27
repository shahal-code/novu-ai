import { useTheme } from '../context/ThemeContext';

export default function SeaDecorations() {
  const { theme } = useTheme();
  
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 3,
        pointerEvents: 'none',
      }}
    >


      {/* --- Starfish --- */}
      <div
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '12%',
          animation: 'starfishPulse 12s ease-in-out infinite alternate',
          filter: 'drop-shadow(0 4px 12px rgba(20, 184, 166, 0.3))',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Glassy starfish body */}
          <path
            d="M24 4 C26 16, 32 20, 44 22 C32 24, 30 32, 32 44 C26 34, 22 34, 16 44 C18 32, 16 24, 4 22 C16 20, 22 16, 24 4 Z"
            fill="rgba(253, 164, 175, 0.15)"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Inner pinkish glow */}
          <path
            d="M24 8 C25.5 17, 31 21, 40 22 C31 23, 29.5 29, 31 38 C25.5 30, 22.5 30, 17 38 C18.5 29, 17 23, 8 22 C17 21, 22.5 17, 24 8 Z"
            fill="url(#starfishGlow)"
            opacity="0.8"
          />
          {/* Little glowing dots */}
          <circle cx="24" cy="24" r="2.5" fill="#fda4af" />
          <circle cx="24" cy="14" r="1" fill="#ffffff" opacity="0.8" />
          <circle cx="34" cy="22" r="1" fill="#ffffff" opacity="0.8" />
          <circle cx="30" cy="32" r="1" fill="#ffffff" opacity="0.8" />
          <circle cx="18" cy="32" r="1" fill="#ffffff" opacity="0.8" />
          <circle cx="14" cy="22" r="1" fill="#ffffff" opacity="0.8" />

          <defs>
            <radialGradient id="starfishGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* --- Tiny Jellyfish --- */}
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '15%',
          animation: 'jellyFloat 16s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 16px rgba(134, 239, 172, 0.4))',
        }}
      >
        <div style={{ animation: 'jellyPulse 4s ease-in-out infinite' }}>
          <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Jellyfish bell (top) */}
            <path
              d="M4 16 C4 6, 12 2, 16 2 C20 2, 28 6, 28 16 C28 20, 24 22, 16 22 C8 22, 4 20, 4 16 Z"
              fill="rgba(134, 239, 172, 0.15)"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="1.5"
            />
            {/* Inner glow */}
            <path
              d="M8 15 C8 8, 12 6, 16 6 C20 6, 24 8, 24 15 C24 18, 20 19, 16 19 C12 19, 8 18, 8 15 Z"
              fill="url(#jellyGlow)"
              opacity="0.9"
            />
            {/* Tentacles */}
            <path d="M10 22 C8 28, 12 34, 10 42" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M16 22 C16 30, 18 36, 15 44" stroke="rgba(200, 255, 248, 0.6)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M22 22 C24 28, 20 34, 22 42" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            
            <defs>
              <radialGradient id="jellyGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* --- Swaying Kelp / Seaweed --- */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10px', // slightly below edge
          left: '5%',
          transformOrigin: 'bottom center',
          animation: 'kelpSway 6s ease-in-out infinite alternate',
          filter: 'drop-shadow(0 2px 8px rgba(6, 78, 59, 0.5))',
          zIndex: 4,
        }}
      >
        <svg width="40" height="120" viewBox="0 0 40 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 120 C20 100, 35 80, 20 60 C5 40, 30 20, 15 0" stroke="url(#kelpGradient)" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M15 120 C15 105, 5 90, 15 75 C25 60, 10 40, 25 20" stroke="url(#kelpGradient)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
          <defs>
            <linearGradient id="kelpGradient" x1="20" y1="120" x2="20" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '-5px',
          right: '25%',
          transformOrigin: 'bottom center',
          animation: 'kelpSway 8s ease-in-out infinite alternate-reverse',
          filter: 'drop-shadow(0 2px 8px rgba(6, 78, 59, 0.5))',
          zIndex: 4,
        }}
      >
        <svg width="30" height="90" viewBox="0 0 30 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 90 C15 75, 5 60, 15 45 C25 30, 5 15, 20 0" stroke="url(#kelpGradient)" strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      <style>{`
        @keyframes orbPulse {
          0% { transform: translateX(-50%) scale(1); opacity: 0.7; }
          100% { transform: translateX(-50%) scale(1.1); opacity: 1; }
        }
        @keyframes raySway {
          0% { transform: rotate(-5deg); opacity: 0.5; }
          100% { transform: rotate(5deg); opacity: 0.8; }
        }
        @keyframes kelpSway {
          0% { transform: rotate(-8deg); }
          100% { transform: rotate(8deg); }
        }
        @keyframes starfishPulse {
          0% { transform: scale(1) rotate(-4deg); opacity: 0.5; }
          100% { transform: scale(1.08) rotate(4deg); opacity: 0.85; }
        }
        @keyframes jellyFloat {
          0% { transform: translate(0px, 0px) rotate(-5deg); opacity: 0.4; }
          33% { transform: translate(15px, -30px) rotate(5deg); opacity: 0.8; }
          66% { transform: translate(-10px, -15px) rotate(-3deg); opacity: 0.6; }
          100% { transform: translate(0px, 0px) rotate(-5deg); opacity: 0.4; }
        }
        @keyframes jellyPulse {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50% { transform: scaleY(0.85) scaleX(1.1); } /* Squish */
        }
      `}</style>
    </div>
  );
}
