import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { getPrePuttRead } from "@/lib/previewService";

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
  aimDirection,
}: {
  breakDirection: "Left" | "Right";
  aimDirection: "Left" | "Right";
}) {
  // Ball at bottom center, hole near top center. Aim is left, right break bends the path to the right.
  const ballX = 200;
  const ballY = 520;
  const holeX = 200;
  const holeY = 80;
  // Control points for a right-breaking curve. Start line is left, break carries the putt back to the right.
  const aimOffset = aimDirection === "Left" ? -40 : 40;
  const breakOffset = breakDirection === "Left" ? -90 : 90;
  const c1x = ballX + aimOffset;
  const c1y = 420;
  const c2x = holeX + breakOffset;
  const c2y = 220;

  return (
    <svg
      viewBox="0 0 400 600"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Overhead view of green with predicted putt path"
    >
      <defs>
        <radialGradient id="greenGrad" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#1F6B3A" />
          <stop offset="60%" stopColor="#134523" />
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

      {/* Green shape */}
      <path
        d="M60,90 C130,40 290,50 350,120 C390,190 380,360 340,470 C290,570 130,580 70,500 C20,410 20,180 60,90 Z"
        fill="url(#greenGrad)"
        stroke="#0F3A1E"
        strokeWidth="2"
      />

      {/* Contour lines */}
      <g stroke="#2A7A4A" strokeWidth="1" fill="none" opacity="0.35">
        <path d="M90,180 C180,150 260,160 320,200" />
        <path d="M80,280 C170,250 260,260 330,300" />
        <path d="M85,380 C180,350 270,360 325,395" />
      </g>

      {/* Predicted putt path glow */}
      <path
        d={`M ${ballX} ${ballY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${holeX} ${holeY}`}
        stroke={GREEN}
        strokeWidth="8"
        strokeOpacity="0.25"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow)"
      />

      {/* Predicted putt path */}
      <path
        d={`M ${ballX} ${ballY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${holeX} ${holeY}`}
        stroke={GREEN}
        strokeWidth="3"
        strokeDasharray="6 8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Hole */}
      <circle cx={holeX} cy={holeY} r="10" fill="#0A0A0A" stroke="#000" strokeWidth="1" />

      {/* Flag pole */}
      <line x1={holeX} y1={holeY} x2={holeX} y2={holeY - 70} stroke="#F5F5F5" strokeWidth="2" />
      {/* Flag */}
      <path
        d={`M ${holeX} ${holeY - 70} L ${holeX + 30} ${holeY - 62} L ${holeX} ${holeY - 54} Z`}
        fill={GREEN}
      />

      {/* Ball */}
      <circle cx={ballX} cy={ballY} r="10" fill={WHITE} stroke="#000" strokeWidth="1" />
      <circle cx={ballX} cy={ballY} r="10" fill="none" stroke={GREEN} strokeWidth="1.5" opacity="0.7">
        <animate attributeName="r" from="10" to="18" dur="1.8s" repeatCount="indefinite" />
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
            className="w-full rounded-2xl p-4 flex items-center justify-center"
            style={{ backgroundColor: CARD, minHeight: 520 }}
          >
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
