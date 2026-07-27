import { useState, useCallback, useRef, useEffect } from 'react';

interface Bubble {
  id: number;
  x: number;   // px from left of container
  y: number;   // px from top of container
  size: number;
  duration: number;
  dx: number;  // slight horizontal drift
}

let uid = 0;

/**
 * WaterBubbles — click-triggered rising bubbles.
 * The container listens to window clicks so it doesn't block UI buttons.
 */
export default function WaterBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Only spawn if click is inside the container
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }

      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const count = 6 + Math.floor(Math.random() * 5);
      const newBubbles: Bubble[] = Array.from({ length: count }, () => ({
        id: ++uid,
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 20,
        size: 5 + Math.random() * 14,
        duration: 1.2 + Math.random() * 1.4,
        dx: (Math.random() - 0.5) * 30,
      }));

      setBubbles((prev) => [...prev, ...newBubbles]);

      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => !newBubbles.find((nb) => nb.id === b.id)));
      }, 3000);
    };

    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 8,
        pointerEvents: 'none', /* IMPORTANT: Don't block clicks to buttons! */
      }}
    >
      {bubbles.map((b) => (
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
              rgba(255,255,255,0.85) 0%,
              rgba(255,255,255,0.22) 30%,
              rgba(180,255,240,0.06) 65%,
              transparent 100%
            )`,
            border: '1px solid rgba(200,255,248,0.55)',
            boxShadow: `
              0 0 ${b.size * 1.6}px rgba(94,234,212,0.30),
              inset 0 -1px 2px rgba(0,0,0,0.15)
            `,
            animation: `clickBubble ${b.duration}s ease-out forwards`,
            '--dx': `${b.dx}px`,
          } as React.CSSProperties}
        />
      ))}

      <style>{`
        @keyframes clickBubble {
          0% {
            transform: translate(-50%, -50%) translateX(0) scale(0.4);
            opacity: 0.9;
          }
          20% {
            transform: translate(-50%, -50%) translateX(calc(var(--dx) * 0.3)) translateY(-12px) scale(1);
            opacity: 0.85;
          }
          70% {
            transform: translate(-50%, -50%) translateX(var(--dx)) translateY(-80px) scale(1.05);
            opacity: 0.50;
          }
          100% {
            transform: translate(-50%, -50%) translateX(calc(var(--dx) * 1.2)) translateY(-140px) scale(1.15);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
