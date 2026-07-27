/**
 * WaterWave — single top wave line at the glass/water boundary.
 * Only the front wave + surface glint. No stacked layers underneath.
 */
export default function WaterWave({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '40%',
        height: 60,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 6,
        ...style,
      }}
    >

      {/* Surface glint — bright shimmer line riding the wave */}
      <svg
        viewBox="0 0 1440 12"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200%',
          height: 12,
          animation: 'waveScroll 6s linear infinite',
          opacity: 0.70,
        }}
      >
        <path
          d="M0,4 C60,8 120,1 180,4 C240,8 300,1 360,4 C420,8 480,1 540,4 C600,8 660,1 720,4 C780,8 840,1 900,4 C960,8 1020,1 1080,4 C1140,8 1200,1 1260,4 C1320,8 1380,1 1440,4 C1500,8 1560,1 1620,4 C1680,8 1740,1 1800,4 C1860,8 1920,1 1980,4 C2040,8 2100,1 2160,4 C2220,8 2280,1 2340,4 C2400,8 2460,1 2520,4 C2580,8 2640,1 2700,4 C2760,8 2820,1 2880,4"
          fill="none"
          stroke="rgba(200,255,248,0.65)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
