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

/** Session-specific insight — concrete numbers, changes with the selected session. */
function buildSessionInsight(session: SessionSummary, averageMakePercent: number): string {
  const start = startLineLabel(session.avgStartLineDeg);
  const breakAbs = Math.abs(session.avgBreakDeg).toFixed(1);
  const vsAvg = Math.round(session.makePercent - averageMakePercent);
  const vsAvgPhrase =
    vsAvg >= 3
      ? `${vsAvg} points above your recent average`
      : vsAvg <= -3
        ? `${Math.abs(vsAvg)} points below your recent average`
        : "roughly in line with your recent average";

  const misses = session.puttMap.filter((p) => p.result === "missed");
  const leftMisses = misses.filter((p) => p.x < -0.08).length;
  const rightMisses = misses.filter((p) => p.x > 0.08).length;
  let missPattern = "misses were scattered around the hole";
  if (leftMisses > rightMisses + 1) {
    missPattern = `most of your ${session.missed} misses finished left of the hole`;
  } else if (rightMisses > leftMisses + 1) {
    missPattern = `most of your ${session.missed} misses finished right of the hole`;
  } else if (session.missed > 0) {
    missPattern = `your ${session.missed} misses were split evenly left and right`;
  }

  return `You made ${session.made} of ${session.totalPutts} from an average ${session.avgDistanceFt} ft at ${session.avgSpeedMs} m/s — ${vsAvgPhrase}. Start line averaged ${start} with ${breakAbs}° of break; ${missPattern}.`;
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
        <SessionDetail session={selected} averageMakePercent={averageMakePercent} />
      </div>
    </div>
  );
}

function SessionDetail({
  session,
  averageMakePercent,
}: {
  session: SessionSummary;
  averageMakePercent: number;
}) {
  const size = 72;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (session.makePercent / 100) * c;
  const color = makePercentVsAverage(session.makePercent, averageMakePercent);
  const insight = buildSessionInsight(session, averageMakePercent);

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
          <div className="golf-label mb-2 shrink-0">Insight</div>
          <p className="text-sm text-[#22C55E] italic leading-relaxed flex-1">{insight}</p>
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
