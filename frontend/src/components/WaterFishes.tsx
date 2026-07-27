import { useState, useEffect } from 'react';

interface Fish {
  id: number;
  y: number;       // vertical position percentage
  size: number;    // scale factor
  duration: number; // seconds to cross screen
  delay: number;    // animation delay
  direction: 1 | -1; // 1 for right-to-left, -1 for left-to-right
  wobbleSpeed: number; // how fast it bobs up and down
}

export default function WaterFishes({ count = 3 }: { count?: number }) {
  const [fishes, setFishes] = useState<Fish[]>([]);

  useEffect(() => {
    // Generate random fishes
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      y: 60 + Math.random() * 30, // swim in the lower 60-90% area (under the water)
      size: 0.6 + Math.random() * 0.8, // size scale 0.6x to 1.4x
      duration: 7 + Math.random() * 6, // swim across slower (7-13s)
      delay: Math.random() * 5, // stagger start times closer together
      direction: Math.random() > 0.5 ? 1 : -1,
      wobbleSpeed: 1.2 + Math.random() * 0.8, // slower tail wag cycle
    }));
    setFishes(generated as Fish[]);
  }, [count]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 4, // Behind glint/bubbles, but in the water
        pointerEvents: 'none',
      }}
    >
      {fishes.map((fish) => (
        <div
          key={fish.id}
          style={{
            position: 'absolute',
            top: `${fish.y}%`,
            /* Start completely off-screen depending on direction */
            left: fish.direction === 1 ? '110%' : '-20%',
            transform: `scale(${fish.size}) ${fish.direction === -1 ? 'scaleX(-1)' : ''}`,
            animation: `fishSwim ${fish.duration}s linear infinite`,
            animationDelay: `${fish.delay}s`,
            /* CSS variables to pass to the animation */
            '--start-left': fish.direction === 1 ? '110%' : '-20%',
            '--swim-end': fish.direction === 1 ? '-20%' : '110%',
            '--swim-wobble': `${fish.wobbleSpeed}s`,
            opacity: 0, // Starts hidden until animation kicks in
          } as React.CSSProperties}
        >
          {/* Bobbing wrapper */}
          <div style={{ animation: `fishBob var(--swim-wobble) ease-in-out infinite` }}>
            <svg
              width="48"
              height="32"
              viewBox="0 0 48 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(0px 4px 12px rgba(20, 184, 166, 0.4))',
              }}
            >
              {/* Tail fin (animated to wag) */}
              <g style={{ transformOrigin: '38px 16px', animation: `fishTail ${fish.wobbleSpeed / 2}s ease-in-out infinite alternate` }}>
                <path
                  d="M44 8 L32 16 L44 24 Z"
                  fill="rgba(200, 255, 248, 0.4)"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </g>

              {/* Main body (glassy droplet shape) */}
              <path
                d="M36 16 C36 24, 22 28, 12 28 C4 28, 2 20, 2 16 C2 12, 4 4, 12 4 C22 4, 36 8, 36 16 Z"
                fill="rgba(255, 255, 255, 0.15)"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="2"
              />
              
              {/* Glowing core/belly */}
              <path
                d="M30 16 C30 20, 20 22, 12 22 C6 22, 5 18, 5 16 C5 14, 6 10, 12 10 C20 10, 30 12, 30 16 Z"
                fill="url(#fishGlow)"
                opacity="0.6"
              />

              {/* Cute Eye (Novu logo style) */}
              <circle cx="10" cy="14" r="2.5" fill="#0f172a" />
              <circle cx="9" cy="13" r="1" fill="#ffffff" />
              
              {/* Fin */}
              <path
                d="M20 20 C24 24, 28 26, 26 22 Z"
                fill="rgba(255, 255, 255, 0.5)"
              />

              <defs>
                <radialGradient id="fishGlow" cx="0.5" cy="0.5" r="0.5" fx="0.3" fy="0.5">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes fishSwim {
          0% {
            left: var(--start-left);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            left: var(--swim-end);
            opacity: 0;
          }
        }

        @keyframes fishBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes fishTail {
          0% { transform: scaleX(1) rotate(-10deg); }
          100% { transform: scaleX(0.7) rotate(10deg); }
        }
      `}</style>
    </div>
  );
}
