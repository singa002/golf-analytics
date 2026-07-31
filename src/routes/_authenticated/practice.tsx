import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Circle } from "lucide-react";
import { getPrePuttRead } from "@/lib/previewService";
import { type PuttData, type PuttQuality } from "@/lib/sensorService";
import { SharedGreenView } from "@/components/SharedGreenView";
import { usePutt } from "@/context/PuttContext";
import { SwipeableInfoCards, COACHING_TIPS, type SessionPutt } from "@/components/SwipeableInfoCards";
import { CoursePhotoBackdrop } from "@/components/CoursePhotoBackdrop";



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

const ACCENT = "#22C55E"; // --golf-accent (also ACCENT / positive data)
const RED = "#EF4444"; // --golf-miss
const BLUE = "#3B82F6";
const YELLOW = "#EAB308";
const WHITE = "#FFFFFF";
const GRAY = "#9CA3AF";
const INNER = "#040906"; // --golf-deep

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
    <div className="golf-glass-inner flex-1 rounded-xl p-4">
      <div className="golf-label mb-2">
        {label}
      </div>
      <div className="golf-display text-2xl tracking-tight" style={{ color: WHITE }}>
        {value}
      </div>
    </div>
  );
}




function qualityColor(q: PuttQuality) {
  if (q === "Good") return ACCENT;
  if (q === "Fair") return YELLOW;
  return RED;
}

function ResultPill({ label, value, quality }: { label: string; value: string; quality: PuttQuality }) {
  const color = qualityColor(quality);
  return (
    <div className="golf-glass-inner flex-1 rounded-xl p-4" style={{ borderColor: `${color}55` }}>
      <div className="golf-label mb-1.5">{label}</div>
      <div className="golf-display text-xl tracking-tight" style={{ color: WHITE }}>{value}</div>
      <div className="text-base font-semibold uppercase tracking-widest mt-1.5" style={{ color }}>{quality}</div>
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
      <text x="8" y={midY - 10} fill="var(--text-secondary)" fontSize="11" fontFamily="sans-serif" letterSpacing="2">INTENDED</text>
      <text x={W - 90} y={midY + endDrift * scale + (endDrift >= 0 ? 22 : -12)} fill={ACCENT} fontSize="11" fontFamily="sans-serif" letterSpacing="2">ACTUAL</text>
      {/* actual path (curved, glowing) */}
      <path d={d} fill="none" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#pathGlowResult)" />
      {/* start */}
      <circle cx="0" cy={midY} r="7" fill={WHITE} stroke="#000" strokeWidth="1" />
      {/* end */}
      <circle cx={W} cy={midY + endDrift * scale} r="8" fill={ACCENT} stroke="#000" strokeWidth="1" />
    </svg>
  );
}


function LiveView({
  read,
  currentPutt,
  onPutt,
  session,
  recent,
  tip,
}: {
  read: ReturnType<typeof getPrePuttRead>;
  currentPutt: PuttData;
  onPutt: () => void;
  session: { putts: number; made: number; streak: number };
  recent: SessionPutt[];
  tip: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
      {/* Left column */}
      <div className="flex flex-col gap-5">
        <div className="flex gap-3">
          <MetricCard label="Distance" value={`${read.distanceFt} ft`} />
          <MetricCard label="Speed" value={`${read.speedMs} m/s`} />
          <MetricCard label="Break" value={`${read.breakDeg}° ${read.breakDirection}`} />
        </div>

        <div className="golf-glass rounded-2xl p-6">
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="golf-label">Start Line</span>
            <span className="golf-display text-xl" style={{ color: ACCENT }}>0.9° Left</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="golf-label">Actual</span>
            <span className="golf-display text-xl" style={{ color: WHITE }}>1.1° Left</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="golf-label">Difference</span>
            <span className="golf-display text-xl" style={{ color: YELLOW }}>0.2° Left</span>
          </div>
        </div>

        <button
          onClick={onPutt}
          className="golf-accent-glow w-full rounded-2xl py-6 flex items-center justify-center gap-3 border border-[#22C55E] active:opacity-80 transition"
          style={{ backgroundColor: ACCENT, color: INNER }}
        >
          <PutterIcon size={22} color={INNER} />
          <span className="text-lg font-semibold tracking-wide">PUTT NOW</span>
        </button>

        <SwipeableInfoCards
          putts={session.putts}
          made={session.made}
          streak={session.streak}
          recent={recent}
          tip={tip}
        />
      </div>

      {/* Right column */}
      <div className="golf-glass relative w-full rounded-2xl p-4 flex items-center justify-center" style={{ minHeight: 520 }}>
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <Circle size={10} fill={RED} stroke={RED} className="animate-pulse" />
          <span className="text-base font-semibold uppercase tracking-widest" style={{ color: RED }}>Recording</span>
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

      <div className="golf-glass rounded-2xl p-8 flex flex-col items-center gap-4">
        <div className="golf-label">Putt Result</div>
        <div
          className="golf-display text-7xl tracking-tight"
          style={{ color: data.made ? ACCENT : RED }}
        >
          {data.made ? "MADE!" : "MISSED"}
        </div>
        <p className="text-base italic text-center max-w-xl" style={{ color: data.made ? ACCENT : "#F5F5F5" }}>
          &ldquo;{data.coaching}&rdquo;
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="golf-label">Entry Speed:</span>
          <span className="golf-display text-sm" style={{ color: WHITE }}>{data.entrySpeedMs} m/s</span>
        </div>
      </div>

      <div className="golf-glass rounded-2xl p-5">
        <div className="golf-label mb-3">Ball Path vs. Intended Line</div>
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
  const { currentPutt, generateNewPutt } = usePutt();
  const [result, setResult] = useState<PuttData | null>(null);
  const [session, setSession] = useState({ putts: 0, made: 0, streak: 0, currentStreak: 0 });
  const [recent, setRecent] = useState<SessionPutt[]>([]);
  const [tipIndex, setTipIndex] = useState(0);

  const handlePutt = () => {
    const putt = currentPutt;
    setResult(putt);
    setSession((s) => {
      const cs = putt.made ? s.currentStreak + 1 : 0;
      return {
        putts: s.putts + 1,
        made: s.made + (putt.made ? 1 : 0),
        currentStreak: cs,
        streak: Math.max(s.streak, cs),
      };
    });
    setRecent((r) =>
      [{ made: putt.made, distanceFt: read.distanceFt, speedMs: putt.speedMs }, ...r].slice(0, 3),
    );
  };

  const handleNext = () => {
    generateNewPutt();
    setResult(null);
    setTipIndex((i) => (i + 1) % COACHING_TIPS.length);
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] p-6">
      <CoursePhotoBackdrop />
      <div className="relative w-full max-w-[1400px] mx-auto">
        <h1 className="sr-only">Practice</h1>
        {result ? (
          <ResultView data={result} onNext={handleNext} />
        ) : (
          <LiveView
            read={read}
            currentPutt={currentPutt}
            onPutt={handlePutt}
            session={{ putts: session.putts, made: session.made, streak: session.streak }}
            recent={recent}
            tip={COACHING_TIPS[tipIndex]}
          />
        )}
      </div>
    </div>

  );
}

