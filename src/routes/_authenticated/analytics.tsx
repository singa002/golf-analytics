import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
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

const MADE = "#22C55E"; // data-meaning color; intentionally unchanged
const MISS = "#EF4444"; // --golf-miss
const ACCENT = "#34D399"; // --golf-accent
const DEEP = "#040906"; // --golf-deep
const CARD = "#0D1512"; // --golf-card

/** Same mock insight previously shown on the standalone Analytics tab. */
// TODO: mock — generate this insight dynamically from the session's tendencies.
const SESSION_INSIGHT = "Your putts are drifting left on breaking putts.";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[12px] p-5 border border-white/10 ${className}`}
      style={{ backgroundColor: CARD }}
    >
      {children}
    </div>
  );
}

/** Emerald at/above avg, red below — same rule as session list rows. */
function makePercentVsAverage(makePercent: number, averageMakePercent: number) {
  return makePercent >= averageMakePercent ? ACCENT : MISS;
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
    <div className="p-4 h-full">
      <h1 className="sr-only">Analytics</h1>
      <div className="grid grid-cols-[380px_1fr] gap-4 h-[calc(100vh-9rem)]">
        {/* Left column — session list */}
        <div className="flex flex-col min-h-0">
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
                  className={`w-full text-left rounded-[12px] p-4 transition border border-white/10 border-l-4 ${
                    active ? "border-l-[#34D399]" : "border-l-transparent"
                  }`}
                  style={{ backgroundColor: CARD }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{s.date}</div>
                      <div className="text-[11px] golf-text-secondary">{s.time}</div>
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
  const size = 130;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (session.makePercent / 100) * c;
  const color = makePercentVsAverage(session.makePercent, averageMakePercent);

  return (
    <Card className="overflow-y-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="golf-label">Session</div>
          <div className="golf-display text-2xl text-white">{session.date}</div>
          <div className="text-sm golf-text-secondary">{session.time}</div>
        </div>
        <div className="relative" style={{ width: size, height: size }}>
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
            <div className="golf-display text-2xl leading-none" style={{ color }}>
              {session.makePercent}
              <span className="text-lg">%</span>
            </div>
            <div className="golf-label">Make</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Total Putts" value={session.totalPutts} />
        <StatBox label="Made" value={session.made} valueClass="text-[#22C55E]" />
        <StatBox label="Missed" value={session.missed} valueClass="text-[#EF4444]" />
        <StatBox label="Avg Distance" value={`${session.avgDistanceFt} ft`} />
      </div>

      <div className="rounded-[12px] p-4 border border-white/10" style={{ backgroundColor: DEEP }}>
        <div className="golf-label mb-2">Insight</div>
        <p className="text-base text-[#34D399] italic leading-relaxed">{SESSION_INSIGHT}</p>
      </div>

      <div
        className="rounded-[12px] p-3 border border-white/10 flex flex-col flex-1 min-h-0"
        style={{ backgroundColor: DEEP }}
      >
        <div className="golf-label mb-2">Putt Map</div>
        <div className="flex-1 min-h-0">
          <PuttMapSvg session={session} />
        </div>
      </div>
    </Card>
  );
}

function StatBox({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-[12px] p-3 border border-white/10 min-w-0" style={{ backgroundColor: DEEP }}>
      <div className="golf-label-sm whitespace-nowrap">{label}</div>
      <div className={`golf-display text-lg mt-1 ${valueClass}`}>{value}</div>
    </div>
  );
}

function PuttMapSvg({ session }: { session: SessionSummary }) {
  const W = 300;
  const H = 220;
  const cx = W / 2;
  const cy = H / 2 + 5;
  const rx = 130;
  const ry = 90;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <radialGradient id="greenGradAnalytics" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#1F6B3A" />
          <stop offset="70%" stopColor={CARD} />
          <stop offset="100%" stopColor={DEEP} />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#greenGradAnalytics)" />
      {[0.4, 0.75].map((f, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={rx * f}
          ry={ry * f}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="3 4"
        />
      ))}
      <line x1={cx} y1={cy - ry + 15} x2={cx} y2={cy - ry - 14} stroke="#fff" strokeWidth={1.5} />
      <polygon points={`${cx},${cy - ry - 14} ${cx + 12},${cy - ry - 8} ${cx},${cy - ry - 2}`} fill={MADE} />
      <circle cx={cx} cy={cy - ry + 15} r={2.5} fill="#fff" />
      {session.puttMap.map((p, i) => {
        const px = cx + p.x * rx * 0.85;
        const py = cy - ry * 0.75 + p.y * ry * 1.4;
        return <circle key={i} cx={px} cy={py} r={4} fill={p.result === "made" ? MADE : MISS} opacity={0.95} />;
      })}
    </svg>
  );
}
