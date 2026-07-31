import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronRight, User } from "lucide-react";
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { useViewMode } from "@/context/ViewModeContext";

export type NavItem = {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/** Profile-popover destinations, each deep-linking to its own Settings section. */
export const SETTINGS_LINKS = [
  { label: "Account Settings", section: "account" },
  { label: "Hardware Status", section: "hardware" },
  { label: "Coach Sharing", section: "sharing" },
] as const;

type SidebarProfile = {
  initials: string;
  name: string;
  subtitle: string;
  mode: "golfer" | "coach";
};

type AppSidebarProps = {
  navItems: NavItem[];
  profile: SidebarProfile;
};

/** Single shared left nav for golfer + coach shells. */
export function AppSidebar({ navItems, profile }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setMode } = useViewMode();
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!showSettings) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (settingsRef.current?.contains(target) || avatarRef.current?.contains(target)) return;
      setShowSettings(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showSettings]);

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/coach" && location.pathname.startsWith(`${to}/`));

  return (
    // Shells that render a top header set --app-header-h so the sidebar ends at the
    // viewport bottom and the avatar never falls below the fold.
    <nav className="sticky top-0 h-[calc(100vh-var(--app-header-h,0px))] w-[100px] shrink-0 flex flex-col items-center pt-3 pb-5 z-20 border-r border-white/10 bg-[#0D1512]">
      {/* overflow-y-auto clips box-shadow; py gives the active glow room at the ends
          without changing spacing between nav items (still justify-between). */}
      <div className="flex flex-col justify-between flex-1 w-full px-2 py-6 min-h-0 overflow-y-auto">
        {navItems.map(({ to, label, Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`shrink-0 flex flex-col items-center gap-1 py-3 rounded-lg transition-colors ${
                active
                  ? "golf-accent-glow text-[#22C55E] bg-[#0F271A]"
                  : "golf-text-secondary hover:text-white"
              }`}
            >
              <Icon width={20} height={20} />
              {/* Quiet wayfinding — keep small; do not use golfer-chrome-text (16px floor). */}
              <span className="text-xs uppercase tracking-widest font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Avatar stays fixed at the bottom — not part of the even nav distribution. */}
      <div className="shrink-0 flex flex-col items-center w-full px-2 pt-4">
        <button
          ref={avatarRef}
          onClick={() => setShowSettings((shown) => !shown)}
          className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center text-sm font-bold text-[#22C55E]"
        >
          {profile.initials}
        </button>
      </div>

      {showSettings && (
        <div
          ref={settingsRef}
          className="absolute bottom-8 left-24 w-64 bg-[#0D1512] border border-white/10 rounded-2xl shadow-2xl p-6 z-50"
        >
          <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-full bg-[#113821] flex items-center justify-center text-[#22C55E]">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{profile.name}</p>
              <p className="golfer-chrome-text text-[10px] golf-text-secondary">{profile.subtitle}</p>
            </div>
          </div>
          <ul className="space-y-4">
            <li className={profile.mode === "golfer" ? "pb-3 border-b border-white/10" : ""}>
              <button
                onClick={() => {
                  const nextMode = profile.mode === "golfer" ? "coach" : "golfer";
                  setMode(nextMode);
                  setShowSettings(false);
                  navigate({ to: nextMode === "coach" ? "/coach" : "/dashboard" });
                }}
                className="golfer-chrome-text w-full flex items-center justify-between text-xs font-bold text-[#22C55E] hover:text-[#4ADE80]"
              >
                <span>Switch to {profile.mode === "golfer" ? "Coach" : "Golfer"} View</span>
                <ChevronRight size={16} />
              </button>
            </li>
            {profile.mode === "golfer" &&
              SETTINGS_LINKS.map(({ label, section }) => (
                <li key={section}>
                  <Link
                    to="/settings"
                    search={{ section }}
                    onClick={() => setShowSettings(false)}
                    className="golfer-chrome-text flex items-center justify-between text-xs golf-text-secondary hover:text-white cursor-pointer"
                  >
                    <span>{label}</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
              ))}
            <li className="pt-2 border-t border-white/10">
              <Link to="/" className="golfer-chrome-text text-xs text-red-400 font-bold hover:text-red-300">
                Sign Out
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
