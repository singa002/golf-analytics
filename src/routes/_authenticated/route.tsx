import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { Eye, BarChart3, Clock, Settings as SettingsIcon, Trophy } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});


// Custom putter icon
const PutterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 3l3 3" />
    <path d="M7.5 4.5L18 15" />
    <path d="M15 12h6v3h-6z" />
    <circle cx="8" cy="20" r="1.5" />
  </svg>
);

type Tab = { to: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };
const TABS: Tab[] = [
  { to: "/preview", label: "Preview", Icon: Eye },
  { to: "/practice", label: "Practice", Icon: PutterIcon },
  { to: "/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/history", label: "History", Icon: Clock },
  { to: "/settings", label: "Settings", Icon: SettingsIcon },
  { to: "/compete", label: "Compete", Icon: Trophy },
];

function AuthenticatedLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 border-b border-border flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-semibold tracking-wide text-foreground">Putt Vector</span>
          <span className="text-xs text-muted-foreground ml-1">by Golf Analytics</span>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <Outlet />
      </main>


      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-nav border-t border-border">
        <div className="h-full max-w-6xl mx-auto grid grid-cols-6">
          {TABS.map(({ to, label, Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center gap-1 transition ${
                  active ? "text-primary" : "text-nav-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
