const ACCENT = "#22C55E"; // --golf-accent
const WHITE = "#FFFFFF";
const DEEP = "#040906"; // --golf-deep
const MISS = "#EF4444"; // --golf-miss

export interface LivePath {
  /** Lateral deviation samples in feet (positive = right of the intended line) */
  deviation: number[];
  /** 1 = finishes at the hole, <1 = short, >1 = runs past */
  endScale: number;
}

export interface SharedGreenViewProps {
  ballAngle: number; // 0-360 degrees around the hole
  ballDistance: number; // 0-1 (fraction of green radius from center)
  breakDirection: "Left" | "Right";
  /** Optional actual ball path, drawn in red on top of the intended line */
  livePath?: LivePath;
  /** Duration of the live-path draw-in animation, in ms */
  liveDurationMs?: number;
}

/**
 * Overhead layered green with mowed-stripe texture, glowing hole + flag,
 * and a rich predicted putt path from the ball to the hole.
 */
export function SharedGreenView({
  ballAngle,
  ballDistance,
  breakDirection,
  livePath,
  liveDurationMs = 2400,
}: SharedGreenViewProps) {
  const W = 400;
  const H = 400;
  const cx = W / 2;
  const cy = H / 2;
  const rx = 175;
  const ry = 165;

  // Convert polar (angle 0° = up, growing clockwise) to cartesian
  const theta = (ballAngle - 90) * (Math.PI / 180);
  const clampedDist = Math.max(0.3, Math.min(0.95, ballDistance));
  const ballX = cx + Math.cos(theta) * rx * clampedDist;
  const ballY = cy + Math.sin(theta) * ry * clampedDist;

  // Build a curved control path from ball to hole; break bends the curve
  const dx = cx - ballX;
  const dy = cy - ballY;
  const midX = ballX + dx * 0.5;
  const midY = ballY + dy * 0.5;
  const len = Math.max(1, Math.hypot(dx, dy));
  const perpX = -dy / len;
  const perpY = dx / len;
  const bendMag = 55 * (breakDirection === "Right" ? 1 : -1);
  const c1x = ballX + dx * 0.35 + perpX * bendMag * 0.4;
  const c1y = ballY + dy * 0.35 + perpY * bendMag * 0.4;
  const c2x = midX + perpX * bendMag;
  const c2y = midY + perpY * bendMag;

  const pathD = `M ${ballX} ${ballY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cx} ${cy}`;

  // ---- Actual (live) path: intended bezier + perpendicular deviation ----
  const P0 = { x: ballX, y: ballY };
  const P1 = { x: c1x, y: c1y };
  const P2 = { x: c2x, y: c2y };
  const P3 = { x: cx, y: cy };

  const bez = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * u * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * P3.x,
      y: u * u * u * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * P3.y,
    };
  };
  // Tangent at the hole, used to extrapolate when the ball runs past
  const tangent = { x: P3.x - P2.x, y: P3.y - P2.y };
  const tangentLen = Math.max(1, Math.hypot(tangent.x, tangent.y));

  const buildLive = (live: LivePath) => {
    const samples = live.deviation.length;
    const FT_TO_PX = 26; // deviation feet → px, exaggerated for visibility
    const end = Math.max(0.5, live.endScale);
    const pts = live.deviation.map((devFt, i) => {
      const t = (i / (samples - 1)) * end;
      const base = t <= 1 ? bez(t) : {
        x: P3.x + (tangent.x / tangentLen) * (t - 1) * len,
        y: P3.y + (tangent.y / tangentLen) * (t - 1) * len,
      };
      return {
        x: base.x + perpX * devFt * FT_TO_PX,
        y: base.y + perpY * devFt * FT_TO_PX,
      };
    });
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const midXX = (pts[i].x + pts[i + 1].x) / 2;
      const midYY = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}, ${midXX.toFixed(1)} ${midYY.toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
    return { d, last };
  };

  const live = livePath ? buildLive(livePath) : null;
  const liveDur = `${liveDurationMs / 1000}s`;


  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Overhead view of green with predicted putt path"
    >
      <defs>
        <radialGradient id="sharedGreenGrad" cx="46%" cy="40%" r="68%">
          <stop offset="0%" stopColor="#2E8B4F" />
          <stop offset="45%" stopColor="#1B5C33" />
          <stop offset="78%" stopColor="#0F2A1A" />
          <stop offset="100%" stopColor={DEEP} />
        </radialGradient>
        <pattern id="mowStripes" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
          <rect width="14" height="28" fill="#FFFFFF" opacity="0.05" />
          <rect x="14" width="14" height="28" fill="#000000" opacity="0.07" />
        </pattern>
        <radialGradient id="greenSheen" cx="34%" cy="26%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shimmerGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="50%" stopColor="#86EFAC" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <clipPath id="greenClip">
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
        <filter id="sharedGreenGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="holeShadow" x="-120%" y="-120%" width="340%" height="340%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#000000" floodOpacity="0.75" />
        </filter>
      </defs>

      {/* Green base + layers */}
      <ellipse cx={cx} cy={cy + 6} rx={rx + 6} ry={ry + 6} fill="#000" opacity="0.45" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#sharedGreenGrad)" stroke={DEEP} strokeWidth="2" />
      <g clipPath="url(#greenClip)">
        <rect x="0" y="0" width={W} height={H} fill="url(#mowStripes)" />
        <rect x="0" y="0" width={W} height={H} fill="url(#greenSheen)" />
        {/* Ambient shimmer sweep */}
        <rect
          x={-W * 0.5}
          y="0"
          width={W * 0.55}
          height={H}
          fill="url(#shimmerGrad)"
          opacity="0.5"
        >
          <animate
            attributeName="x"
            from={-W * 0.6}
            to={W}
            dur="6s"
            repeatCount="indefinite"
          />
        </rect>
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />

      {/* Distance rings */}
      {[
        { r: 0.33, label: "10ft" },
        { r: 0.66, label: "20ft" },
      ].map((ring, i) => (
        <g key={i}>
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx * ring.r}
            ry={ry * ring.r}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeDasharray="3 5"
          />
          <text
            x={cx}
            y={cy - ry * ring.r - 4}
            textAnchor="middle"
            fontSize="9"
            fill="rgba(255,255,255,0.45)"
            letterSpacing="1"
          >
            {ring.label}
          </text>
        </g>
      ))}

      {/* Predicted putt path — wide glow */}
      <path
        d={pathD}
        stroke={ACCENT}
        strokeWidth="12"
        strokeOpacity="0.16"
        strokeLinecap="round"
        fill="none"
        filter="url(#sharedGreenGlow)"
      />
      <path
        d={pathD}
        stroke={ACCENT}
        strokeWidth="6"
        strokeOpacity="0.28"
        strokeLinecap="round"
        fill="none"
        filter="url(#sharedGreenGlow)"
      />
      {/* Predicted putt path — dashed core with travel animation */}
      <path
        d={pathD}
        stroke={ACCENT}
        strokeWidth="3"
        strokeDasharray="6 8"
        strokeLinecap="round"
        fill="none"
      >
        <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.2s" repeatCount="indefinite" />
      </path>
      {/* Travelling energy dot along the path */}
      <circle r="4" fill={WHITE} opacity="0.9">
        <animateMotion dur="2.4s" repeatCount="indefinite" path={pathD} />
      </circle>

      {/* Hole in center with shadow + halo */}
      <circle cx={cx} cy={cy} r="20" fill="#113821" />
      <circle cx={cx} cy={cy} r="10" fill="#050505" stroke="#000" strokeWidth="1.5" filter="url(#holeShadow)" />
      <ellipse cx={cx} cy={cy - 3} rx="8" ry="4" fill="#FFFFFF" opacity="0.06" />
      <line x1={cx} y1={cy} x2={cx} y2={cy - 70} stroke="#F5F5F5" strokeWidth="2" />
      <line x1={cx + 2} y1={cy} x2={cx + 14} y2={cy + 6} stroke="#000" strokeWidth="2" opacity="0.35" />
      <path
        d={`M ${cx} ${cy - 70} L ${cx + 30} ${cy - 62} L ${cx} ${cy - 54} Z`}
        fill={ACCENT}
        filter="url(#sharedGreenGlow)"
      />

      {/* Ball */}
      <ellipse cx={ballX + 3} cy={ballY + 5} rx="10" ry="5" fill="#000" opacity="0.5" />
      <circle cx={ballX} cy={ballY} r="11" fill={WHITE} stroke="#000" strokeWidth="1.5" />
      <circle cx={ballX - 3} cy={ballY - 4} r="3.5" fill="#FFFFFF" opacity="0.9" />
      <circle
        cx={ballX}
        cy={ballY}
        r="11"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.5"
        opacity="0.7"
      >
        <animate attributeName="r" from="11" to="20" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.7" to="0" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
