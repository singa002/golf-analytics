import { motion } from "motion/react";
import { useState } from "react";

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

export interface PuttDot {
  /** -1..1 lateral position (fraction of green radius) */
  x: number;
  /** 0..1 depth position (fraction of green radius) */
  y: number;
  result: "made" | "missed";
}

export interface SharedGreenViewProps {
  ballAngle: number; // 0-360 degrees around the hole
  ballDistance: number; // 0-1 (fraction of green radius from center)
  breakDirection: "Left" | "Right";
  /** Optional actual ball path, drawn in red on top of the intended line */
  livePath?: LivePath;
  /** Duration of the live-path draw-in animation, in ms */
  liveDurationMs?: number;
  /** Optional scatter of previous putts to plot on the green */
  putts?: PuttDot[];
  /** Hide the white ball + aim pulse (e.g. pure putt-map usage) */
  showBall?: boolean;
  /** Hide the green predicted putt path */
  showPredictedPath?: boolean;
  /** Play a made-putt celebration ring pulse around the hole */
  celebrate?: boolean;
}

/**
 * Overhead layered green with mowed-stripe texture, organic turf grain,
 * a recessed glowing hole + weighted flag, and a rich predicted putt path.
 */
export function SharedGreenView({
  ballAngle,
  ballDistance,
  breakDirection,
  livePath,
  liveDurationMs = 2400,
  putts,
  showBall = true,
  showPredictedPath = true,
  celebrate = false,
}: SharedGreenViewProps) {
  const W = 400;
  const H = 400;
  const cx = W / 2;
  const cy = H / 2;
  const rx = 175;
  const ry = 165;
  const [hovered, setHovered] = useState<number | null>(null);

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
        <linearGradient id="sharedGreenTint" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.14" />
          <stop offset="55%" stopColor="#16A34A" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#04120A" stopOpacity="0.35" />
        </linearGradient>
        <pattern id="mowStripes" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
          <rect width="14" height="28" fill="#8FE6AC" opacity="0.06" />
          <rect x="14" width="14" height="28" fill="#000000" opacity="0.09" />
        </pattern>
        <pattern id="mowStripesFine" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
          <rect width="4" height="8" fill="#FFFFFF" opacity="0.025" />
        </pattern>
        {/* Organic turf grain */}
        <filter id="turfGrain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="7" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" />
        </filter>
        <radialGradient id="greenSheen" cx="34%" cy="26%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="greenVignette" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
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
        <filter id="flagShadow" x="-80%" y="-80%" width="260%" height="260%">
          <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.6" />
        </filter>
        {/* Recessed hole depression */}
        <radialGradient id="holeDepression" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#06180D" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0B2614" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="poleGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8A8F8A" />
          <stop offset="40%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#6E736E" />
        </linearGradient>
        <linearGradient id="flagGrad" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <radialGradient id="dotMadeGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#BBF7D0" />
          <stop offset="55%" stopColor={ACCENT} />
          <stop offset="100%" stopColor="#0F5A2B" />
        </radialGradient>
        <radialGradient id="dotMissGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FECACA" />
          <stop offset="55%" stopColor={MISS} />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>
      </defs>

      {/* Green base + layers */}
      <ellipse cx={cx} cy={cy + 6} rx={rx + 6} ry={ry + 6} fill="#000" opacity="0.45" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#sharedGreenGrad)" stroke={DEEP} strokeWidth="2" />
      <g clipPath="url(#greenClip)">
        <rect x="0" y="0" width={W} height={H} fill="url(#mowStripes)" />
        <rect x="0" y="0" width={W} height={H} fill="url(#mowStripesFine)" />
        <rect x="0" y="0" width={W} height={H} fill="url(#sharedGreenTint)" />
        {/* Organic turf grain (feTurbulence) */}
        <rect
          x="0"
          y="0"
          width={W}
          height={H}
          filter="url(#turfGrain)"
          opacity="0.14"
          style={{ mixBlendMode: "overlay" }}
        />
        <rect x="0" y="0" width={W} height={H} fill="url(#greenSheen)" />
        <rect x="0" y="0" width={W} height={H} fill="url(#greenVignette)" />
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
      {showPredictedPath && (
        <>
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
        </>
      )}

      {/* Hole in center — recessed depression, rim highlight, dark cup */}
      <circle cx={cx} cy={cy} r="28" fill="url(#holeDepression)" />
      <circle cx={cx} cy={cy} r="20" fill="#113821" opacity="0.9" />
      <circle cx={cx} cy={cy} r="14" fill="none" stroke="#000" strokeWidth="3" opacity="0.35" />
      <circle cx={cx} cy={cy} r="10.5" fill="none" stroke="#DCE6DC" strokeWidth="1" opacity="0.45" />
      <circle cx={cx} cy={cy} r="10" fill="#050505" stroke="#000" strokeWidth="1.5" filter="url(#holeShadow)" />
      <ellipse cx={cx} cy={cy - 3.5} rx="7.5" ry="3.5" fill="#FFFFFF" opacity="0.09" />

      {/* Made-putt celebration pulse */}
      {celebrate && (
        <>
          {[0, 0.35].map((delay, i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={12}
              fill="none"
              stroke={ACCENT}
              strokeWidth={2.5}
              initial={{ scale: 0.5, opacity: 0.85 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{
                duration: 1.6,
                delay,
                repeat: Infinity,
                repeatDelay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              filter="url(#sharedGreenGlow)"
            />
          ))}
        </>
      )}

      {/* Flag — weighted pole with gradient + shadow */}
      <g filter="url(#flagShadow)">
        <line x1={cx + 2} y1={cy} x2={cx + 15} y2={cy + 7} stroke="#000" strokeWidth="2" opacity="0.3" />
        <rect x={cx - 1.6} y={cy - 71} width="3.2" height="71" rx="1.6" fill="url(#poleGrad)" />
        <circle cx={cx} cy={cy - 72} r="2.6" fill="#F5F5F5" />
        <path
          d={`M ${cx + 1.5} ${cy - 70} Q ${cx + 20} ${cy - 68}, ${cx + 31} ${cy - 62} Q ${cx + 18} ${cy - 58}, ${cx + 1.5} ${cy - 54} Z`}
          fill="url(#flagGrad)"
        />
        <path
          d={`M ${cx + 1.5} ${cy - 70} Q ${cx + 20} ${cy - 68}, ${cx + 31} ${cy - 62}`}
          stroke="#BBF7D0"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
      </g>

      {/* Previous putts scatter — depth + spring entrance + hover */}
      {putts?.map((p, i) => {
        const px = Number((cx + p.x * rx * 0.85).toFixed(2));
        const py = Number((cy + p.y * ry * 0.85).toFixed(2));
        const made = p.result === "made";
        const color = made ? ACCENT : MISS;
        const isHover = hovered === i;
        return (
          <motion.g
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isHover ? 1.35 : 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, delay: i * 0.045 }}
            style={{ transformOrigin: `${px}px ${py}px`, cursor: "pointer" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
          >
            <circle cx={px} cy={py} r={11} fill={color} opacity={0.16} filter="url(#sharedGreenGlow)" />
            <ellipse cx={px + 1} cy={py + 2.5} rx={5} ry={3.5} fill="#000" opacity="0.45" />
            <circle
              cx={px}
              cy={py}
              r={5.5}
              fill={made ? "url(#dotMadeGrad)" : "url(#dotMissGrad)"}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="0.8"
            />
            <circle cx={px - 1.6} cy={py - 1.8} r={1.5} fill="#FFFFFF" opacity="0.7" />
            <title>{`Putt ${i + 1} — ${made ? "Made" : "Missed"}`}</title>
          </motion.g>
        );
      })}

      {/* Actual ball path (live) — red, draws in over the intended line */}
      {live && (
        <g>
          <path
            d={live.d}
            pathLength={1000}
            stroke={MISS}
            strokeWidth="10"
            strokeOpacity="0.18"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="1000"
            filter="url(#sharedGreenGlow)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1000"
              to="0"
              dur={liveDur}
              fill="freeze"
            />
          </path>
          <path
            d={live.d}
            pathLength={1000}
            stroke={MISS}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="1000"
            filter="url(#sharedGreenGlow)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1000"
              to="0"
              dur={liveDur}
              fill="freeze"
            />
          </path>
          {/* Rolling ball marker riding the actual path */}
          <circle r="7" fill={WHITE} stroke={MISS} strokeWidth="2">
            <animateMotion dur={liveDur} fill="freeze" path={live.d} />
          </circle>
        </g>
      )}

      {/* Ball */}
      {showBall && (
        <>
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
        </>
      )}
    </svg>
  );
}
