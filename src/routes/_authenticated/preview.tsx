import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { getPrePuttRead } from "@/lib/previewService";
import { SharedGreenView } from "@/components/SharedGreenView";


export const Route = createFileRoute("/_authenticated/preview")({
  head: () => ({
    meta: [
      { title: "Preview — Putt Vector" },
      {
        name: "description",
        content: "Pre-putt read with distance, speed, break, and AI coaching.",
      },
      { property: "og:title", content: "Preview — Putt Vector" },
      {
        property: "og:description",
        content: "Pre-putt read with distance, speed, break, and AI coaching.",
      },
    ],
  }),
  component: PreviewPage,
});

const GREEN = "#22C55E";
const WHITE = "#FFFFFF";
const GRAY = "#9CA3AF";
const CARD = "#1C1C1E";
const COACHING_BG = "#26262A";

function MetricRow({
  label,
  value,
  valueColor = WHITE,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-baseline justify-between py-3 border-b border-[#2C2C2E] last:border-b-0">
      <span className="text-[11px] uppercase tracking-widest" style={{ color: GRAY }}>
        {label}
      </span>
      <span className="text-2xl font-semibold tracking-tight" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

// TODO: Replace with real-time camera feed from hardware SDK
function GreenView({
  breakDirection,
}: {
  breakDirection: "Left" | "Right";
  aimDirection: "Left" | "Right";
}) {
  // Circular green — hole in center, ball at bottom-left of center (left angle approach)
  const W = 400;
  const H = 400;
  const cx = W / 2;
  const cy = H / 2;
  const rx = 175;
  const ry = 165;
  const ballX = cx - 90;
  const ballY = cy + 110;
  const breakBias = breakDirection === "Right" ? 55 : -55;
  // Curved control points from ball up to hole
  const c1x = ballX + 10;
  const c1y = ballY - 60;
  const c2x = cx + breakBias;
  const c2y = cy + 40;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Overhead view of green with predicted putt path"
    >
      <defs>
        <radialGradient id="greenGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1F6B3A" />
          <stop offset="70%" stopColor="#134523" />
          <stop offset="100%" stopColor="#0B2A16" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Circular green */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#greenGrad)" stroke="#0F3A1E" strokeWidth="2" />

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
        d={`M ${ballX} ${ballY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cx} ${cy}`}
        stroke={GREEN}
        strokeWidth="8"
        strokeOpacity="0.25"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow)"
      />

      {/* Predicted putt path */}
      <path
        d={`M ${ballX} ${ballY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cx} ${cy}`}
        stroke={GREEN}
        strokeWidth="3"
        strokeDasharray="6 8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Hole in center */}
      <circle cx={cx} cy={cy} r="10" fill="#050505" stroke="#000" strokeWidth="1.5" />
      {/* Flag pole */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - 70} stroke="#F5F5F5" strokeWidth="2" />
      <path d={`M ${cx} ${cy - 70} L ${cx + 30} ${cy - 62} L ${cx} ${cy - 54} Z`} fill={GREEN} />

      {/* Ball */}
      <circle cx={ballX} cy={ballY} r="11" fill={WHITE} stroke="#000" strokeWidth="1.5" />
      <circle cx={ballX} cy={ballY} r="11" fill="none" stroke={GREEN} strokeWidth="1.5" opacity="0.7">
        <animate attributeName="r" from="11" to="20" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.7" to="0" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}


function PreviewPage() {
  const read = getPrePuttRead();

  return (
    <div className="min-h-[calc(100vh-5rem)] p-6">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-5">
        <div className="w-full flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GREEN }} />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: GREEN }}
          >
            {read.status}
          </span>
        </div>

        <h1 className="sr-only">Pre-Putt Read</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <div className="w-full rounded-2xl p-6" style={{ backgroundColor: CARD }}>
              <div className="flex flex-col">
                <MetricRow label="Distance" value={`${read.distanceFt} ft`} />
                <MetricRow label="Speed" value={`${read.speedMs} m/s`} />
                <MetricRow
                  label="Break"
                  value={`${read.breakDeg}° ${read.breakDirection}`}
                  valueColor={GREEN}
                />
                <MetricRow
                  label="Start Line"
                  value={`${read.startLineDeg}° ${read.startLineDirection}`}
                />
                <MetricRow label="Stimp" value={read.stimp.toString()} />
                <MetricRow
                  label="Aim Point"
                  value={`${read.aimPointFt} ft ${read.aimPointDirection}`}
                />
              </div>
            </div>

            <div
              className="w-full rounded-xl p-5"
              style={{ backgroundColor: COACHING_BG }}
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                AI Coaching
              </div>
              <p
                className="text-base italic leading-relaxed"
                style={{ color: GREEN }}
              >
                &ldquo;{read.coaching}&rdquo;
              </p>
            </div>
          </div>

          {/* Right column */}
          <div
            className="relative w-full rounded-2xl p-4 flex items-center justify-center"
            style={{ backgroundColor: CARD, minHeight: 520 }}
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-40" style={{ color: WHITE }}>
              <Camera size={12} strokeWidth={2} />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Live View</span>
            </div>
            <div className="w-full h-full max-h-[640px] flex items-center justify-center">
              <GreenView
                breakDirection={read.breakDirection}
                aimDirection={read.aimPointDirection}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full">
          <button
            className="flex-1 rounded-lg py-3.5 text-sm font-semibold tracking-wide"
            style={{ backgroundColor: GREEN, color: "#0A0A0A" }}
          >
            PREVIEW COMPLETE
          </button>
          <Link
            to="/practice"
            className="flex-1 rounded-lg py-3.5 text-sm font-semibold tracking-wide text-center border border-white"
            style={{ color: WHITE }}
          >
            START PRACTICE
          </Link>
        </div>
      </div>
    </div>
  );
}
