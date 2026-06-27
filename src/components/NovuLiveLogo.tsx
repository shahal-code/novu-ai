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
        }
        .novu-live-logo .hand {
          opacity: 0;
          transform: translateY(64px) scale(0.9);
          transition: opacity 180ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
          transform-box: fill-box;
          transform-origin: center;
        }
        .novu-live-logo .left-hand {
          transform: translate(34px, 64px) rotate(-18deg) scale(0.9);
        }
        .novu-live-logo .right-hand {
          transform: translate(-34px, 64px) rotate(18deg) scale(0.9);
        }
        .novu-live-logo.is-covering .eye,
        .novu-live-logo.is-covering .eye-highlight {
          animation: none;
          transform: scaleY(0.12);
        }
        .novu-live-logo.is-covering .eye-highlight {
          opacity: 0;
        }
        .novu-live-logo.is-looking .eye-group {
          transform: translate(10px, 10px);
        }
        .novu-live-logo.is-looking .eye {
          animation-duration: 6s;
        }
        .novu-live-logo.is-covering .left-hand {
          opacity: 1;
          transform: translate(0, 0) rotate(-8deg) scale(1);
        }
        .novu-live-logo.is-covering .right-hand {
          opacity: 1;
          transform: translate(0, 0) rotate(8deg) scale(1);
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
      `}</style>

      <rect width="512" height="512" rx="124" fill="url(#novuLogoBg)" />

      <g filter="url(#novuLogoGlow)" opacity="0.8" className="shine">
        <circle cx="150" cy="130" r="22" fill="#86efac" />
        <circle cx="378" cy="160" r="14" fill="#67e8f9" />
      </g>

      <g className="float">
        <path d="M148 144h216c35.3 0 64 28.7 64 64v84c0 35.3-28.7 64-64 64H278l-74 60c-7.3 5.9-18.1 0.7-18.1-8.6V356h-38.9c-35.3 0-64-28.7-64-64v-84c0-35.3 28.7-64 64-64Z" fill="url(#novuLogoBubble)" />
        <path d="M166 166h180c31.5 0 57 25.5 57 57v69c0 31.5-25.5 57-57 57H264l-56 45v-45h-42c-31.5 0-57-25.5-57-57v-69c0-31.5 25.5-57 57-57Z" fill="#f8fffb" opacity="0.55" />

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

        <g className="hand left-hand">
          <path d="M136 285c18-37 42-62 72-76 13-6 27 5 23 19l-17 57c-5 17-18 30-35 35l-24 7c-16 5-27-16-19-42Z" fill="#f8fffb" stroke="#d1fae5" strokeWidth="8" />
          <path d="M169 286c9-19 21-35 36-47" fill="none" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" opacity="0.45" />
        </g>
        <g className="hand right-hand">
          <path d="M376 285c-18-37-42-62-72-76-13-6-27 5-23 19l17 57c5 17 18 30 35 35l24 7c16 5 27-16 19-42Z" fill="#f8fffb" stroke="#d1fae5" strokeWidth="8" />
          <path d="M343 286c-9-19-21-35-36-47" fill="none" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" opacity="0.45" />
        </g>
      </g>
    </svg>
  );
}
