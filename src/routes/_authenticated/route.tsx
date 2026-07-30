import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  BarChart3,
  Clock,
  Eye,
  LayoutDashboard,
  Settings,
  Trophy,
} from "lucide-react";
import type { SVGProps } from "react";
import { AppSidebar, type NavItem } from "@/components/AppSidebar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const PutterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 3l3 3" />
    <path d="M7.5 4.5L18 15" />
    <path d="M15 12h6v3h-6z" />
    <circle cx="8" cy="20" r="1.5" />
  </svg>
);

const GOLFER_NAV: NavItem[] = [
  { to: "/preview", label: "Preview", Icon: Eye },
  { to: "/practice", label: "Practice", Icon: PutterIcon },
  { to: "/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/history", label: "History", Icon: Clock },
  { to: "/compete", label: "Compete", Icon: Trophy },
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/settings", label: "Settings", Icon: Settings },
];

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen golf-page-background flex flex-col">
      <header className="h-14 border-b border-border flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-semibold tracking-wide text-foreground">Putt Vector</span>
          <span className="text-xs text-muted-foreground ml-1">by Golf Analytics</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <AppSidebar
          navItems={GOLFER_NAV}
          profile={{
            initials: "DS",
            name: "Dheeraj S.",
            subtitle: "Pro Membership",
            mode: "golfer",
          }}
        />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
