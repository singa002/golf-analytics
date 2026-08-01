import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { SharedGreenView } from "@/components/SharedGreenView";
import { getSessionHistory, type SessionSummary } from "@/lib/historyService";

export const Route = createFileRoute("/_authenticated/analytics")({
  validateSearch: (search: Record<string, unknown>): { session?: string } =>
    typeof search.session === "string" ? { session: search.session } : {},
  head: () => ({
    meta: [
      { title: "Analytics — Putt Vector" },
      {
        name: "description",
        content: "Browse past putting sessions and review detailed analytics for each round.",
      },
      { property: "og:title", content: "Analytics — Putt Vector" },
      {
        property: "og:description",
        content: "Session history with per-session putting analytics.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const ACCENT = "#22C55E"; // --golf-accent (shared with MADE / positive data)
const MISS = "#EF4444"; // --golf-miss

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`golf-glass rounded-[12px] p-5 ${className}`}>
      {children}
    </div>
  );
}

/** Accent at/above avg, red below — same rule as session list rows. */
function makePercentVsAverage(makePercent: number, averageMakePercent: number) {
  return makePercent >= averageMakePercent ? ACCENT : MISS;
}

function startLineLabel(deg: number) {
  const abs = Math.abs(deg).toFixed(1);
  if (Math.abs(deg) < 0.15) return `${abs}° square`;
  return `${abs}° ${deg < 0 ? "left" : "right"}`;
}

/** Wrap standalone metrics (%, °, counts) in gold for scanability. */
function InsightMetricText({ text }: { text: string }) {
  const parts = text.split(/(\d+\.?\d*%|\d+\.?\d*°|\b\d+\b)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\d/.test(part) ? (
          <span key={i} className="font-semibold" style={{ color: "var(--golf-gold)" }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/**
 * Interpretive session insights — patterns, baselines, and takeaways.
 * Never restates the raw stats card (totals / avgs) without a "why" or "so what."
 */
function buildSessionInsights(
  session: SessionSummary,
  history: SessionSummary[],
): string[] {
  const lines: string[] = [];
  const avgMake =
    history.reduce((sum, s) => sum + s.makePercent, 0) / Math.max(1, history.length);
  const avgDist =
    history.reduce((sum, s) => sum + s.avgDistanceFt, 0) / Math.max(1, history.length);
  const avgSpeed =
    history.reduce((sum, s) => sum + s.avgSpeedMs, 0) / Math.max(1, history.length);
  const avgStart =
    history.reduce((sum, s) => sum + s.avgStartLineDeg, 0) / Math.max(1, history.length);

  const makeDelta = Math.round(session.makePercent - avgMake);
  const breakAbs = Math.abs(session.avgBreakDeg);
  const startAbs = Math.abs(session.avgStartLineDeg);
  const startSide = session.avgStartLineDeg < 0 ? "left" : "right";
  const breakSide = session.avgBreakDeg < 0 ? "left" : "right";

  const misses = session.puttMap.filter((p) => p.result === "missed");
  const leftMisses = misses.filter((p) => p.x < -0.08).length;
  const rightMisses = misses.filter((p) => p.x > 0.08).length;
  // puttMap y increases with distance in the mock generator
  const longThreshold = 0.55;
  const longPutts = session.puttMap.filter((p) => p.y >= longThreshold);
  const longMisses = longPutts.filter((p) => p.result === "missed").length;
  const shortPutts = session.puttMap.filter((p) => p.y < longThreshold);
  const shortMissRate =
    shortPutts.length > 0
      ? shortPutts.filter((p) => p.result === "missed").length / shortPutts.length
      : 0;
  const longMissRate = longPutts.length > 0 ? longMisses / longPutts.length : 0;

  const offCenterBuckets = session.startLineAccuracy.filter((b) => b.bucket !== "0");
  const centerCount = session.startLineAccuracy.find((b) => b.bucket === "0")?.count ?? 0;
  const offCenterCount = offCenterBuckets.reduce((sum, b) => sum + b.count, 0);
  const farSideCount = session.startLineAccuracy
    .filter((b) => Math.abs(parseFloat(b.bucket)) >= 2)
    .reduce((sum, b) => sum + b.count, 0);

  // --- Baseline vs own history ---
  if (Math.abs(makeDelta) >= 3) {
    lines.push(
      makeDelta > 0
        ? `Make % sits ${makeDelta} points above your recent average — keep this distance band; the stroke is holding under pressure.`
        : `Make % sits ${Math.abs(makeDelta)} points below your recent average — shrink the practice circle before chasing length again.`,
    );
  }

  // --- Miss side + start-line correlation (two stats together) ---
  if (session.missed >= 3 && leftMisses > rightMisses + 1 && session.avgStartLineDeg <= -0.35) {
    lines.push(
      `Misses clustered left and start line averaged ${startAbs.toFixed(1)}° left — face aim is the likely leak, not green reading alone.`,
    );
  } else if (session.missed >= 3 && rightMisses > leftMisses + 1 && session.avgStartLineDeg >= 0.35) {
    lines.push(
      `Misses clustered right and start line averaged ${startAbs.toFixed(1)}° right — quiet the hands through impact before you change the read.`,
    );
  } else if (session.missed >= 3 && leftMisses > rightMisses + 1 && session.avgStartLineDeg >= 0.35) {
    lines.push(
      `Balls finished left while start line drifted right — over-correction after an open face; pick one start target and commit.`,
    );
  } else if (session.missed >= 3 && rightMisses > leftMisses + 1 && session.avgStartLineDeg <= -0.35) {
    lines.push(
      `Balls finished right while start line drifted left — classic push from a closed path; square the face, then trust the line.`,
    );
  }

  // --- Start line × break interaction ---
  if (startAbs >= 0.45 && breakAbs >= 1.0 && lines.length < 4) {
    const sameSide = startSide === breakSide;
    lines.push(
      sameSide
        ? `Start line and break both lean ${startSide} (${startAbs.toFixed(1)}° / ${breakAbs.toFixed(1)}°) — you're stacking error to one side; aim less break, stroke straighter.`
        : `Start line ${startSide} (${startAbs.toFixed(1)}°) fights ${breakAbs.toFixed(1)}° of ${breakSide} break — misses will look "random" until face and read agree.`,
    );
  }

  // --- Distance pattern from putt map ---
  if (
    longPutts.length >= 4 &&
    longMissRate >= 0.55 &&
    longMissRate > shortMissRate + 0.15 &&
    lines.length < 4
  ) {
    lines.push(
      `Misses concentrated on the longer rolls (${longMisses} of ${longPutts.length} past mid-range) — prioritize lag speed before fine-tuning line.`,
    );
  } else if (
    session.avgDistanceFt >= avgDist + 2.5 &&
    session.makePercent < avgMake - 2 &&
    lines.length < 4
  ) {
    lines.push(
      `You played ${(session.avgDistanceFt - avgDist).toFixed(1)} ft longer than usual and make % slipped — length is taxing pace control more than aim.`,
    );
  }

  // --- Speed vs history / break ---
  if (session.avgSpeedMs >= avgSpeed + 0.15 && breakAbs >= 1.0 && lines.length < 4) {
    lines.push(
      `Pace is hotter than your baseline (${session.avgSpeedMs} vs ${avgSpeed.toFixed(1)} m/s) on ${breakAbs.toFixed(1)}° break — soften entry so the ball can take the curve.`,
    );
  } else if (session.avgSpeedMs <= avgSpeed - 0.15 && session.makePercent < avgMake && lines.length < 4) {
    lines.push(
      `Pace is softer than your recent norm — dying putts leave break-side lip-outs; add a touch more roll on mid-range tries.`,
    );
  }

  // --- Start-line distribution shape ---
  if (farSideCount >= 3 && farSideCount >= centerCount && lines.length < 4) {
    lines.push(
      `${farSideCount} starts landed 2°+ offline vs ${centerCount} square — the face is wandering before the stroke starts; rehearse a gate at address.`,
    );
  } else if (offCenterCount > centerCount * 2 && lines.length < 4) {
    lines.push(
      `Start-line histogram is spread thin (${offCenterCount} offline vs ${centerCount} on zero) — pick a blade of grass 1 ft ahead and start every putt at it.`,
    );
  }

  // --- Actionable takeaways (fill to at least 2, cap 4) ---
  if (lines.length < 2) {
    if (startAbs >= 0.35) {
      lines.push(
        `Primary leak is a ${startAbs.toFixed(1)}° ${startSide} start — next session, one drill: 10 straight 8-ft putts with a gate, no break.`,
      );
    } else if (breakAbs >= 1.2) {
      lines.push(
        `Break averaged ${breakAbs.toFixed(1)}° — next session, aim to the apex and stroke it like a straight putt instead of steering.`,
      );
    } else if (makeDelta >= 0) {
      lines.push(
        `Session tracked near your baseline with a quiet start line — next, add 3 mid-breaking putts and keep the same face control.`,
      );
    } else {
      lines.push(
        `No single miss side dominated — next session, log start line on every miss so the first real pattern can surface.`,
      );
    }
  }

  if (lines.length < 2) {
    lines.push(
      `Carry one focus forward: square start line inside 0.5° before you stretch distance again.`,
    );
  }

  // Prefer a closing action if we still have a slot and the last line isn't already a "next"
  if (lines.length < 4 && !lines.some((l) => /next session|next,/i.test(l))) {
    if (leftMisses > rightMisses + 1) {
      lines.push(
        `Next session focus: open-to-square face drills — your miss map is still leaking left.`,
      );
    } else if (rightMisses > leftMisses + 1) {
      lines.push(
        `Next session focus: hold face through impact — your miss map is still leaking right.`,
      );
    } else if (session.avgDistanceFt >= 18) {
      lines.push(
        `Next session focus: 20–30 ft lags to a 3-ft circle before you chase make % again.`,
      );
    }
  }

  return lines.slice(0, 4);
}


function AnalyticsPage() {
  const { session: requestedId } = Route.useSearch();
  const sessions = getSessionHistory();
  // Deep links (e.g. the Dashboard progress chart) pre-select a session; otherwise
  // default to the most recent one — history is newest-first.
  const defaultId = sessions.find((s) => s.id === requestedId)?.id ?? sessions[0].id;
  const [selectedId, setSelectedId] = useState(defaultId);

  useEffect(() => {
    setSelectedId(defaultId);
  }, [defaultId]);

  const selected = sessions.find((s) => s.id === selectedId) ?? sessions[0];
  const averageMakePercent =
    sessions.reduce((total, session) => total + session.makePercent, 0) / sessions.length;

  return (
    <div className="relative p-4 h-full">
      <h1 className="sr-only">Analytics</h1>
      <div className="relative grid grid-cols-[380px_1fr] gap-4 h-full min-h-0">
        {/* Left column — session list */}
        <div className="flex flex-col min-h-0 h-full">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Calendar className="h-4 w-4 golf-text-secondary" />
            <span className="golf-label">Analytics</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {sessions.map((s) => {
              const active = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`golf-glass w-full text-left rounded-[12px] p-4 transition border-l-4 ${
                    active ? "border-l-[#22C55E]" : "border-l-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{s.date}</div>
                      <div className="text-base golf-text-secondary">{s.time}</div>
                    </div>
                    <div
                      className="golf-display text-4xl leading-none"
                      style={{ color: makePercentVsAverage(s.makePercent, averageMakePercent) }}
                    >
                      {s.makePercent}
                      <span className="text-xl">%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column — session detail (defaults to latest) */}
        <SessionDetail
          session={selected}
          history={sessions}
          averageMakePercent={averageMakePercent}
        />
      </div>
    </div>
  );
}

function SessionDetail({
  session,
  history,
  averageMakePercent,
}: {
  session: SessionSummary;
  history: SessionSummary[];
  averageMakePercent: number;
}) {
  const size = 72;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (session.makePercent / 100) * c;
  const color = makePercentVsAverage(session.makePercent, averageMakePercent);
  const insights = buildSessionInsights(session, history);

  const stats = [
    { label: "Total Putts", value: session.totalPutts, valueClass: "text-white" },
    { label: "Made", value: session.made, valueClass: "text-[#22C55E]" },
    { label: "Missed", value: session.missed, valueClass: "text-[#EF4444]" },
    {
      label: "Avg Distance",
      value: (
        <>
          {session.avgDistanceFt}
          <span className="text-base golf-text-secondary ml-1.5 font-semibold">ft</span>
        </>
      ),
      valueClass: "text-white",
    },
    {
      label: "Avg Speed",
      value: (
        <>
          {session.avgSpeedMs}
          <span className="text-base golf-text-secondary ml-1.5 font-semibold">m/s</span>
        </>
      ),
      valueClass: "text-white",
    },
    {
      label: "Avg Start Line",
      value: startLineLabel(session.avgStartLineDeg),
      valueClass: "text-white",
    },
  ] as const;

  return (
    <Card className="overflow-y-auto flex flex-col gap-4 h-full min-h-0">
      <div className="flex items-center justify-between shrink-0 gap-4">
        <div className="min-w-0">
          <div className="golf-label-sm">Session</div>
          <div className="golf-display text-base text-white leading-tight mt-0.5">{session.date}</div>
          <div className="text-xs golf-text-secondary mt-0.5">{session.time}</div>
        </div>
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="golf-display text-sm leading-none" style={{ color }}>
              {session.makePercent}
              <span className="text-[10px]">%</span>
            </div>
            <div className="text-[9px] uppercase tracking-wider golf-text-secondary mt-0.5">Make</div>
          </div>
        </div>
      </div>

      <div className="golf-glass-inner rounded-[12px] flex-1 flex flex-col min-h-0 divide-y divide-white/5 px-4 py-1">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex-1 flex items-center justify-between gap-4 min-h-0 py-3 first:pt-2 last:pb-2"
          >
            <p className="golf-label shrink-0">{stat.label}</p>
            <div className={`golf-display text-3xl leading-none text-right ${stat.valueClass}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Putt Map (compact, left) + Insight (wider, right) */}
      <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] gap-3 shrink-0 min-h-[200px]">
        <div className="golf-glass-inner rounded-[12px] p-3 flex flex-col min-h-0">
          <div className="golf-label mb-2 shrink-0">Putt Map</div>
          <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
            <PuttMapSvg session={session} />
          </div>
        </div>
        <div className="golf-glass-inner rounded-[12px] p-4 flex flex-col min-h-0">
          <div className="golf-label mb-3 shrink-0">Insight</div>
          <ol className="flex flex-col gap-2.5 flex-1 min-h-0">
            {insights.map((line, index) => (
              <li key={index} className="flex gap-2.5 golfer-chrome-text leading-snug text-white/90">
                <span
                  className="golf-display shrink-0 tabular-nums"
                  style={{ color: "var(--golf-gold)" }}
                >
                  {index + 1}.
                </span>
                <span className="min-w-0">
                  <InsightMetricText text={line} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Card>
  );
}

function PuttMapSvg({ session }: { session: SessionSummary }) {
  const madeAny = session.puttMap.some((p) => p.result === "made");
  return (
    <SharedGreenView
      ballAngle={0}
      ballDistance={0.8}
      breakDirection="Right"
      showBall={false}
      showPredictedPath={false}
      celebrate={madeAny}
      putts={session.puttMap.map((p) => ({
        x: p.x,
        y: p.y * 1.3 - 0.6,
        result: p.result,
      }))}
    />
  );
}
