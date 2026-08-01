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
  const [greeting, setGreeting] = useState("Welcome Back");
  useEffect(() => setGreeting(timeOfDayGreeting()), []);
  const subtitle = welcomeSubtitle(YOUR_MAKE_STREAK, latest.date);

  // Same rank framing as before — percentile for the hero "Locally" stat.
  const localFieldSize = 68;
  const yourRank = 5;
  const localTopPercent = Math.ceil((yourRank / localFieldSize) * 100);

  return (
    <div className="w-full h-full min-h-0 flex overflow-hidden relative">
      {/* Main Content — no scroll on iPad; desktop can grow naturally inside parent. */}
      <main className="flex-1 min-h-0 overflow-hidden xl:overflow-y-auto px-6 py-4 xl:px-12 xl:py-10 z-10 relative flex flex-col">
        <header className="flex justify-between items-end mb-4 xl:mb-8 shrink-0">
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
            <button
              type="button"
              onClick={() => navigate({ to: "/practice" })}
              className="golf-accent-glow flex items-center gap-2 xl:gap-3 bg-[#22C55E] hover:bg-[#4ADE80] text-black px-4 py-2 xl:px-6 xl:py-3 rounded-xl font-bold transition-all text-sm xl:text-base"
            >
              <Play className="h-[18px] w-[18px] xl:h-5 xl:w-5" />
              <span>START SESSION</span>
            </button>
            <button
              ref={avatarRef}
              onClick={() => setShowSettings((s) => !s)}
              className="w-10 h-10 xl:w-12 xl:h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center text-sm font-bold text-[#22C55E]"
            >
              DS
            </button>
          </div>
        </header>

        {/* Single full-width stack: hero stats → secondary stats → chart */}
        <div className="golf-glass rounded-[12px] p-4 xl:p-8 relative overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0E1E16] blur-3xl rounded-full translate-x-10 -translate-y-10" />

          {/* Hero row */}
          <div className="relative grid w-full grid-cols-3 items-start shrink-0">
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
              <Link
                to="/compete"
                className="mt-2 xl:mt-3 inline-flex items-center gap-1 text-xs xl:text-sm font-semibold text-[#22C55E] hover:text-[#4ADE80] transition-colors"
              >
                View full leaderboard
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="border-l border-white/10 pl-4 xl:pl-8 min-w-0">
              <p className="golf-label mb-1">Current Streak</p>
              <div className="golf-display text-2xl xl:text-3xl leading-none text-white">
                <span className="text-[#22C55E]">{YOUR_MAKE_STREAK}</span>
                <span className="text-xs xl:text-sm golf-text-secondary ml-2">MADE IN A ROW</span>
              </div>
            </div>
          </div>

          {/* Secondary stats row — former Personal Bests */}
          <div className="relative mt-4 xl:mt-6 pt-4 xl:pt-6 border-t border-white/5 grid w-full grid-cols-3 items-start shrink-0">
            <div className="min-w-0">
              <p className="golf-label mb-1">BEST MAKE %</p>
              <div className="golf-display text-2xl xl:text-3xl leading-none text-white">
                {bestSession.makePercent}
                <span className="text-lg xl:text-xl text-[#22C55E] ml-1.5">%</span>
              </div>
            </div>

            <div className="border-l border-white/10 pl-4 xl:pl-8 min-w-0">
              <p className="golf-label mb-1">SESSIONS LOGGED</p>
              <div className="golf-display text-2xl xl:text-3xl leading-none text-white">
                {sessions.length}
                <span className="text-xs xl:text-sm golf-text-secondary ml-2">TOTAL</span>
              </div>
            </div>

            <div className="border-l border-white/10 pl-4 xl:pl-8 min-w-0">
              <p className="golf-label mb-1">PUTTS RECORDED</p>
              <div className="golf-display text-2xl xl:text-3xl leading-none text-white">
                {totalPutts}
                <span className="text-xs xl:text-sm golf-text-secondary ml-2">PUTTS</span>
              </div>
            </div>
          </div>

          {/* Progress chart — full remaining height */}
          <div className="relative mt-4 pt-4 xl:mt-8 xl:pt-8 border-t border-white/5 flex-1 flex flex-col min-h-0">
            <ProgressChart sessions={sessions} />
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
