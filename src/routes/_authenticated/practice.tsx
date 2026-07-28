import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Circle } from "lucide-react";
import { getPrePuttRead } from "@/lib/previewService";
import { generatePuttData, type PuttData, type PuttQuality } from "@/lib/sensorService";

export const Route = createFileRoute("/_authenticated/practice")({
  head: () => ({
    meta: [
      { title: "Practice — Putt Vector" },
      {
        name: "description",
        content: "Live putting practice mode with real-time metrics and post-putt feedback.",
      },
      { property: "og:title", content: "Practice — Putt Vector" },
      {
        property: "og:description",
        content: "Live putting practice mode with real-time metrics and post-putt feedback.",
      },
    ],
  }),
  component: PracticePage,
});

const GREEN = "#22C55E";
const RED = "#EF4444";
const BLUE = "#3B82F6";
const YELLOW = "#EAB308";
const WHITE = "#FFFFFF";
const GRAY = "#9CA3AF";
const CARD = "#1C1C1E";
const INNER = "#26262A";

function PutterIcon({ size = 20, color = WHITE }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="7" y1="3" x2="17" y2="13" />
      <path d="M5 15 L9 19 L21 7 L17 3 Z" />
    </svg>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-xl p-4" style={{ backgroundColor: INNER }}>
      <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: GRAY }}>
        {label}
      </div>
      <div className="text-2xl font-semibold tracking-tight" style={{ color: WHITE }}>
        {value}
      </div>
    </div>
  );
}

function GreenView() {
  const ballX = 200;
  const ballY = 520;
  const holeX = 210;
  const holeY = 200;
  // Curved path from ball up to hole, gently bending right for break
  const pathD = `M ${ballX} ${ballY} C 180 420, 260 320, ${holeX} ${holeY}`;
  return (
    <svg viewBox="0 0 400 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-label="Overhead view of green">
      <defs>
        <radialGradient id="greenGradPractice" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#1F6B3A" />
          <stop offset="60%" stopColor="#134523" />
          <stop offset="100%" stopColor="#0B2A16" />
        </radialGradient>
        <filter id="pathGlowPractice" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M60,90 C130,40 290,50 350,120 C390,190 380,360 340,470 C290,570 130,580 70,500 C20,410 20,180 60,90 Z"
        fill="url(#greenGradPractice)"
        stroke="#0F3A1E"
        strokeWidth="2"
      />
      <g stroke="#2A7A4A" strokeWidth="1" fill="none" opacity="0.35">
        <path d="M90,180 C180,150 260,160 320,200" />
        <path d="M80,280 C170,250 260,260 330,300" />
        <path d="M85,380 C180,350 270,360 325,395" />
      </g>
      {/* Predicted putt path */}
      <path
        d={pathD}
        fill="none"
        stroke={GREEN}
        strokeWidth="3"
        strokeDasharray="6 8"
        strokeLinecap="round"
        filter="url(#pathGlowPractice)"
        opacity="0.9"
      />
      {/* Hole */}
      <circle cx={holeX} cy={holeY} r="10" fill="#050505" stroke="#000" strokeWidth="1.5" />
      {/* Flag pole coming out of hole */}
      <line x1={holeX} y1={holeY} x2={holeX} y2={holeY - 70} stroke="#F5F5F5" strokeWidth="2" />
      <path d={`M ${holeX} ${holeY - 70} L ${holeX + 30} ${holeY - 62} L ${holeX} ${holeY - 54} Z`} fill={GREEN} />
      {/* Ball */}
      <circle cx={ballX} cy={ballY} r="11" fill={WHITE} stroke="#000" strokeWidth="1.5" />
    </svg>
  );
}


function qualityColor(q: PuttQuality) {
  if (q === "Good") return GREEN;
  if (q === "Fair") return YELLOW;
  return RED;
}

function ResultPill({ label, value, quality }: { label: string; value: string; quality: PuttQuality }) {
  const color = qualityColor(quality);
  return (
    <div className="flex-1 rounded-xl p-4 border" style={{ backgroundColor: INNER, borderColor: `${color}55` }}>
      <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: GRAY }}>{label}</div>
      <div className="text-xl font-semibold tracking-tight" style={{ color: WHITE }}>{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-widest mt-1.5" style={{ color }}>{quality}</div>
    </div>
  );
}

function PuttPathDiagram({ samples }: { samples: number[] }) {
  const W = 600;
  const H = 220;
  const midY = H / 2;
  const step = W / (samples.length - 1);
  const scale = 18; // px per inch drift
  const points = samples.map((s, i) => `${i * step},${midY + s * scale}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none" aria-label="Ball path relative to intended line">
      {/* intended line */}
      <line x1="0" y1={midY} x2={W} y2={midY} stroke={GRAY} strokeWidth="1.5" strokeDasharray="6 8" opacity="0.6" />
      <text x="8" y={midY - 8} fill={GRAY} fontSize="10" fontFamily="sans-serif" letterSpacing="2">INTENDED</text>
      {/* start */}
      <circle cx="0" cy={midY + samples[0] * scale} r="6" fill={WHITE} />
      {/* end */}
      <circle cx={W} cy={midY + samples[samples.length - 1] * scale} r="7" fill={GREEN} />
      {/* actual path */}
      <polyline points={points} fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LiveView({ read, onPutt }: { read: ReturnType<typeof getPrePuttRead>; onPutt: () => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
      {/* Left column */}
      <div className="flex flex-col gap-5">
        <div className="flex gap-3">
          <MetricCard label="Distance" value={`${read.distanceFt} ft`} />
          <MetricCard label="Speed" value={`${read.speedMs} m/s`} />
          <MetricCard label="Break" value={`${read.breakDeg}° ${read.breakDirection}`} />
        </div>

        <div className="rounded-2xl p-6" style={{ backgroundColor: CARD }}>
          <div className="flex items-center justify-between py-3 border-b border-[#2C2C2E]">
            <span className="text-[11px] uppercase tracking-widest" style={{ color: GRAY }}>Start Line</span>
            <span className="text-xl font-semibold" style={{ color: GREEN }}>0.9° Left</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[#2C2C2E]">
            <span className="text-[11px] uppercase tracking-widest" style={{ color: GRAY }}>Actual</span>
            <span className="text-xl font-semibold" style={{ color: WHITE }}>1.1° Left</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-[11px] uppercase tracking-widest" style={{ color: GRAY }}>Difference</span>
            <span className="text-xl font-semibold" style={{ color: YELLOW }}>0.2° Left</span>
          </div>
        </div>

        <button
          onClick={onPutt}
          className="w-full rounded-2xl py-6 flex items-center justify-center gap-3 border border-[#2C2C2E] active:opacity-80 transition"
          style={{ backgroundColor: INNER, color: WHITE }}
        >
          <PutterIcon size={22} color={WHITE} />
          <span className="text-lg font-semibold tracking-wide">PUTT NOW</span>
        </button>
      </div>

      {/* Right column */}
      <div className="relative w-full rounded-2xl p-4 flex items-center justify-center" style={{ backgroundColor: CARD, minHeight: 520 }}>
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <Circle size={10} fill={RED} stroke={RED} className="animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: RED }}>Recording</span>
        </div>
        <div className="w-full h-full max-h-[640px] flex items-center justify-center">
          <GreenView />
        </div>
      </div>
    </div>
  );
}

function ResultView({ data, onNext }: { data: PuttData; onNext: () => void }) {
  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex gap-3">
        <ResultPill
          label="Speed"
          value={`${data.speedMs} m/s`}
          quality={data.speedQuality}
        />
        <ResultPill
          label="Start Line"
          value={`${data.startLineDeg}° ${data.startLineDirection}`}
          quality={data.startLineQuality}
        />
        <ResultPill
          label="Break"
          value={`${data.breakDeg}° ${data.breakDirection}`}
          quality={data.breakQuality}
        />
      </div>

      <div className="rounded-2xl p-8 flex flex-col items-center gap-4" style={{ backgroundColor: CARD }}>
        <div className="text-[11px] uppercase tracking-[0.3em]" style={{ color: GRAY }}>Putt Result</div>
        <div
          className="text-7xl font-bold tracking-tight"
          style={{ color: data.made ? GREEN : RED }}
        >
          {data.made ? "MADE!" : "MISSED"}
        </div>
        <p className="text-base italic text-center max-w-xl" style={{ color: data.made ? GREEN : "#F5F5F5" }}>
          &ldquo;{data.coaching}&rdquo;
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: GRAY }}>Entry Speed:</span>
          <span className="text-sm font-semibold" style={{ color: WHITE }}>{data.entrySpeedMs} m/s</span>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ backgroundColor: CARD }}>
        <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: GRAY }}>Ball Path vs. Intended Line</div>
        <div className="h-44">
          <PuttPathDiagram samples={data.pathSamples} />
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-lg py-4 text-sm font-semibold tracking-wide"
        style={{ backgroundColor: BLUE, color: WHITE }}
      >
        NEXT PUTT
      </button>
    </div>
  );
}

function PracticePage() {
  const read = getPrePuttRead();
  const [result, setResult] = useState<PuttData | null>(null);

  return (
    <div className="min-h-[calc(100vh-5rem)] p-6">
      <div className="w-full max-w-[1400px] mx-auto">
        <h1 className="sr-only">Practice</h1>
        {result ? (
          <ResultView data={result} onNext={() => setResult(null)} />
        ) : (
          <LiveView read={read} onPutt={() => setResult(generatePuttData())} />
        )}
      </div>
    </div>
  );
}
