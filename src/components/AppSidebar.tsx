import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronRight, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ComponentType, type SVGProps } from "react";
import { useViewMode } from "@/context/ViewModeContext";
import { LiquidButton } from "@/components/LiquidButton";

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

/** Shared liquid-glass physics options for sidebar nav chips. */
const SIDEBAR_LIQUID_OPTIONS = {
  glassThickness: 100,
  bezelWidth: 10,
  refractiveIndex: 1.5,
  profile: "convexSquircle" as const,
  blur: 0.6,
  saturation: 1.25,
};

function SidebarNavLiquidItem({
  to,
  label,
  Icon,
  active,
}: NavItem & { active: boolean }) {
  const navigate = useNavigate();
  const events = useMemo(
    () => ({
      click: () => navigate({ to }),
    }),
    [navigate, to],
  );

  return (
    <LiquidButton
      label={label}
      options={SIDEBAR_LIQUID_OPTIONS}
      events={events}
      className={`lg-button shrink-0 ${
        active ? "golf-accent-glow text-[#22C55E]" : "golf-text-secondary hover:text-white"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <Icon width={20} height={20} className="lg-nav-icon" />
    </LiquidButton>
  );
}

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

  const profileEvents = useMemo(
    () => ({
      click: () => setShowSettings((shown) => !shown),
    }),
    [],
  );

  return (
    // Transparent shell — photo shows between floating liquid-glass nav items.
    // Shells that render a top header set --app-header-h so the sidebar ends at the
    // viewport bottom and the avatar never falls below the fold.
    <nav className="golf-sidebar-liquid sticky top-0 h-[calc(100vh-var(--app-header-h,0px))] w-[100px] shrink-0 flex flex-col items-center pt-3 pb-5 z-20 bg-transparent">
      {/* overflow-y-auto clips box-shadow; py gives the active glow room at the ends
          without changing spacing between nav items (still justify-between). */}
      <div className="flex flex-col justify-between flex-1 w-full px-2 py-6 min-h-0 overflow-y-auto">
        {navItems.map(({ to, label, Icon }) => (
          <SidebarNavLiquidItem
            key={to}
            to={to}
            label={label}
            Icon={Icon}
            active={isActive(to)}
          />
        ))}
      </div>

      {/* Avatar stays fixed at the bottom — not part of the even nav distribution. */}
      <div className="shrink-0 flex flex-col items-center w-full px-2 pt-4">
        <LiquidButton
          ref={avatarRef}
          label=""
          options={SIDEBAR_LIQUID_OPTIONS}
          events={profileEvents}
          className="lg-button w-full golf-text-secondary hover:text-white"
          aria-label="Open profile menu"
        >
          <span className="lg-nav-icon w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center text-sm font-bold text-[#22C55E]">
            {profile.initials}
          </span>
        </LiquidButton>
      </div>

      {showSettings && (
        <div
          ref={settingsRef}
          className="golf-glass absolute bottom-8 left-24 w-64 rounded-2xl p-6 z-50"
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
