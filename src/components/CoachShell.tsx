import { BarChart3, CalendarDays, LayoutDashboard, Users } from "lucide-react";
import type { ReactNode } from "react";
import { COACH } from "@/lib/coachService";
import { AppSidebar, type NavItem } from "@/components/AppSidebar";

const COACH_NAV: NavItem[] = [
  { to: "/coach", label: "Home", Icon: LayoutDashboard },
  { to: "/coach/students", label: "Students", Icon: Users },
  { to: "/coach/analytics", label: "Stats", Icon: BarChart3 },
  { to: "/coach/schedule", label: "Schedule", Icon: CalendarDays },
];

export function CoachShell({ children }: { children: ReactNode }) {
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

      {/* Same shared sidebar as authenticated layout (coach routes sit outside _authenticated). */}
      <div className="relative z-20 flex">
        <AppSidebar
          navItems={COACH_NAV}
          profile={{
            initials: COACH.initials,
            name: COACH.name,
            subtitle: "Coach Account",
            mode: "coach",
          }}
        />
      </div>

      <main className="flex-1 overflow-y-auto px-12 py-10 z-10 relative">
        {children}
      </main>
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
