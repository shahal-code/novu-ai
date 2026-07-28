/**
 * SandLayer — a realistic sandy seabed at the very bottom of the water scene.
 * Includes animated sand dunes, pebbles, ripple marks, and a subtle shimmer.
 */
export default function SandLayer() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '22%',
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      {/* ── Base sand gradient ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            rgba(180, 140, 80, 0.08) 10%,
            rgba(190, 148, 90, 0.18) 30%,
            rgba(200, 158, 95, 0.30) 55%,
            rgba(210, 165, 100, 0.50) 80%,
            rgba(215, 170, 105, 0.65) 100%
          )`,
        }}
      />

      {/* ── SVG dunes + ripple marks + pebbles ── */}
      <svg
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sand texture gradient */}
          <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(210,165,90,0.45)" />
            <stop offset="50%" stopColor="rgba(220,175,100,0.65)" />
            <stop offset="100%" stopColor="rgba(230,185,110,0.80)" />
          </linearGradient>

          {/* Shimmer sweep */}
          <linearGradient id="shimmerGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="rgba(255,235,180,0.0)" />
            <stop offset="50%" stopColor="rgba(255,245,200,0.18)" />
            <stop offset="60%" stopColor="rgba(255,235,180,0.0)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Dark shadow at the foot of each dune */}
          <linearGradient id="duneShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(100,70,30,0.25)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* ── Back dune (darker, further away) ── */}
        <path
          d="M0,120 C120,80 240,110 360,95 C480,80 600,115 720,100 C840,85 960,118 1080,105 C1200,90 1320,112 1440,100 L1440,180 L0,180 Z"
          fill="rgba(160,120,60,0.25)"
        />

        {/* ── Front dune ── */}
        <path
          d="M0,140 C100,115 220,138 360,128 C500,118 620,145 760,132 C900,120 1020,148 1160,135 C1300,122 1380,140 1440,130 L1440,180 L0,180 Z"
          fill="url(#sandGrad)"
        />

        {/* ── Ripple marks across the sand ── */}
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={`ripple-${i}`}
            d={`M${i * 290},${148 + i * 4} C${i * 290 + 80},${145 + i * 4} ${i * 290 + 180},${152 + i * 4} ${i * 290 + 290},${148 + i * 4}`}
            stroke="rgba(255,220,140,0.22)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <path
            key={`ripple2-${i}`}
            d={`M${i * 360 + 50},${158 + i * 2} C${i * 360 + 140},${155 + i * 2} ${i * 360 + 250},${162 + i * 2} ${i * 360 + 360},${158 + i * 2}`}
            stroke="rgba(255,210,120,0.16)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        ))}

        {/* ── Pebbles scattered on the sand ── */}
        {[
          { cx: 80,  cy: 152, rx: 7, ry: 4 },
          { cx: 200, cy: 160, rx: 5, ry: 3 },
          { cx: 370, cy: 155, rx: 9, ry: 5 },
          { cx: 520, cy: 163, rx: 6, ry: 3.5 },
          { cx: 680, cy: 150, rx: 8, ry: 4.5 },
          { cx: 830, cy: 158, rx: 5, ry: 3 },
          { cx: 980, cy: 153, rx: 10, ry: 5.5 },
          { cx: 1100, cy: 161, rx: 6, ry: 3 },
          { cx: 1260, cy: 156, rx: 7, ry: 4 },
          { cx: 1400, cy: 164, rx: 5, ry: 3 },
          { cx: 145, cy: 167, rx: 4, ry: 2.5 },
          { cx: 460, cy: 170, rx: 6, ry: 3.5 },
          { cx: 760, cy: 168, rx: 5, ry: 3 },
          { cx: 1050, cy: 172, rx: 7, ry: 4 },
          { cx: 1330, cy: 169, rx: 4, ry: 2.5 },
        ].map((p, i) => (
          <ellipse
            key={`pebble-${i}`}
            cx={p.cx}
            cy={p.cy}
            rx={p.rx}
            ry={p.ry}
            fill={i % 3 === 0
              ? 'rgba(180,140,75,0.60)'
              : i % 3 === 1
              ? 'rgba(140,110,60,0.55)'
              : 'rgba(160,125,70,0.50)'}
            stroke="rgba(255,230,160,0.25)"
            strokeWidth="0.8"
          />
        ))}

        {/* ── Shimmer sweep overlay (animated via CSS) ── */}
        <rect
          x="0" y="128" width="1440" height="52"
          fill="url(#shimmerGrad)"
          style={{ animation: 'sandShimmer 5s ease-in-out infinite' }}
        />
      </svg>

      <style>{`
        @keyframes sandShimmer {
          0%   { transform: translateX(-120%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
