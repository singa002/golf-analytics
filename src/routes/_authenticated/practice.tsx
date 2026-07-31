import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Circle } from "lucide-react";
import { generatePrePuttRead, type PrePuttRead } from "@/lib/previewService";
import { pickPuttOutcome, type PuttOutcome } from "@/lib/puttOutcome";
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
        content:
          "Unified putting practice flow: pre-putt read, live measurement, and post-putt result feedback.",
      },
      { property: "og:title", content: "Practice — Putt Vector" },
      {
        property: "og:description",
        content:
          "Unified putting practice flow: pre-putt read, live measurement, and post-putt result feedback.",
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
const INNER = "#040906"; // --golf-deep

/** Total duration of the LIVE roll — the red path draw and the stat reveal share it. */
const LIVE_DURATION_MS = 2600;
const STAT_COUNT = 6;

type Phase = "ready" | "live" | "result";

function PutterIcon({ size = 20, color = WHITE }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="7" y1="3" x2="17" y2="13" />
      <path d="M5 15 L9 19 L21 7 L17 3 Z" />
    </svg>
  );
}

function MetricRow({
  label,
  value,
  valueColor = WHITE,
  pending = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  pending?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-3 border-b border-white/10 last:border-b-0">
      <span className="golf-label">{label}</span>
      <span
        className="golf-display text-2xl tracking-tight transition-all duration-300"
        style={{
          color: pending ? "rgba(255,255,255,0.28)" : valueColor,
          opacity: pending ? 0.7 : 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** The six-row metric panel — shared by all three states so the layout never jumps. */
function MetricPanel({
  phase,
  read,
  outcome,
  revealed,
}: {
  phase: Phase;
  read: PrePuttRead;
  outcome: PuttOutcome | null;
  revealed: number;
}) {
  const predicted = [
    { label: "Distance", value: `${read.distanceFt} ft`, color: WHITE },
    { label: "Speed", value: `${read.speedMs} m/s`, color: WHITE },
    { label: "Break", value: `${read.breakDeg}° ${read.breakDirection}`, color: ACCENT },
    { label: "Start Line", value: `${read.startLineDeg}° ${read.startLineDirection}`, color: WHITE },
    { label: "Stimp", value: `${read.stimp}`, color: WHITE },
    { label: "Aim Point", value: `${read.aimPointFt} ft ${read.aimPointDirection}`, color: WHITE },
  ];

  if (phase === "ready" || !outcome) {
    return (
      <div className="golf-glass w-full rounded-2xl p-6">
        <div className="flex flex-col">
          {predicted.map((row) => (
            <MetricRow key={row.label} label={row.label} value={row.value} valueColor={row.color} />
          ))}
        </div>
      </div>
    );
  }

  // LIVE + RESULT: measured values fill in one at a time as the ball rolls.
  // TODO: this is the hook point where real hardware/sensor data will eventually
  // populate these values instead of the mock outcome variants.
  return (
    <div className="golf-glass w-full rounded-2xl p-6">
      <div className="flex flex-col">
        {outcome.stats.map((stat, i) => {
          const pending = i >= revealed;
          const color = stat.off ? (outcome.made ? YELLOW : RED) : ACCENT;
          return (
            <MetricRow
              key={stat.label}
              label={stat.label}
              value={pending ? "—" : stat.value}
              valueColor={color}
              pending={pending}
            />
          );
        })}
      </div>
    </div>
  );
}

function PracticePage() {
  const { currentPutt, generateNewPutt } = usePutt();
  const [read, setRead] = useState<PrePuttRead>(() => generatePrePuttRead());
  const [phase, setPhase] = useState<Phase>("ready");
  const [outcome, setOutcome] = useState<PuttOutcome | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [runId, setRunId] = useState(0);
  const [session, setSession] = useState({ putts: 0, made: 0, streak: 0, currentStreak: 0 });
  const [recent, setRecent] = useState<SessionPutt[]>([]);
  const [tipIndex, setTipIndex] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const handlePutt = () => {
    clearTimers();
    const picked = pickPuttOutcome(read);
    setOutcome(picked);
    setRevealed(0);
    setPhase("live");
    setRunId((n) => n + 1);

    // Progressive stat reveal, synced to the red path's draw duration.
    for (let i = 1; i <= STAT_COUNT; i++) {
      timers.current.push(
        setTimeout(() => setRevealed(i), (LIVE_DURATION_MS / (STAT_COUNT + 1)) * i),
      );
    }

    timers.current.push(
      setTimeout(() => {
        setPhase("result");
        setSession((s) => {
          const cs = picked.made ? s.currentStreak + 1 : 0;
          return {
            putts: s.putts + 1,
            made: s.made + (picked.made ? 1 : 0),
            currentStreak: cs,
            streak: Math.max(s.streak, cs),
          };
        });
        setRecent((r) =>
          [
            { made: picked.made, distanceFt: read.distanceFt, speedMs: currentPutt.speedMs },
            ...r,
          ].slice(0, 3),
        );
      }, LIVE_DURATION_MS + 300),
    );
  };

  const handleNext = () => {
    clearTimers();
    generateNewPutt();
    setRead(generatePrePuttRead());
    setOutcome(null);
    setRevealed(0);
    setPhase("ready");
    setTipIndex((i) => (i + 1) % COACHING_TIPS.length);
  };

  const showLivePath = (phase === "live" || phase === "result") && outcome;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] p-6">
      <CoursePhotoBackdrop />
      <div className="relative w-full max-w-[1400px] mx-auto flex flex-col gap-5">
        <h1 className="sr-only">Practice</h1>

        {/* Status line — READY / RECORDING / result */}
        <div className="w-full flex items-center gap-2" data-testid="practice-phase" data-phase={phase}>
          {phase === "ready" && (
            <>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ACCENT }} />
              <span className="text-base font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                READY
              </span>
            </>
          )}
          {phase === "live" && (
            <>
              <Circle size={10} fill={RED} stroke={RED} className="animate-pulse" />
              <span className="text-base font-semibold uppercase tracking-widest" style={{ color: RED }}>
                RECORDING
              </span>
            </>
          )}
          {phase === "result" && outcome && (
            <>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: outcome.made ? ACCENT : RED }}
              />
              <span
                className="text-base font-semibold uppercase tracking-widest"
                style={{ color: outcome.made ? ACCENT : RED }}
                data-testid="outcome-name"
                data-outcome={outcome.id}
                data-made={outcome.made ? "true" : "false"}
              >
                {outcome.made ? "MADE" : "MISSED"} — {outcome.name}
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <MetricPanel phase={phase} read={read} outcome={outcome} revealed={revealed} />

            {phase === "result" && outcome ? (
              <>
                <div className="golf-glass rounded-2xl p-6 flex flex-col items-center gap-3">
                  <div className="golf-label">Putt Result</div>
                  <div
                    className="golf-display text-6xl tracking-tight"
                    style={{ color: outcome.made ? ACCENT : RED }}
                  >
                    {outcome.made ? "MADE!" : "MISSED"}
                  </div>
                  <p
                    className="text-base italic leading-relaxed text-center"
                    style={{ color: outcome.made ? ACCENT : "#F5F5F5" }}
                    data-testid="outcome-feedback"
                  >
                    &ldquo;{outcome.feedback}&rdquo;
                  </p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full rounded-lg py-4 text-sm font-semibold tracking-wide"
                  style={{ backgroundColor: BLUE, color: WHITE }}
                >
                  NEXT PUTT
                </button>
              </>
            ) : (
              <>
                <div className="golf-glass-inner w-full rounded-xl p-5">
                  <div className="golf-label mb-2">AI Coaching</div>
                  <p className="text-base italic leading-relaxed" style={{ color: ACCENT }}>
                    &ldquo;{read.coaching}&rdquo;
                  </p>
                </div>

                <button
                  onClick={handlePutt}
                  disabled={phase === "live"}
                  className="golf-accent-glow w-full rounded-2xl py-6 flex items-center justify-center gap-3 border border-[#22C55E] active:opacity-80 transition disabled:opacity-50"
                  style={{ backgroundColor: ACCENT, color: INNER }}
                >
                  <PutterIcon size={22} color={INNER} />
                  <span className="text-lg font-semibold tracking-wide">
                    {phase === "live" ? "MEASURING…" : "PUTT NOW"}
                  </span>
                </button>

                <SwipeableInfoCards
                  putts={session.putts}
                  made={session.made}
                  streak={session.streak}
                  recent={recent}
                  tip={COACHING_TIPS[tipIndex]}
                />
              </>
            )}
          </div>

          {/* Right column — shared Putt Map */}
          <div
            className="golf-glass relative w-full rounded-2xl p-4 flex items-center justify-center"
            style={{ minHeight: 520 }}
          >
            <div className="w-full h-full max-h-[640px] flex items-center justify-center">
              <SharedGreenView
                key={`green-${runId}-${phase === "ready" ? "ready" : "live"}`}
                ballAngle={currentPutt.ballAngle}
                ballDistance={currentPutt.ballDistance}
                breakDirection={read.breakDirection}
                livePath={
                  showLivePath && outcome
                    ? { deviation: outcome.deviation, endScale: outcome.endScale }
                    : undefined
                }
                liveDurationMs={LIVE_DURATION_MS}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
