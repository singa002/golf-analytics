import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Circle } from "lucide-react";
import { generatePrePuttRead, type PrePuttRead } from "@/lib/previewService";
import { pickPuttOutcome, type PuttOutcome } from "@/lib/puttOutcome";
import { SharedGreenView } from "@/components/SharedGreenView";
import { usePutt } from "@/context/PuttContext";
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
    <div className="flex-1 flex items-center justify-between min-h-0 border-b border-white/10 last:border-b-0 py-2.5">
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

/** READY / RECORDING / MADE|MISSED — lives in the metrics card header (not a separate row). */
function PhaseStatus({ phase, outcome }: { phase: Phase; outcome: PuttOutcome | null }) {
  return (
    <div
      className="flex items-center gap-2 mb-2 pb-2.5 border-b border-white/10"
      data-testid="practice-phase"
      data-phase={phase}
    >
      {phase === "ready" && (
        <>
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ACCENT }} />
          <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
            READY
          </span>
        </>
      )}
      {phase === "live" && (
        <>
          <Circle size={10} fill={RED} stroke={RED} className="animate-pulse" />
          <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: RED }}>
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
            className="text-sm font-semibold uppercase tracking-widest"
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

  const rows =
    phase === "ready" || !outcome
      ? predicted.map((row) => (
          <MetricRow key={row.label} label={row.label} value={row.value} valueColor={row.color} />
        ))
      : outcome.stats.map((stat, i) => {
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
        });

  return (
    <div className="golf-glass w-full rounded-2xl px-5 py-6 flex-1 flex flex-col min-h-0">
      <PhaseStatus phase={phase} outcome={outcome} />
      <div className="flex flex-col flex-1 min-h-0 justify-evenly gap-0.5">{rows}</div>
    </div>
  );
}

/** Compact static session strip — Putts / Made / Streak only (no swipe carousel). */
function SessionStatsCard({
  putts,
  made,
  streak,
}: {
  putts: number;
  made: number;
  streak: number;
}) {
  return (
    <div className="golf-glass rounded-2xl px-5 py-4 shrink-0">
      <div className="golf-label mb-3">Session</div>
      <div className="flex items-end justify-around gap-4">
        <div className="flex flex-col items-center gap-1">
          <div className="golf-display text-3xl leading-none text-white">{putts}</div>
          <div className="golf-label-sm">Putts</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="golf-display text-3xl leading-none" style={{ color: ACCENT }}>
            {made}
          </div>
          <div className="golf-label-sm">Made</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="golf-display text-3xl leading-none text-white">{streak}</div>
          <div className="golf-label-sm">Streak</div>
        </div>
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
  };

  const showLivePath = (phase === "live" || phase === "result") && outcome;

  return (
    <div className="relative h-full min-h-0 overflow-hidden p-4">
      <CoursePhotoBackdrop />
      <div className="relative h-full min-h-0 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        <h1 className="sr-only">Practice</h1>

        {/* Left — metrics + coaching/CTA stretch to fill column height */}
        <div className="flex flex-col gap-4 min-h-0 h-full overflow-hidden">
          <MetricPanel phase={phase} read={read} outcome={outcome} revealed={revealed} />

          {phase === "result" && outcome ? (
            <>
              <div className="golf-glass rounded-2xl px-5 py-6 flex flex-col items-center justify-center gap-3 flex-1 min-h-0">
                <div className="golf-label">Putt Result</div>
                <div
                  className="golf-display text-5xl tracking-tight"
                  style={{ color: outcome.made ? ACCENT : RED }}
                >
                  {outcome.made ? "MADE!" : "MISSED"}
                </div>
                <p
                  className="text-base italic leading-relaxed text-center max-w-md"
                  style={{ color: outcome.made ? ACCENT : "#F5F5F5" }}
                  data-testid="outcome-feedback"
                >
                  &ldquo;{outcome.feedback}&rdquo;
                </p>
              </div>
              <button
                onClick={handleNext}
                className="w-full rounded-lg py-4 text-sm font-semibold tracking-wide shrink-0"
                style={{ backgroundColor: BLUE, color: WHITE }}
              >
                NEXT PUTT
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handlePutt}
                disabled={phase === "live"}
                className="golf-accent-glow w-full rounded-2xl py-5 flex items-center justify-center gap-3 border border-[#22C55E] active:opacity-80 transition disabled:opacity-50 shrink-0"
                style={{ backgroundColor: ACCENT, color: INNER }}
              >
                <PutterIcon size={22} color={INNER} />
                <span className="text-lg font-semibold tracking-wide">
                  {phase === "live" ? "MEASURING…" : "PUTT NOW"}
                </span>
              </button>

              <div className="golf-glass-inner w-full rounded-xl px-4 py-3 shrink-0">
                <div className="golf-label mb-1.5">AI Coaching</div>
                <p className="text-sm italic leading-snug" style={{ color: ACCENT }}>
                  &ldquo;{read.coaching}&rdquo;
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right — Session (static) on top, Putt Map fills the rest */}
        <div className="flex flex-col gap-4 min-h-0 h-full overflow-hidden">
          <SessionStatsCard putts={session.putts} made={session.made} streak={session.streak} />

          <div className="golf-glass relative w-full flex-1 min-h-0 rounded-2xl p-3 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full max-h-full flex items-center justify-center">
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
