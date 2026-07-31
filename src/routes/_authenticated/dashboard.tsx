import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Play, User } from "lucide-react";
import { getSessionHistory } from "@/lib/historyService";
import { useViewMode } from "@/context/ViewModeContext";
import { SETTINGS_LINKS } from "@/components/AppSidebar";
import { ProgressChart } from "@/components/ProgressChart";
import { CoursePhotoBackdrop } from "@/components/CoursePhotoBackdrop";
import { YOUR_MAKE_STREAK } from "@/routes/_authenticated/compete";

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

function timeOfDayGreeting(hour = new Date().getHours()) {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/** Brief secondary line — warm context, never competing with the greeting. */
function welcomeSubtitle(streak: number, latestDate: string) {
  if (streak >= 5) return `You're on an ${streak}-putt streak. Keep the feel going.`;
  if (streak > 0) return `${streak} in a row last time out. Ready for another?`;
  return `Last on the green ${latestDate}. Nice work showing up.`;
}

/** Compact sparkline for Personal Bests supporting visuals. */
function MiniSpark({
  values,
  accent = "#22C55E",
}: {
  values: number[];
  accent?: string;
}) {
  const w = 88;
  const h = 28;
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const pts = values
    .map((v, i) => {
      const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
      <polyline fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      {values.map((v, i) => {
        const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
        const y = h - ((v - min) / span) * (h - 4) - 2;
        return <circle key={i} cx={x} cy={y} r="2" fill={accent} />;
      })}
    </svg>
  );
}

/** Equal-width bars — one per session — for count-style bests. */
function MiniBars({
  values,
  accent = "#22C55E",
}: {
  values: number[];
  accent?: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-1 h-7 shrink-0" aria-hidden>
      {values.map((v, i) => (
        <div
          key={i}
          className="w-2 rounded-sm"
          style={{
            height: `${Math.max(18, (v / max) * 100)}%`,
            /* Solid fills only — opacity washes read minty on dark cards */
            backgroundColor: v / max >= 0.7 ? accent : "#16A34A",
          }}
        />
      ))}
    </div>
  );
}

function DashboardPage() {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const { setMode } = useViewMode();
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!showSettings) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (settingsRef.current?.contains(t) || avatarRef.current?.contains(t)) return;
      setShowSettings(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showSettings]);

  const sessions = getSessionHistory();
  const latest = sessions[0];
  const bestSession = sessions.reduce((a, b) => (a.makePercent >= b.makePercent ? a : b));
  const totalPutts = sessions.reduce((s, x) => s + x.totalPutts, 0);
  const [greeting, setGreeting] = useState("Welcome Back");
  useEffect(() => setGreeting(timeOfDayGreeting()), []);
  const subtitle = welcomeSubtitle(YOUR_MAKE_STREAK, latest.date);

  // Local leaderboard is ranked by season make %. Keep displayed scores consistent with ranks.
  const yourMake = latest.makePercent;
  const localLeaderboard = [
    { rank: 1, name: "Justin D.", score: 94.1, you: false },
    { rank: 5, name: "Dheeraj S. (You)", score: yourMake, you: true },
    { rank: 6, name: "Mike K.", score: Math.max(0, yourMake - 2.8), you: false },
  ];

  // Same rank data as before, framed as a percentile instead of a raw fraction.
  const localFieldSize = 68;
  const yourRank = localLeaderboard.find((row) => row.you)?.rank ?? localFieldSize;
  const localTopPercent = Math.ceil((yourRank / localFieldSize) * 100);

  return (
    <div className="w-full h-full min-h-0 flex overflow-hidden relative">
      <CoursePhotoBackdrop />
      {/* Main Content — no scroll on iPad; desktop can grow naturally inside parent. */}
      <main className="flex-1 min-h-0 overflow-hidden xl:overflow-y-auto px-6 py-4 xl:px-12 xl:py-10 z-10 relative flex flex-col">
        <header className="flex justify-between items-end mb-4 xl:mb-12 shrink-0">
          <div>
            <h1
              className="golf-display text-2xl xl:text-4xl leading-tight"
              style={{ color: "var(--golf-gold)" }}
            >
              {greeting}, Dheeraj
            </h1>
            <p className="mt-1 xl:mt-2 text-xs xl:text-sm golf-text-secondary">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3 xl:gap-4">
            <Link
              to="/preview"
              className="golf-accent-glow flex items-center gap-2 xl:gap-3 bg-[#22C55E] hover:bg-[#4ADE80] text-black px-4 py-2 xl:px-6 xl:py-3 rounded-xl font-bold transition-all text-sm xl:text-base"
            >
              <Play className="h-[18px] w-[18px] xl:h-5 xl:w-5" />
              <span>START SESSION</span>
            </Link>
            <button
              ref={avatarRef}
              onClick={() => setShowSettings((s) => !s)}
              className="w-10 h-10 xl:w-12 xl:h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center text-sm font-bold text-[#22C55E]"
            >
              DS
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4 xl:gap-8 flex-1 min-h-0">
          {/* Left Column */}
          <div className="col-span-7 flex flex-col gap-4 xl:gap-8 min-h-0">
            {/* Season stats + progress live in one card so the column reads as a single unit. */}
            <div className="golf-glass rounded-[12px] p-4 xl:p-8 relative overflow-hidden flex-1 flex flex-col min-h-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0E1E16] blur-3xl rounded-full translate-x-10 -translate-y-10" />
              <div className="relative grid w-full grid-cols-3 items-end shrink-0">
                <div className="min-w-0">
                  <p className="golf-label mb-1">SEASON MAKE %</p>
                  <div className="golf-accent-text-glow flex items-baseline gap-2 xl:gap-4">
                    <span className="golf-display text-5xl xl:text-7xl text-white leading-none">{latest.makePercent}</span>
                    <span className="golf-display text-xl xl:text-2xl text-[#22C55E]">%</span>
                  </div>
                </div>

                <div className="border-l border-white/10 pl-4 xl:pl-8 min-w-0">
                  <p className="golf-label mb-1">Locally</p>
                  <div className="golf-display text-2xl xl:text-3xl leading-none text-white">
                    Top <span className="text-[#22C55E]">{localTopPercent}%</span>
                  </div>
                </div>
                <div className="border-l border-white/10 pl-4 xl:pl-8 min-w-0">
                  <p className="golf-label mb-1">Current Streak</p>
                  <div className="golf-display text-2xl xl:text-3xl leading-none text-white">
                    <span className="text-[#22C55E]">{YOUR_MAKE_STREAK}</span>
                    <span className="text-xs xl:text-sm golf-text-secondary ml-2">IN A ROW</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-4 pt-4 xl:mt-8 xl:pt-8 border-t border-white/5 flex-1 flex flex-col min-h-0">
                <ProgressChart sessions={sessions} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-5 flex flex-col gap-4 xl:gap-8 min-h-0">
            {/* Leaderboard — ranked by season make % */}
            <div className="golf-glass rounded-[12px] p-4 xl:p-8 shrink-0">
              <div className="flex items-baseline justify-between mb-3 xl:mb-6">
                <p className="golf-label">LOCAL LEADERBOARD</p>
                <span className="text-xs xl:text-base uppercase tracking-widest golf-text-secondary">By Make %</span>
              </div>
              <div className="space-y-3 xl:space-y-6">
                {localLeaderboard.map(({ rank, name, score, you }) => (
                  <div
                    key={rank}
                    className={`flex items-center gap-3 xl:gap-4 ${
                      you ? "bg-white/5 -mx-2 xl:-mx-4 px-2 xl:px-4 py-1.5 xl:py-2 rounded-lg border-l-2 border-[#22C55E]" : ""
                    }`}
                  >
                    <div className={you ? "text-[#22C55E] font-bold" : "text-[#F59E0B] font-bold"}>{rank}</div>
                    <div
                      className={`w-7 h-7 xl:w-8 xl:h-8 rounded-full flex items-center justify-center text-xs xl:text-base ${
                        you ? "bg-[#113821] border border-[#155B30] text-[#22C55E]" : "bg-white/10 golf-text-secondary"
                      }`}
                    >
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className={`min-w-0 truncate ${you ? "flex-1 font-bold text-white" : "flex-1 font-medium text-white"}`}>
                      {name}
                    </div>
                    <div className="text-white font-bold shrink-0">
                      {Number.isInteger(score) ? score : score.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 xl:mt-6 flex justify-end">
                <Link
                  to="/compete"
                  className="flex items-center gap-1 text-sm xl:text-base font-semibold text-[#22C55E] hover:text-[#4ADE80] transition-colors"
                >
                  View full leaderboard
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Personal Bests — each row flexes and fills with number + mini visual (no empty gaps). */}
            <div className="golf-glass rounded-[12px] p-4 xl:p-8 flex-1 flex flex-col min-h-0">
              <p className="golf-label mb-2 xl:mb-4 shrink-0">PERSONAL BESTS</p>
              <div className="flex-1 flex flex-col min-h-0 divide-y divide-white/5">
                {(
                  [
                    {
                      label: "BEST MAKE %",
                      value: `${bestSession.makePercent}`,
                      unit: "%",
                      badge: "MASTER",
                      visual: (
                        <MiniSpark
                          values={[...sessions].reverse().map((s) => s.makePercent)}
                          accent="#22C55E"
                        />
                      ),
                    },
                    {
                      label: "SESSIONS LOGGED",
                      value: `${sessions.length}`,
                      unit: "TOTAL",
                      badge: "ACTIVE",
                      visual: (
                        <MiniBars
                          values={[...sessions].reverse().map(() => 1)}
                          accent="#22C55E"
                        />
                      ),
                    },
                    {
                      label: "PUTTS RECORDED",
                      value: `${totalPutts}`,
                      unit: "PUTTS",
                      badge: "STREAK ENDER",
                      visual: (
                        <MiniBars
                          values={[...sessions].reverse().map((s) => s.totalPutts)}
                          accent="#22C55E"
                        />
                      ),
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.label}
                    className="flex-1 flex flex-col justify-center min-h-0 py-2 xl:py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <p className="golf-label">{item.label}</p>
                      <span
                        className={`shrink-0 px-2 py-0.5 xl:px-2.5 xl:py-1 rounded text-xs xl:text-sm font-bold tracking-wider ${
                          item.badge === "MASTER"
                            ? "bg-[#0F271A] text-[#22C55E]"
                            : "bg-white/5 golf-text-secondary"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div className="golf-display text-4xl xl:text-5xl text-white leading-none">
                        {item.value}
                        <span className="text-lg xl:text-xl text-[#22C55E] ml-2">{item.unit}</span>
                      </div>
                      {item.visual}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Popup */}
        {showSettings && (
          <div
            ref={settingsRef}
            className="golf-glass absolute top-24 right-12 w-64 rounded-2xl p-6 z-50"
          >
            <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-full bg-[#113821] flex items-center justify-center text-[#22C55E]">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Dheeraj S.</p>
                <p className="text-base golf-text-secondary">Pro Membership</p>
              </div>
            </div>
            <ul className="space-y-4">
              <li className="pb-3 border-b border-white/10">
                {/* TODO: driven by UI state only — will later come from the user's Supabase role. */}
                <button
                  onClick={() => {
                    setMode("coach");
                    setShowSettings(false);
                    navigate({ to: "/coach" });
                  }}
                  className="w-full flex items-center justify-between text-base font-bold text-[#22C55E] hover:text-[#4ADE80]"
                >
                  <span>Switch to Coach View</span>
                  <ChevronRight size={16} />
                </button>
              </li>
              {SETTINGS_LINKS.map(({ label, section }) => (
                <li key={section}>
                  <Link
                    to="/settings"
                    search={{ section }}
                    onClick={() => setShowSettings(false)}
                    className="flex items-center justify-between text-base golf-text-secondary hover:text-white cursor-pointer"
                  >
                    <span>{label}</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-white/10">
                <Link to="/" className="text-base text-red-400 font-bold hover:text-red-300">
                  Sign Out
                </Link>
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
