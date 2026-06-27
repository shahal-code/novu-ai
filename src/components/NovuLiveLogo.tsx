interface NovuLiveLogoProps {
  status?: 'idle' | 'covering' | 'looking' | 'typing' | 'thinking' | 'success' | 'greeting';
  className?: string;
}

export default function NovuLiveLogo({ status = 'idle', className = "" }: NovuLiveLogoProps) {
  // Map legacy boolean props to status internally for Auth screen backwards compatibility if needed
  
  return (
    <svg
      className={`novu-live-logo is-${status} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      role="img"
      aria-label="NovuTalks live logo"
    >
      <defs>
        <linearGradient id="novuLogoBg" x1="88" y1="64" x2="424" y2="448" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0f172a" />
          <stop offset="0.55" stopColor="#0f766e" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="novuLogoBubble" x1="160" y1="144" x2="360" y2="368" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d1fae5" />
        </linearGradient>
        <filter id="novuLogoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.06  0 0 0 0 0.67  0 0 0 0 0.50  0 0 0 0.45 0" />
        </filter>
      </defs>

      <style>{`
        .novu-live-logo .float {
          animation: novuFloat 3.6s ease-in-out infinite;
          transform-origin: 256px 256px;
        }
        .novu-live-logo .shine {
          animation: novuShine 2.8s ease-in-out infinite;
        }
        .novu-live-logo .eye {
          transform-box: fill-box;
          transform-origin: center;
          animation: novuBlink 4.8s infinite;
          transition: transform 180ms ease;
        }
        .novu-live-logo .eye.delayed {
          animation-delay: 0.18s;
        }
        .novu-live-logo .eye-highlight {
          transform-box: fill-box;
          transform-origin: center;
          animation: novuBlink 4.8s infinite;
          transition: opacity 180ms ease, transform 180ms ease;
        }
        .novu-live-logo .eye-group {
          transition: transform 180ms ease;
        }
        .novu-live-logo .smile {
          animation: novuSmile 3.6s ease-in-out infinite;
          transform-origin: center;
          transition: transform 300ms ease, stroke-width 300ms ease;
        }
        .novu-live-logo .arm, .novu-live-logo .leg {
          transform-box: fill-box;
          transform-origin: center top;
          transition: transform 300ms ease, opacity 180ms ease;
        }
        .novu-live-logo .left-leg {
          animation: walkLeft 1.2s ease-in-out infinite alternate;
        }
        .novu-live-logo .right-leg {
          animation: walkRight 1.2s ease-in-out infinite alternate;
        }
        .novu-live-logo .left-arm {
          animation: walkRight 1.2s ease-in-out infinite alternate;
        }
        .novu-live-logo .right-arm {
          animation: walkLeft 1.2s ease-in-out infinite alternate;
        }
        
        /* Covering State */
        .novu-live-logo.is-covering .eye,
        .novu-live-logo.is-covering .eye-highlight {
          animation: none;
          transform: scaleY(0.12);
        }
        .novu-live-logo.is-covering .eye-highlight {
          opacity: 0;
        }
        .novu-live-logo.is-covering .left-arm {
          animation: none;
          transform: rotate(130deg);
        }
        .novu-live-logo.is-covering .right-arm {
          animation: none;
          transform: rotate(-130deg);
        }
        .novu-live-logo.is-covering .left-leg,
        .novu-live-logo.is-covering .right-leg {
          animation: none;
        }
        
        /* Looking State */
        .novu-live-logo.is-looking .eye-group {
          transform: translate(10px, 10px);
        }
        .novu-live-logo.is-looking .eye {
          animation-duration: 6s;
        }
        
        /* Typing State (Reading & Running) */
        .novu-live-logo.is-typing .eye-group {
          animation: novuRead 1.5s infinite ease-in-out;
        }
        .novu-live-logo.is-typing .eye {
          animation: none;
        }
        .novu-live-logo.is-typing .float {
          animation: novuFloat 0.8s ease-in-out infinite;
        }
        .novu-live-logo.is-typing .arm,
        .novu-live-logo.is-typing .leg {
          animation-duration: 0.25s;
        }
        
        /* Thinking State (Processing & Running) */
        .novu-live-logo.is-thinking .eye-group {
          animation: novuThink 1.2s infinite ease-in-out;
        }
        .novu-live-logo.is-thinking .eye {
          animation: none;
          transform: scaleY(0.6);
        }
        .novu-live-logo.is-thinking .float {
          animation: novuFloat 0.8s ease-in-out infinite;
        }
        .novu-live-logo.is-thinking .arm,
        .novu-live-logo.is-thinking .leg {
          animation-duration: 0.25s;
        }
        
        /* Success State */
        .novu-live-logo.is-success .smile {
          transform: translateY(2px) scale(1.1);
          stroke-width: 16;
        }
        .novu-live-logo.is-success .eye {
          animation: none;
          transform: scaleY(1.2);
        }
        .novu-live-logo.is-success .left-arm {
          animation: none;
          transform: rotate(150deg);
        }
        .novu-live-logo.is-success .right-arm {
          animation: none;
          transform: rotate(-150deg);
        }
        .novu-live-logo.is-success .left-leg,
        .novu-live-logo.is-success .right-leg {
          animation: none;
        }
        
        /* Greeting State */
        .novu-live-logo.is-greeting .right-arm {
          animation: novuWave 2.5s ease-in-out infinite;
        }
        .novu-live-logo.is-greeting .left-arm,
        .novu-live-logo.is-greeting .left-leg,
        .novu-live-logo.is-greeting .right-leg {
          animation: none;
        }
        
        @keyframes novuFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.01); }
        }
        @keyframes novuBlink {
          0%, 4%, 8%, 100% { transform: scaleY(1); }
          5.5% { transform: scaleY(0.12); }
          6.5% { transform: scaleY(1); }
        }
        @keyframes novuSmile {
          0%, 100% { transform: translateY(0px) scaleX(1); }
          50% { transform: translateY(1px) scaleX(1.03); }
        }
        @keyframes novuShine {
          0%, 100% { opacity: 0.65; transform: translateY(0px); }
          50% { opacity: 1; transform: translateY(-6px); }
        }
        @keyframes novuRead {
          0%, 100% { transform: translate(-15px, 0); }
          50% { transform: translate(15px, 0); }
        }
        @keyframes novuThink {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(8px, -8px); }
          50% { transform: translate(0, -12px); }
          75% { transform: translate(-8px, -8px); }
        }
        @keyframes walkLeft {
          0% { transform: rotate(30deg); }
          100% { transform: rotate(-30deg); }
        }
        @keyframes walkRight {
          0% { transform: rotate(-30deg); }
          100% { transform: rotate(30deg); }
        }
        @keyframes novuWave {
          0%, 100% { transform: rotate(-30deg); }
          20% { transform: rotate(-130deg); }
          40% { transform: rotate(-80deg); }
          60% { transform: rotate(-130deg); }
          80% { transform: rotate(-80deg); }
        }
      `}</style>

      <rect width="512" height="512" rx="124" fill="url(#novuLogoBg)" />

      <g filter="url(#novuLogoGlow)" opacity="0.8" className="shine">
        <circle cx="150" cy="130" r="22" fill="#86efac" />
        <circle cx="378" cy="160" r="14" fill="#67e8f9" />
      </g>

      <g className="float">
        {/* Legs */}
        <g className="leg left-leg">
          <path d="M170 340v60" fill="none" stroke="#d1fae5" strokeWidth="24" strokeLinecap="round" />
          <path d="M170 340v60" fill="none" stroke="#0f766e" strokeWidth="24" strokeLinecap="round" opacity="0.3" />
        </g>
        <g className="leg right-leg">
          <path d="M342 340v60" fill="none" stroke="#d1fae5" strokeWidth="24" strokeLinecap="round" />
          <path d="M342 340v60" fill="none" stroke="#0f766e" strokeWidth="24" strokeLinecap="round" opacity="0.3" />
        </g>

        {/* Antenna */}
        <path d="M256 144v-36" fill="none" stroke="#67e8f9" strokeWidth="10" strokeLinecap="round" />
        <circle cx="256" cy="100" r="14" fill="#22c55e" />

        {/* Robot Head (replaces message body) */}
        <rect x="84" y="144" width="344" height="212" rx="64" fill="url(#novuLogoBubble)" />
        <rect x="109" y="166" width="294" height="183" rx="57" fill="#f8fffb" opacity="0.55" />

        <g className="eye-group">
          <circle cx="210" cy="252" r="17" fill="#0f172a" className="eye" />
          <circle cx="302" cy="252" r="17" fill="#0f172a" className="eye delayed" />
          <ellipse cx="210" cy="245" rx="15" ry="14" fill="#ffffff" opacity="0.22" className="eye-highlight" />
          <ellipse cx="302" cy="245" rx="15" ry="14" fill="#ffffff" opacity="0.22" className="eye-highlight delayed" />
        </g>

        <path d="M214 294c10 14 30 22 42 8" fill="none" stroke="#0f766e" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" className="smile" />
        <path d="M211 298c14 10 33 10 45 0" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.85" className="smile" />
        <path d="M207 301c10 18 47 22 59 5" fill="none" stroke="#14b8a6" strokeWidth="8" strokeLinecap="round" opacity="0.34" className="smile" />

        <circle cx="177" cy="290" r="8" fill="#fda4af" opacity="0.75" />
        <circle cx="335" cy="290" r="8" fill="#fda4af" opacity="0.75" />

        <path d="M196 225c8-11 20-17 34-17" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" opacity="0.55" />
        <path d="M284 225c8-11 20-17 34-17" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" opacity="0.55" />

        {/* Arms */}
        <g className="arm left-arm">
          <path d="M60 220v80" fill="none" stroke="#d1fae5" strokeWidth="24" strokeLinecap="round" />
          <path d="M60 220v80" fill="none" stroke="#0f766e" strokeWidth="24" strokeLinecap="round" opacity="0.3" />
        </g>
        <g className="arm right-arm">
          <path d="M452 220v80" fill="none" stroke="#d1fae5" strokeWidth="24" strokeLinecap="round" />
          <path d="M452 220v80" fill="none" stroke="#0f766e" strokeWidth="24" strokeLinecap="round" opacity="0.3" />
        </g>
      </g>
    </svg>
  );
}
