import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Circle } from "lucide-react";
import { getPrePuttRead } from "@/lib/previewService";
import { generatePuttData, type PuttData, type PuttQuality } from "@/lib/sensorService";
import { SharedGreenView } from "@/components/SharedGreenView";


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
  const H = 260;
  const midY = H / 2;
  const step = W / (samples.length - 1);
  const scale = 50; // px per degree of deviation — dramatic, visible curve
  const endDrift = samples[samples.length - 1];
  // Build a smooth curved path using quadratic segments through samples
  const pts = samples.map((s, i) => ({ x: i * step, y: midY + s * scale }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const cx = (prev.x + cur.x) / 2;
    const cy = (prev.y + cur.y) / 2;
    d += ` Q ${prev.x} ${prev.y}, ${cx} ${cy}`;
  }
  d += ` T ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none" aria-label="Ball path relative to intended line">
      <defs>
        <filter id="pathGlowResult" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* intended line */}
      <line x1="0" y1={midY} x2={W} y2={midY} stroke={GRAY} strokeWidth="2" strokeDasharray="8 10" opacity="0.7" />
      <text x="8" y={midY - 10} fill={GRAY} fontSize="11" fontFamily="sans-serif" letterSpacing="2">INTENDED</text>
      <text x={W - 90} y={midY + endDrift * scale + (endDrift >= 0 ? 22 : -12)} fill={GREEN} fontSize="11" fontFamily="sans-serif" letterSpacing="2">ACTUAL</text>
      {/* actual path (curved, glowing) */}
      <path d={d} fill="none" stroke={GREEN} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#pathGlowResult)" />
      {/* start */}
      <circle cx="0" cy={midY} r="7" fill={WHITE} stroke="#000" strokeWidth="1" />
      {/* end */}
      <circle cx={W} cy={midY + endDrift * scale} r="8" fill={GREEN} stroke="#000" strokeWidth="1" />
    </svg>
  );
}


function LiveView({ read, currentPutt, onPutt }: { read: ReturnType<typeof getPrePuttRead>; currentPutt: PuttData; onPutt: () => void }) {
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
          <SharedGreenView
            ballAngle={currentPutt.ballAngle}
            ballDistance={currentPutt.ballDistance}
            breakDirection={currentPutt.breakDirection}
          />

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
