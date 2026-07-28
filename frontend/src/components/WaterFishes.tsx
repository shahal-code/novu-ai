import { useState, useEffect, useRef } from 'react';

interface Fish {
  id: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  direction: 1 | -1; // 1 = swims left (faces left), -1 = swims right (faces right)
  wobbleSpeed: number;
}

interface FishBubble {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  dx: number;
}

let bubbleUid = 0;

export default function WaterFishes({ count = 3 }: { count?: number }) {
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [fishBubbles, setFishBubbles] = useState<FishBubble[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref array — one slot per fish, indexed by fish.id
  const fishRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Generate fishes on mount ── */
  useEffect(() => {
    const generated: Fish[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      y: 60 + Math.random() * 30,
      size: 0.6 + Math.random() * 0.8,
      duration: 7 + Math.random() * 6,
      delay: Math.random() * 5,
      direction: Math.random() > 0.5 ? 1 : -1,
      wobbleSpeed: 1.2 + Math.random() * 0.8,
    }));
    fishRefs.current = new Array(count).fill(null);
    setFishes(generated);
  }, [count]);

  /* ── Emit bubbles from each fish's mouth ── */
  useEffect(() => {
    if (fishes.length === 0) return;

    const interval = setInterval(() => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const newBubbles: FishBubble[] = [];

      fishes.forEach((fish) => {
        // ~55% chance any given fish emits this tick — natural, not every fish always blows bubbles
        if (Math.random() > 0.35) return;

        const fishEl = fishRefs.current[fish.id];
        if (!fishEl) return;

        const rect = fishEl.getBoundingClientRect();

        // Skip fish that are off-screen (inside the CSS animation start/end invisible zone)
        if (
          rect.right < containerRect.left - 10 ||
          rect.left > containerRect.right + 10 ||
          rect.width === 0
        ) return;

        /**
         * Fish SVG: head/mouth at LEFT side (x≈2–10), tail at RIGHT side (x≈44–48).
         * direction=1  → NO flip  → fish faces LEFT  → mouth is at rect.left
         * direction=-1 → scaleX(-1) → fish faces RIGHT → mouth is at rect.right
         */
        const mouthX =
          fish.direction === 1
            ? rect.left - containerRect.left        // facing left → mouth at left edge
            : rect.right - containerRect.left;       // facing right → mouth at right edge
        const mouthY = rect.top - containerRect.top + rect.height * 0.45;

        // Emit exactly 1 bubble per tick
        const emitCount = 1;
        for (let i = 0; i < emitCount; i++) {
          newBubbles.push({
            id: ++bubbleUid,
            x: mouthX + (Math.random() - 0.5) * 10,
            y: mouthY + (Math.random() - 0.5) * 6,
            size: 3 + Math.random() * 5,          // smaller than click bubbles
            duration: 2 + Math.random() * 2.5,    // 2–4.5 s rise
            dx: (fish.direction === 1 ? -1 : 1) * (4 + Math.random() * 12), // drift away from fish
          });
        }
      });

      if (newBubbles.length === 0) return;

      setFishBubbles((prev) => [...prev, ...newBubbles]);
      setTimeout(() => {
        setFishBubbles((prev) =>
          prev.filter((b) => !newBubbles.find((nb) => nb.id === b.id))
        );
      }, 6000);
    }, 900); // poll every 900 ms

    return () => clearInterval(interval);
  }, [fishes]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 4,
        pointerEvents: 'none',
      }}
    >
      {/* ── Fish ── */}
      {fishes.map((fish) => (
        <div
          key={fish.id}
          ref={(el) => { fishRefs.current[fish.id] = el; }}
          style={{
            position: 'absolute',
            top: `${fish.y}%`,
            left: fish.direction === 1 ? '110%' : '-20%',
            transform: `scale(${fish.size}) ${fish.direction === -1 ? 'scaleX(-1)' : ''}`,
            animation: `fishSwim ${fish.duration}s linear infinite`,
            animationDelay: `${fish.delay}s`,
            '--start-left': fish.direction === 1 ? '110%' : '-20%',
            '--swim-end': fish.direction === 1 ? '-20%' : '110%',
            '--swim-wobble': `${fish.wobbleSpeed}s`,
            opacity: 0,
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
              style={{ filter: 'drop-shadow(0px 4px 12px rgba(20, 184, 166, 0.4))' }}
            >
              {/* Tail fin */}
              <g style={{ transformOrigin: '38px 16px', animation: `fishTail ${fish.wobbleSpeed / 2}s ease-in-out infinite alternate` }}>
                <path
                  d="M44 8 L32 16 L44 24 Z"
                  fill="rgba(200, 255, 248, 0.4)"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </g>

              {/* Main body */}
              <path
                d="M36 16 C36 24, 22 28, 12 28 C4 28, 2 20, 2 16 C2 12, 4 4, 12 4 C22 4, 36 8, 36 16 Z"
                fill="rgba(255, 255, 255, 0.15)"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="2"
              />

              {/* Glowing belly */}
              <path
                d="M30 16 C30 20, 20 22, 12 22 C6 22, 5 18, 5 16 C5 14, 6 10, 12 10 C20 10, 30 12, 30 16 Z"
                fill="url(#fishGlow)"
                opacity="0.6"
              />

              {/* Eye */}
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

      {/* ── Fish-mouth bubbles ── */}
      {fishBubbles.map((b) => (
        <span
          key={b.id}
          style={{
            position: 'absolute',
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle at 32% 28%,
              rgba(255,255,255,0.90) 0%,
              rgba(255,255,255,0.25) 35%,
              rgba(180,255,240,0.08) 65%,
              transparent 100%
            )`,
            border: '1px solid rgba(200,255,248,0.60)',
            boxShadow: `0 0 ${b.size * 1.8}px rgba(94,234,212,0.35), inset 0 -1px 2px rgba(0,0,0,0.12)`,
            animation: `fishMouthBubble ${b.duration}s ease-out forwards`,
            '--dx': `${b.dx}px`,
          } as React.CSSProperties}
        />
      ))}

      <style>{`
        @keyframes fishSwim {
          0%   { left: var(--start-left); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { left: var(--swim-end); opacity: 0; }
        }

        @keyframes fishBob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }

        @keyframes fishTail {
          0%   { transform: scaleX(1) rotate(-10deg); }
          100% { transform: scaleX(0.7) rotate(10deg); }
        }

        @keyframes fishMouthBubble {
          0% {
            transform: translate(-50%,-50%) translateX(0) translateY(0) scale(0.3);
            opacity: 0.9;
          }
          15% { opacity: 0.75; }
          60% {
            transform: translate(-50%,-50%) translateX(calc(var(--dx)*0.6)) translateY(-50px) scale(1.05);
            opacity: 0.45;
          }
          100% {
            transform: translate(-50%,-50%) translateX(var(--dx)) translateY(-110px) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
