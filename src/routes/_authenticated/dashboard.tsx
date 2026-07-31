import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Play, User } from "lucide-react";
import { getSessionHistory } from "@/lib/historyService";
import { useViewMode } from "@/context/ViewModeContext";
import { SETTINGS_LINKS } from "@/components/AppSidebar";
import { ProgressChart } from "@/components/ProgressChart";
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
  const greeting = timeOfDayGreeting();
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
    <div className="w-full min-h-[calc(100vh-3.5rem)] flex overflow-hidden relative">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-12 py-10 z-10 relative">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1
              className="golf-display text-4xl leading-tight"
              style={{ color: "var(--golf-gold)" }}
            >
              {greeting}, Dheeraj
            </h1>
            <p className="mt-2 text-sm golf-text-secondary">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/preview"
              className="golf-accent-glow flex items-center gap-3 bg-[#34D399] hover:bg-[#6EE7B7] text-black px-6 py-3 rounded-xl font-bold transition-all"
            >
              <Play size={20} />
              <span>START SESSION</span>
            </Link>
            <button
              ref={avatarRef}
              onClick={() => setShowSettings((s) => !s)}
              className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center text-sm font-bold text-[#34D399]"
            >
              DS
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="col-span-7 flex flex-col gap-8">
            {/* Season stats + progress live in one card so the column reads as a single unit. */}
            <div className="bg-[#0D1512] border border-white/10 rounded-[12px] p-8 relative overflow-hidden flex-1 flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#34D399]/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
              <div className="relative grid w-full grid-cols-3 items-end">
                <div className="min-w-0">
                  <p className="golf-label mb-1">SEASON MAKE %</p>
                  <div className="golf-accent-text-glow flex items-baseline gap-4">
                    <span className="golf-display text-7xl text-white leading-none">{latest.makePercent}</span>
                    <span className="golf-display text-2xl text-[#34D399]">%</span>
                  </div>
                </div>

                <div className="border-l border-white/10 pl-8">
                  <p className="golf-label mb-1">Locally</p>
                  <div className="golf-display text-3xl leading-none text-white">
                    Top <span className="text-[#34D399]">{localTopPercent}%</span>
                  </div>
                </div>
                <div className="border-l border-white/10 pl-8">
                  <p className="golf-label mb-1">Current Streak</p>
                  <div className="golf-display text-3xl leading-none text-white">
                    <span className="text-[#34D399]">{YOUR_MAKE_STREAK}</span>
                    <span className="text-sm golf-text-secondary ml-2">IN A ROW</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-8 pt-8 border-t border-white/5 flex-1 flex flex-col">
                <ProgressChart sessions={sessions} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-5 flex flex-col gap-8">
            {/* Leaderboard — ranked by season make % */}
            <div className="bg-[#0D1512] border border-white/10 rounded-[12px] p-8">
              <div className="flex items-baseline justify-between mb-6">
                <p className="golf-label">LOCAL LEADERBOARD</p>
                <span className="text-base uppercase tracking-widest golf-text-secondary">By Make %</span>
              </div>
              <div className="space-y-6">
                {localLeaderboard.map(({ rank, name, score, you }) => (
                  <div
                    key={rank}
                    className={`flex items-center gap-4 ${
                      you ? "bg-white/5 -mx-4 px-4 py-2 rounded-lg border-l-2 border-[#34D399]" : ""
                    }`}
                  >
                    <div className={you ? "text-[#34D399] font-bold" : "text-[#F59E0B] font-bold"}>{rank}</div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${
                        you ? "bg-[#34D399]/20 border border-[#34D399]/40 text-[#34D399]" : "bg-white/10 golf-text-secondary"
                      }`}
                    >
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className={you ? "flex-1 font-bold text-white" : "flex-1 font-medium text-white"}>{name}</div>
                    <div className="text-white font-bold">
                      {Number.isInteger(score) ? score : score.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Link
                  to="/compete"
                  className="flex items-center gap-1 text-base font-semibold text-[#34D399] hover:text-[#6EE7B7] transition-colors"
                >
                  View full leaderboard
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Personal Bests — hero-weight rows so achievements read as primary stats. */}
            <div className="bg-[#0D1512] border border-white/10 rounded-[12px] p-8 flex-1 flex flex-col">
              <p className="golf-label mb-6">PERSONAL BESTS</p>
              <div className="flex-1 flex flex-col justify-between">
                {[
                  { label: "BEST MAKE %", value: `${bestSession.makePercent}`, unit: "%", badge: "MASTER" },
                  { label: "SESSIONS LOGGED", value: `${sessions.length}`, unit: "TOTAL", badge: "ACTIVE" },
                  { label: "PUTTS RECORDED", value: `${totalPutts}`, unit: "PUTTS", badge: "STREAK ENDER" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-end justify-between gap-4 py-5 border-b border-white/5 last:border-b-0 last:pb-0 first:pt-0"
                  >
                    <div className="min-w-0">
                      <p className="golf-label mb-2">{item.label}</p>
                      <div className="golf-display text-5xl text-white leading-none">
                        {item.value}
                        <span className="text-xl text-[#34D399] ml-2">{item.unit}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded text-base font-bold tracking-wider ${
                        item.badge === "MASTER" ? "bg-[#34D399]/10 text-[#34D399]" : "bg-white/5 golf-text-secondary"
                      }`}
                    >
                      {item.badge}
                    </span>
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
            className="absolute top-24 right-12 w-64 bg-[#0D1512] border border-white/10 rounded-2xl shadow-2xl p-6 z-50"
          >
            <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-full bg-[#34D399]/20 flex items-center justify-center text-[#34D399]">
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
                  className="w-full flex items-center justify-between text-base font-bold text-[#34D399] hover:text-[#6EE7B7]"
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
