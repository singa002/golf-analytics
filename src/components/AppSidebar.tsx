import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronRight, User } from "lucide-react";
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { useViewMode } from "@/context/ViewModeContext";

export type NavItem = {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

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
  const settingsItem = navItems.find(({ to }) => to === "/settings");
  const primaryItems = navItems.filter(({ to }) => to !== "/settings");

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
    <nav className="sticky top-0 h-screen w-[100px] shrink-0 flex flex-col items-center py-8 z-20 border-r border-white/10 bg-[#0D1512]">
      <div className="flex flex-col gap-4 flex-1 w-full px-2 min-h-0 overflow-y-auto">
        {primaryItems.map(({ to, label, Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-3 rounded-lg transition-colors ${
                active
                  ? "golf-accent-glow text-[#34D399] bg-[#34D399]/10"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <Icon width={20} height={20} />
              <span className="text-[10px] uppercase tracking-widest font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="shrink-0 flex flex-col items-center w-full px-2">
        {settingsItem && (
          <Link
            to={settingsItem.to}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
              isActive(settingsItem.to)
                ? "golf-accent-glow text-[#34D399] bg-[#34D399]/10"
                : "text-white/40 hover:text-white"
            }`}
          >
            <settingsItem.Icon width={20} height={20} />
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              {settingsItem.label}
            </span>
          </Link>
        )}
        <button
          ref={avatarRef}
          onClick={() => setShowSettings((shown) => !shown)}
          className="mt-4 w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center text-sm font-bold text-[#34D399]"
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
            <div className="w-10 h-10 rounded-full bg-[#34D399]/20 flex items-center justify-center text-[#34D399]">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{profile.name}</p>
              <p className="text-[10px] golf-text-secondary">{profile.subtitle}</p>
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
                className="w-full flex items-center justify-between text-xs font-bold text-[#34D399] hover:text-[#6EE7B7]"
              >
                <span>Switch to {profile.mode === "golfer" ? "Coach" : "Golfer"} View</span>
                <ChevronRight size={16} />
              </button>
            </li>
            {profile.mode === "golfer" &&
              ["Account Settings", "Hardware Status", "Coach Sharing"].map((item) => (
                <li key={item}>
                  <Link
                    to="/settings"
                    onClick={() => setShowSettings(false)}
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
    </nav>
  );
}
