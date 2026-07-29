import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronRight,
  Clock,
  Eye,
  LayoutDashboard,
  Play,
  Settings2,
  Target,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
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

const PutterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 3l3 3" />
    <path d="M7.5 4.5L18 15" />
    <path d="M15 12h6v3h-6z" />
    <circle cx="8" cy="20" r="1.5" />
  </svg>
);

const NAV: { to: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { to: "/dashboard", label: "Home", Icon: LayoutDashboard },
  { to: "/preview", label: "Preview", Icon: Eye },
  { to: "/practice", label: "Practice", Icon: PutterIcon },
  { to: "/analytics", label: "Stats", Icon: BarChart3 },
  { to: "/history", label: "Past", Icon: Clock },
  { to: "/compete", label: "Compete", Icon: Trophy },
];

function DashboardPage() {
  const [showSettings, setShowSettings] = useState(false);
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
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-[#0D1A0D] flex overflow-hidden relative">
      {/* Grass Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E"),
          linear-gradient(45deg, rgba(26, 42, 26, 0.2) 25%, transparent 25%, transparent 50%, rgba(26, 42, 26, 0.2) 50%, rgba(26, 42, 26, 0.2) 75%, transparent 75%, transparent)
        `,
          backgroundSize: "200px 200px, 160px 160px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
        style={{ background: "radial-gradient(circle at 50% 50%, transparent 0%, #081208 100%)" }}
      />

      {/* Sidebar */}
      <nav className="w-[100px] flex flex-col items-center py-8 z-20 border-r border-white/5 bg-[#0D1A0D]">
        <div className="mb-12 text-3xl text-[#22C55E]">⛳</div>
        <div className="flex flex-col gap-6 flex-1 w-full px-2">
          {NAV.map(({ to, label, Icon }) => {
            const active = to === "/dashboard";
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-3 rounded-lg transition-colors ${
                  active ? "text-[#22C55E] bg-[#22C55E]/10" : "text-white/40 hover:text-white"
                }`}
              >
                <Icon width={20} height={20} />
                <span className="text-[10px] uppercase tracking-widest font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
        <button
          ref={avatarRef}
          onClick={() => setShowSettings((s) => !s)}
          className="mt-auto w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center text-sm font-bold text-[#22C55E]"
        >
          DS
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-12 py-10 z-10">
        <header className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">Good Morning, Dheeraj</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">Handicap 8.2 · Coach Williams</h1>
          </div>
          <Link
            to="/preview"
            className="flex items-center gap-3 bg-[#22C55E] hover:bg-[#16a34a] text-black px-6 py-3 rounded-xl font-bold transition-all"
          >
            <Play size={20} />
            <span>START SESSION</span>
          </Link>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="col-span-7 flex flex-col gap-8">
            {/* Hero Card */}
            <div className="bg-[#1A2A1A] border border-white/10 rounded-[12px] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">SEASON MAKE %</p>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-bold text-white leading-none">{latest.makePercent}</span>
                <span className="text-2xl font-medium text-[#22C55E]">%</span>
              </div>
              <div className="mt-8 flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <span className="text-xs text-white/60 font-medium">Best {bestSession.makePercent}% this month</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#22C55E]" />
                  <span className="text-xs text-white/60 font-medium uppercase tracking-widest">Ranked #5 of 68</span>
                </div>
              </div>
            </div>

            {/* Session Summary */}
            <div className="bg-[#1A2A1A] border border-white/10 rounded-[12px] p-8">
              <div className="flex justify-between items-center mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">LAST SESSION SUMMARY</p>
                <span className="text-[10px] uppercase tracking-widest text-white/60">
                  {latest.date} • {latest.time}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">TOTAL PUTTS</p>
                  <p className="text-3xl font-bold text-white">{latest.totalPutts}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">MADE</p>
                  <p className="text-3xl font-bold text-[#22C55E]">{latest.made}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">AVG DIST</p>
                  <p className="text-3xl font-bold text-white">
                    {latest.avgDistanceFt}
                    <span className="text-sm ml-1 text-white/40">FT</span>
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">FACE ANGLE CONSISTENCY</p>
                  <span className="text-xs text-[#22C55E] font-medium">EXCELLENT</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#EF4444]" style={{ width: "8%" }} />
                  <div className="h-full bg-[#22C55E]" style={{ width: "84%" }} />
                  <div className="h-full bg-[#EF4444]" style={{ width: "8%" }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] text-white/30 font-bold">OPEN</span>
                  <span className="text-[9px] text-white/30 font-bold">SQUARE</span>
                  <span className="text-[9px] text-white/30 font-bold">CLOSED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-5 flex flex-col gap-8">
            {/* Leaderboard */}
            <div className="bg-[#1A2A1A] border border-white/10 rounded-[12px] p-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">LOCAL LEADERBOARD</p>
              <div className="space-y-6">
                {[
                  { rank: 1, name: "Justin D.", score: "94.1%", you: false },
                  { rank: 5, name: "Dheeraj S. (You)", score: `${latest.makePercent}%`, you: true },
                  { rank: 6, name: "Mike K.", score: "87.9%", you: false },
                ].map(({ rank, name, score, you }) => (
                  <div
                    key={rank}
                    className={`flex items-center gap-4 ${
                      you ? "bg-white/5 -mx-4 px-4 py-2 rounded-lg border-l-2 border-[#22C55E]" : ""
                    }`}
                  >
                    <div className={you ? "text-[#22C55E] font-bold" : "text-white/20 font-bold"}>{rank}</div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        you ? "bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E]" : "bg-white/10 text-white/70"
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
            <div className="bg-[#1A2A1A] border border-white/10 rounded-[12px] p-8 flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">PERSONAL BESTS</p>
              <div className="space-y-8">
                {[
                  { label: "BEST MAKE %", value: `${bestSession.makePercent}`, unit: "%", badge: "MASTER" },
                  { label: "SESSIONS LOGGED", value: `${sessions.length}`, unit: "TOTAL", badge: "ACTIVE" },
                  { label: "PUTTS RECORDED", value: `${totalPutts}`, unit: "PUTTS", badge: "STREAK ENDER" },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">{item.label}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-white">
                        {item.value} <span className="text-sm text-white/40">{item.unit}</span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-[8px] font-bold ${
                          item.badge === "MASTER" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-white/5 text-white/40"
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
                className="flex flex-col items-center justify-center gap-3 bg-[#1A2A1A] border border-white/10 py-6 rounded-[12px] hover:bg-white/5 transition-all group"
              >
                <Target size={24} className="text-white/40 group-hover:text-[#22C55E]" />
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Drill Mode</span>
              </Link>
              <Link
                to="/settings"
                className="flex flex-col items-center justify-center gap-3 bg-[#1A2A1A] border border-white/10 py-6 rounded-[12px] hover:bg-white/5 transition-all group"
              >
                <Settings2 size={24} className="text-white/40 group-hover:text-[#22C55E]" />
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Calibrate</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Popup */}
      {showSettings && (
        <div
          ref={settingsRef}
          className="absolute bottom-24 left-24 w-64 bg-[#1A2A1A] border border-white/10 rounded-2xl shadow-2xl p-6 z-50"
        >
          <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Dheeraj S.</p>
              <p className="text-[10px] text-white/40">Pro Membership</p>
            </div>
          </div>
          <ul className="space-y-4">
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
    </div>
  );
}
