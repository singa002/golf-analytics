import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import { ChevronRight, LayoutDashboard, Users, BarChart3, CalendarDays, User } from "lucide-react";
import { useViewMode } from "@/context/ViewModeContext";
import { COACH } from "@/lib/coachService";

// Coach navigation. Add new items here — the sidebar renders whatever is listed.
export const COACH_NAV: { to: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { to: "/coach", label: "Home", Icon: LayoutDashboard },
  { to: "/coach/students", label: "Students", Icon: Users },
  { to: "/coach/analytics", label: "Stats", Icon: BarChart3 },
  { to: "/coach/schedule", label: "Schedule", Icon: CalendarDays },
];

export function CoachShell({ children }: { children: ReactNode }) {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLButtonElement | null>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setMode } = useViewMode();

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

  return (
    <div className="w-full min-h-screen bg-[#0D1A0D] flex overflow-hidden relative">
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
          {COACH_NAV.map(({ to, label, Icon }) => {
            const active = to === "/coach" ? pathname === "/coach" : pathname.startsWith(to);
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
          {COACH.initials}
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto px-12 py-10 z-10">{children}</main>

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
              <p className="text-sm font-bold text-white">{COACH.name}</p>
              <p className="text-[10px] text-white/40">Coach Account</p>
            </div>
          </div>
          <ul className="space-y-4">
            <li>
              {/* TODO: replace with role-based routing once Supabase roles exist. */}
              <button
                onClick={() => {
                  setMode("golfer");
                  setShowSettings(false);
                  navigate({ to: "/dashboard" });
                }}
                className="w-full flex items-center justify-between text-xs font-bold text-[#22C55E] hover:text-[#4ade80]"
              >
                <span>Switch to Golfer View</span>
                <ChevronRight size={16} />
              </button>
            </li>
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

export function CoachLabel({ children }: { children: ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{children}</p>;
}

export function CoachCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1A2A1A] border border-white/10 rounded-[12px] p-8 ${className}`}>{children}</div>
  );
}
