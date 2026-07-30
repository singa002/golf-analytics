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
    <div className="golf-page-background w-full min-h-screen flex overflow-hidden relative">
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
  return <p className="golf-label">{children}</p>;
}

export function CoachCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0D1512] border border-white/10 rounded-[12px] p-8 ${className}`}>{children}</div>
  );
}
