const GREEN = "#22C55E";
const WHITE = "#FFFFFF";

export interface SharedGreenViewProps {
  ballAngle: number; // 0-360 degrees around the hole
  ballDistance: number; // 0-1 (fraction of green radius from center)
  breakDirection: "Left" | "Right";
}

/**
 * Overhead circular green with hole in center and ball positioned
 * around the hole by angle + distance. Predicted putt path curves
 * from the ball to the hole with a subtle green glow.
 */
export function SharedGreenView({
  ballAngle,
  ballDistance,
  breakDirection,
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
  // Perpendicular offset direction for the break bend
  const len = Math.max(1, Math.hypot(dx, dy));
  const perpX = -dy / len;
  const perpY = dx / len;
  const bendMag = 55 * (breakDirection === "Right" ? 1 : -1);
  const c1x = ballX + dx * 0.35 + perpX * bendMag * 0.4;
  const c1y = ballY + dy * 0.35 + perpY * bendMag * 0.4;
  const c2x = midX + perpX * bendMag;
  const c2y = midY + perpY * bendMag;

  const pathD = `M ${ballX} ${ballY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cx} ${cy}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Overhead view of green with predicted putt path"
    >
      <defs>
        <radialGradient id="sharedGreenGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1F6B3A" />
          <stop offset="70%" stopColor="#134523" />
          <stop offset="100%" stopColor="#0B2A16" />
        </radialGradient>
        <filter id="sharedGreenGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Circular green */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="url(#sharedGreenGrad)"
        stroke="#0F3A1E"
        strokeWidth="2"
      />

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

      {/* Predicted putt path glow */}
      <path
        d={pathD}
        stroke={GREEN}
        strokeWidth="8"
        strokeOpacity="0.25"
        strokeLinecap="round"
        fill="none"
        filter="url(#sharedGreenGlow)"
      />
      {/* Predicted putt path */}
      <path
        d={pathD}
        stroke={GREEN}
        strokeWidth="3"
        strokeDasharray="6 8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Hole in center */}
      <circle cx={cx} cy={cy} r="10" fill="#050505" stroke="#000" strokeWidth="1.5" />
      <line x1={cx} y1={cy} x2={cx} y2={cy - 70} stroke="#F5F5F5" strokeWidth="2" />
      <path
        d={`M ${cx} ${cy - 70} L ${cx + 30} ${cy - 62} L ${cx} ${cy - 54} Z`}
        fill={GREEN}
      />

      {/* Ball */}
      <circle cx={ballX} cy={ballY} r="11" fill={WHITE} stroke="#000" strokeWidth="1.5" />
      <circle
        cx={ballX}
        cy={ballY}
        r="11"
        fill="none"
        stroke={GREEN}
        strokeWidth="1.5"
        opacity="0.7"
      >
        <animate attributeName="r" from="11" to="20" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.7" to="0" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
