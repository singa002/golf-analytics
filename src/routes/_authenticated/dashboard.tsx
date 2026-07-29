import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronRight,
  Clock,
  Eye,
  LayoutDashboard,
  Settings as SettingsIcon,
  Trophy,
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

const BG = "#0D1A0D";
const SIDEBAR = "#0A150A";
const CARD = "#1A2A1A";
const BORDER = "#2A3A2A";
const GREEN = "#22C55E";
const WHITE = "#FFFFFF";
const GRAY = "#6B7B6B";

const cardStyle = {
  backgroundColor: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 12,
} as const;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase font-medium" style={{ color: GRAY, letterSpacing: "0.18em" }}>
      {children}
    </div>
  );
}

const NAV: { to: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { to: "/dashboard", Icon: LayoutDashboard },
  { to: "/preview", Icon: Eye },
  { to: "/analytics", Icon: BarChart3 },
  { to: "/history", Icon: Clock },
  { to: "/compete", Icon: Trophy },
  { to: "/settings", Icon: SettingsIcon },
];

function Sidebar() {
  return (
    <aside
      className="w-[72px] shrink-0 flex flex-col items-center gap-2 py-8"
      style={{ backgroundColor: SIDEBAR, borderRight: `1px solid ${BORDER}` }}
    >
      {NAV.map(({ to, Icon }) => {
        const active = to === "/dashboard";
        return (
          <Link
            key={to}
            to={to}
            className="h-11 w-11 rounded-xl flex items-center justify-center transition"
            style={
              active
                ? { backgroundColor: "rgba(34,197,94,0.12)", color: GREEN }
                : { color: GRAY }
            }
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </aside>
  );
}

function DashboardPage() {
  const sessions = getSessionHistory();
  const latest = sessions[0];
  const bestSession = sessions.reduce((a, b) => (a.makePercent >= b.makePercent ? a : b));
  const totalPutts = sessions.reduce((s, x) => s + x.totalPutts, 0);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex" style={{ backgroundColor: BG }}>
      <Sidebar />

      <div className="flex-1 p-10">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left — two thirds */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-5 p-6" style={cardStyle}>
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                style={{ backgroundColor: "rgba(34,197,94,0.12)", color: GREEN }}
              >
                DS
              </div>
              <div>
                <div className="text-[28px] leading-tight font-bold" style={{ color: WHITE }}>
                  Dheeraj
                </div>
                <div className="text-sm mt-1" style={{ color: GRAY }}>
                  Handicap 8.2 · Coach Williams
                </div>
              </div>
            </div>

            <Link to="/history" className="block p-6 transition hover:opacity-90" style={cardStyle}>
              <Label>Make %</Label>
              <div className="text-[72px] leading-none font-bold mt-2" style={{ color: WHITE }}>
                {latest.makePercent}%
              </div>
              <div className="text-sm mt-3" style={{ color: GRAY }}>
                Last session · {latest.date}
              </div>

              <div className="grid grid-cols-3 gap-6 mt-8 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
                <Stat label="Total Putts" value={latest.totalPutts.toString()} />
                <Stat label="Made" value={latest.made.toString()} color={GREEN} />
                <Stat label="Missed" value={latest.missed.toString()} />
              </div>
            </Link>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/preview"
                className="rounded-full px-7 py-3.5 text-xs font-semibold uppercase"
                style={{ backgroundColor: GREEN, color: "#0A150A", letterSpacing: "0.12em" }}
              >
                Start Preview
              </Link>
              <Link
                to="/analytics"
                className="rounded-full px-7 py-3.5 text-xs font-semibold uppercase"
                style={{ border: `1px solid ${BORDER}`, color: WHITE, letterSpacing: "0.12em" }}
              >
                View Analytics
              </Link>
              <Link
                to="/history"
                className="rounded-full px-7 py-3.5 text-xs font-semibold uppercase"
                style={{ border: `1px solid ${BORDER}`, color: WHITE, letterSpacing: "0.12em" }}
              >
                View History
              </Link>
            </div>
          </div>

          {/* Right — one third */}
          <div className="flex flex-col gap-6">
            <Link to="/compete" className="block p-6 transition hover:opacity-90" style={cardStyle}>
              <Label>Weekly Make % Leader</Label>
              <div className="text-[64px] leading-none font-bold mt-2" style={{ color: WHITE }}>
                #5
              </div>
              <div className="text-sm mt-3" style={{ color: GRAY }}>
                of 68 golfers · 2 days left
              </div>
            </Link>

            <div className="p-6" style={cardStyle}>
              <Label>Best Make %</Label>
              <div className="text-[64px] leading-none font-bold mt-2" style={{ color: GREEN }}>
                {bestSession.makePercent}%
              </div>
              <div className="grid grid-cols-2 gap-6 mt-8 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
                <Stat label="Sessions" value={sessions.length.toString()} />
                <Stat label="Putts" value={totalPutts.toString()} />
              </div>
            </div>

            <Link
              to="/settings"
              className="flex items-center justify-between px-6 py-5 transition hover:opacity-90"
              style={cardStyle}
            >
              <div className="flex items-center gap-3">
                <SettingsIcon size={18} style={{ color: GRAY }} />
                <span className="text-sm font-medium" style={{ color: WHITE }}>
                  Settings
                </span>
              </div>
              <ChevronRight size={18} style={{ color: GRAY }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color = WHITE }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="text-[32px] leading-none font-bold mt-2" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
