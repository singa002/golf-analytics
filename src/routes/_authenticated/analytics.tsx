import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { CoursePhotoBackdrop } from "@/components/CoursePhotoBackdrop";
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
const DEEP = "#040906"; // --golf-deep
const CARD = "#0D1512"; // --golf-card

/** Same mock insight previously shown on the standalone Analytics tab. */
// TODO: mock — generate this insight dynamically from the session's tendencies.
const SESSION_INSIGHT = "Your putts are drifting left on breaking putts.";

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
      <CoursePhotoBackdrop />
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
  const size = 130;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (session.makePercent / 100) * c;
  const color = makePercentVsAverage(session.makePercent, averageMakePercent);

  return (
    <Card className="overflow-y-auto flex flex-col gap-5 h-full min-h-0">
      <div className="flex items-center justify-between shrink-0">
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

      <div className="golf-glass-inner rounded-[12px] flex-1 flex flex-col min-h-0 divide-y divide-white/5 px-4 py-2">
        {(
          [
            { label: "Total Putts", value: session.totalPutts, valueClass: "text-white" },
            { label: "Made", value: session.made, valueClass: "text-[#22C55E]" },
            { label: "Missed", value: session.missed, valueClass: "text-[#EF4444]" },
            {
              label: "Avg Distance",
              value: (
                <>
                  {session.avgDistanceFt}
                  <span className="text-lg golf-text-secondary ml-2 font-semibold">ft</span>
                </>
              ),
              valueClass: "text-white",
            },
          ] as const
        ).map((stat) => (
          <div
            key={stat.label}
            className="flex-1 flex items-center justify-between gap-4 min-h-0 py-5 first:pt-4 last:pb-4"
          >
            <p className="golf-label shrink-0">{stat.label}</p>
            <div className={`golf-display text-4xl leading-none text-right ${stat.valueClass}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="golf-glass-inner rounded-[12px] p-4 shrink-0">
        <div className="golf-label mb-2">Insight</div>
        <p className="text-base text-[#22C55E] italic leading-relaxed">{SESSION_INSIGHT}</p>
      </div>

      <div className="golf-glass-inner rounded-[12px] p-3 flex flex-col flex-[1.35] min-h-0">
        <div className="golf-label mb-2 shrink-0">Putt Map</div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <PuttMapSvg session={session} />
        </div>
      </div>
    </Card>
  );
}

function PuttMapSvg({ session }: { session: SessionSummary }) {
  const W = 320;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2 + 4;
  const rx = 148;
  const ry = 112;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full max-h-full">
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
      <polygon points={`${cx},${cy - ry - 14} ${cx + 12},${cy - ry - 8} ${cx},${cy - ry - 2}`} fill={ACCENT} />
      <circle cx={cx} cy={cy - ry + 15} r={2.5} fill="#fff" />
      {session.puttMap.map((p, i) => {
        const px = cx + p.x * rx * 0.85;
        const py = cy - ry * 0.75 + p.y * ry * 1.4;
        return <circle key={i} cx={px} cy={py} r={4} fill={p.result === "made" ? ACCENT : MISS} />;
      })}
    </svg>
  );
}
