import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Settings as SettingsIcon, Trophy } from "lucide-react";
import { useState } from "react";
import { IntroAnimation, useIntroAnimation } from "@/components/IntroAnimation";
import { getSessionHistory } from "@/lib/historyService";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Putt Vector" },
      { name: "description", content: "Your putting home — recent sessions, challenges, and personal bests." },
      { property: "og:title", content: "Dashboard — Putt Vector" },
      { property: "og:description", content: "Your putting home — recent sessions, challenges, and personal bests." },
    ],
  }),
  component: DashboardPage,
});

const GREEN = "#22C55E";
const YELLOW = "#EAB308";
const WHITE = "#FFFFFF";
const GRAY = "#9CA3AF";
const CARD = "#1C1C1E";
const INNER = "#26262A";

function Gauge({ value, color = GREEN, size = 96 }: { value: number; color?: string; size?: number }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#2C2C2E" strokeWidth="6" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="6" fill="none"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fill={WHITE} fontSize={size * 0.24} fontWeight="700">
        {value}%
      </text>
    </svg>
  );
}

function DashboardPage() {
  const { complete } = useIntroAnimation();
  const [dismissed, setDismissed] = useState(false);
  const sessions = getSessionHistory();
  const latest = sessions[0];
  const bestSession = sessions.reduce((a, b) => (a.makePercent >= b.makePercent ? a : b));
  const totalPutts = sessions.reduce((s, x) => s + x.totalPutts, 0);

  return (
    <div className="min-h-[calc(100vh-5rem)] p-6 relative">
      {!dismissed && (
        <IntroAnimation
          onComplete={() => {
            complete();
            setDismissed(true);
          }}
        />
      )}
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl p-6 flex items-center gap-5" style={{ backgroundColor: CARD }}>
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: "#0F3A1E", color: GREEN }}
            >
              DS
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold" style={{ color: WHITE }}>Welcome back, Dheeraj</div>
              <div className="text-sm mt-1" style={{ color: GRAY }}>Handicap 8.2 · Coach Williams</div>
            </div>
          </div>

          <Link
            to="/history"
            className="rounded-2xl p-6 flex items-center gap-6 hover:opacity-90 transition"
            style={{ backgroundColor: CARD }}
          >
            <Gauge value={latest.makePercent} color={YELLOW} />
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: GRAY }}>Last Session</div>
              <div className="text-base font-semibold mb-3" style={{ color: WHITE }}>
                {latest.date} · {latest.time}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Putts" value={latest.totalPutts.toString()} />
                <MiniStat label="Made" value={latest.made.toString()} color={GREEN} />
                <MiniStat label="Missed" value={latest.missed.toString()} />
              </div>
            </div>
          </Link>

          <div className="grid grid-cols-3 gap-3">
            <Link
              to="/preview"
              className="rounded-xl py-4 text-center text-sm font-semibold tracking-wide"
              style={{ backgroundColor: GREEN, color: "#0A0A0A" }}
            >
              Start Preview
            </Link>
            <Link
              to="/analytics"
              className="rounded-xl py-4 text-center text-sm font-semibold tracking-wide border"
              style={{ borderColor: "#2C2C2E", color: WHITE }}
            >
              View Analytics
            </Link>
            <Link
              to="/history"
              className="rounded-xl py-4 text-center text-sm font-semibold tracking-wide border"
              style={{ borderColor: "#2C2C2E", color: WHITE }}
            >
              View History
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">
          <Link
            to="/compete"
            className="rounded-2xl p-6 hover:opacity-90 transition"
            style={{ backgroundColor: CARD, borderLeft: `3px solid ${GREEN}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={14} style={{ color: GREEN }} />
              <span className="text-[10px] uppercase tracking-widest" style={{ color: GREEN }}>Current Challenge</span>
            </div>
            <div className="text-xl font-bold mb-1" style={{ color: WHITE }}>Weekly Make % Leader</div>
            <div className="text-sm" style={{ color: GRAY }}>Rank #5 of 68 golfers</div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <MiniStat label="Your Score" value="68%" color={GREEN} />
              <MiniStat label="Rank" value="#5" />
              <MiniStat label="Days Left" value="2" />
            </div>
          </Link>

          <div className="rounded-2xl p-6" style={{ backgroundColor: CARD }}>
            <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: GRAY }}>Personal Bests</div>
            <div className="grid grid-cols-2 gap-4">
              <BestRow label="Best Make %" value={`${bestSession.makePercent}%`} sub={bestSession.date} />
              <BestRow label="Best Streak" value="8" sub="in a row" />
              <BestRow label="Total Sessions" value={sessions.length.toString()} sub="tracked" />
              <BestRow label="Total Putts" value={totalPutts.toString()} sub="logged" />
            </div>
          </div>

          <Link
            to="/settings"
            className="rounded-2xl p-5 flex items-center justify-between hover:opacity-90 transition"
            style={{ backgroundColor: CARD }}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: INNER }}>
                <SettingsIcon size={18} style={{ color: WHITE }} />
              </div>
              <span className="text-base font-semibold" style={{ color: WHITE }}>Settings</span>
            </div>
            <ChevronRight size={18} style={{ color: GRAY }} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color = WHITE }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg p-2.5" style={{ backgroundColor: INNER }}>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: GRAY }}>{label}</div>
    </div>
  );
}

function BestRow({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: INNER }}>
      <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: GRAY }}>{label}</div>
      <div className="text-2xl font-bold" style={{ color: WHITE }}>{value}</div>
      <div className="text-[10px] mt-0.5" style={{ color: GRAY }}>{sub}</div>
    </div>
  );
}
