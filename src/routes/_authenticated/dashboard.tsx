import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Play,
  Settings2,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import { getSessionHistory } from "@/lib/historyService";
import { useViewMode } from "@/context/ViewModeContext";

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

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] flex overflow-hidden relative">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-12 py-10 z-10 relative">
        <header className="flex justify-between items-end mb-12">
          <div>
            <p className="golf-label mb-1">Good Morning, Dheeraj</p>
            <h1 className="golf-display text-3xl text-white">Handicap 8.2 · Coach Williams</h1>
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
            {/* Hero Card */}
            <div className="bg-[#0D1512] border border-white/10 rounded-[12px] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#34D399]/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
              <p className="golf-label mb-1">SEASON MAKE %</p>
              <div className="golf-accent-text-glow flex items-baseline gap-4">
                <span className="golf-display text-7xl text-white leading-none">{latest.makePercent}</span>
                <span className="golf-display text-2xl text-[#34D399]">%</span>
              </div>
              <div className="mt-8 flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                  <span className="text-xs golf-text-secondary font-medium">
                    Best <span className="text-[#34D399]">{bestSession.makePercent}%</span> this month
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#34D399]" />
                  <span className="text-xs golf-text-secondary font-medium uppercase tracking-widest">
                    Ranked <span className="text-[#F59E0B]">#5</span> of 68
                  </span>
                </div>
              </div>
            </div>

            {/* Session Summary */}
            <div className="bg-[#0D1512] border border-white/10 rounded-[12px] p-8">
              <div className="flex justify-between items-center mb-8">
                <p className="golf-label">LAST SESSION SUMMARY</p>
                <span className="text-[10px] uppercase tracking-widest golf-text-secondary">
                  {latest.date} • {latest.time}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="golf-label mb-2">TOTAL PUTTS</p>
                  <p className="golf-display text-3xl text-white">{latest.totalPutts}</p>
                </div>
                <div>
                  <p className="golf-label mb-2">MADE</p>
                  <p className="golf-display text-3xl text-[#22C55E]">{latest.made}</p>
                </div>
                <div>
                  <p className="golf-label mb-2">AVG DIST</p>
                  <p className="golf-display text-3xl text-white">
                    {latest.avgDistanceFt}
                    <span className="text-sm ml-1 golf-text-secondary">FT</span>
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <p className="golf-label">FACE ANGLE CONSISTENCY</p>
                  <span className="text-xs text-[#34D399] font-medium">EXCELLENT</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#EF4444]" style={{ width: "8%" }} />
                  <div className="h-full bg-[#22C55E]" style={{ width: "84%" }} />
                  <div className="h-full bg-[#EF4444]" style={{ width: "8%" }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] golf-text-secondary font-bold">OPEN</span>
                  <span className="text-[9px] golf-text-secondary font-bold">SQUARE</span>
                  <span className="text-[9px] golf-text-secondary font-bold">CLOSED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-5 flex flex-col gap-8">
            {/* Leaderboard */}
            <div className="bg-[#0D1512] border border-white/10 rounded-[12px] p-8">
              <p className="golf-label mb-6">LOCAL LEADERBOARD</p>
              <div className="space-y-6">
                {[
                  { rank: 1, name: "Justin D.", score: "94.1%", you: false },
                  { rank: 5, name: "Dheeraj S. (You)", score: `${latest.makePercent}%`, you: true },
                  { rank: 6, name: "Mike K.", score: "87.9%", you: false },
                ].map(({ rank, name, score, you }) => (
                  <div
                    key={rank}
                    className={`flex items-center gap-4 ${
                      you ? "bg-white/5 -mx-4 px-4 py-2 rounded-lg border-l-2 border-[#34D399]" : ""
                    }`}
                  >
                    <div className={you ? "text-[#34D399] font-bold" : "text-[#F59E0B] font-bold"}>{rank}</div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        you ? "bg-[#34D399]/20 border border-[#34D399]/40 text-[#34D399]" : "bg-white/10 text-white/70"
                      }`}
                    >
                      {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className={you ? "flex-1 font-bold text-white" : "flex-1 font-medium text-white/80"}>{name}</div>
                    <div className="text-white font-bold">{score}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Bests */}
            <div className="bg-[#0D1512] border border-white/10 rounded-[12px] p-8 flex-1">
              <p className="golf-label mb-6">PERSONAL BESTS</p>
              <div className="space-y-8">
                {[
                  { label: "BEST MAKE %", value: `${bestSession.makePercent}`, unit: "%", badge: "MASTER" },
                  { label: "SESSIONS LOGGED", value: `${sessions.length}`, unit: "TOTAL", badge: "ACTIVE" },
                  { label: "PUTTS RECORDED", value: `${totalPutts}`, unit: "PUTTS", badge: "STREAK ENDER" },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="golf-label mb-2">{item.label}</p>
                    <div className="flex justify-between items-center">
                      <span className="golf-display text-2xl text-white">
                        {item.value} <span className="text-sm golf-text-secondary">{item.unit}</span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-[8px] font-bold ${
                          item.badge === "MASTER" ? "bg-[#34D399]/10 text-[#34D399]" : "bg-white/5 golf-text-secondary"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/practice"
                className="flex flex-col items-center justify-center gap-3 bg-[#0D1512] border border-white/10 py-6 rounded-[12px] hover:bg-white/5 transition-all group"
              >
                <Target size={24} className="text-white/40 group-hover:text-[#34D399]" />
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Drill Mode</span>
              </Link>
              <Link
                to="/settings"
                className="flex flex-col items-center justify-center gap-3 bg-[#0D1512] border border-white/10 py-6 rounded-[12px] hover:bg-white/5 transition-all group"
              >
                <Settings2 size={24} className="text-white/40 group-hover:text-[#34D399]" />
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Calibrate</span>
              </Link>
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
                <p className="text-[10px] golf-text-secondary">Pro Membership</p>
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
                  className="w-full flex items-center justify-between text-xs font-bold text-[#34D399] hover:text-[#6EE7B7]"
                >
                  <span>Switch to Coach View</span>
                  <ChevronRight size={16} />
                </button>
              </li>
              {["Account Settings", "Hardware Status", "Coach Sharing"].map((item) => (
                <li key={item}>
                  <Link
                    to="/settings"
                    className="flex items-center justify-between text-xs text-white/60 hover:text-white cursor-pointer"
                  >
                    <span>{item}</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-white/10">
                <Link to="/" className="text-xs text-red-400 font-bold hover:text-red-300">
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
