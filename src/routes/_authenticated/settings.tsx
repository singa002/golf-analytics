import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bluetooth, Crosshair, Share2 } from "lucide-react";
import { CoursePhotoBackdrop } from "@/components/CoursePhotoBackdrop";

const SETTINGS_SECTIONS = ["account", "hardware", "sharing"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export const Route = createFileRoute("/_authenticated/settings")({
  validateSearch: (search: Record<string, unknown>): { section?: SettingsSection } => {
    const section = search.section;
    return typeof section === "string" && SETTINGS_SECTIONS.includes(section as SettingsSection)
      ? { section: section as SettingsSection }
      : {};
  },
  head: () => ({
    meta: [
      { title: "Settings — Putt Vector" },
      { name: "description", content: "Manage your Putt Vector profile, preferences, and account settings." },
      { property: "og:title", content: "Settings — Putt Vector" },
      { property: "og:description", content: "Profile, preferences, and account for Putt Vector." },
    ],
  }),
  component: SettingsPage,
});

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`golf-glass rounded-[12px] p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <div className="golf-label mb-4">{children}</div>;
}

/**
 * A linkable settings section. The profile popover deep-links here via
 * `/settings?section=<id>`; `highlighted` briefly outlines the target so it's
 * obvious which destination you landed on.
 */
function Section({
  id,
  title,
  highlighted,
  children,
}: {
  id: SettingsSection | "preferences" | "about";
  title: string;
  highlighted: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-6 rounded-[16px] transition-shadow duration-500 ${
        highlighted ? "ring-2 ring-[#34D399] ring-offset-4 ring-offset-[#040906]" : ""
      }`}
    >
      <h2 className="golf-display text-xl text-white mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({
  on,
  onChange,
  locked = false,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !locked && onChange(!on)}
      disabled={locked}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
        on ? "bg-[#34D399]" : "bg-white/10"
      } ${locked ? "opacity-70 cursor-not-allowed" : ""}`}
      aria-pressed={on}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: [T, T];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full p-1 bg-[#040906] border border-white/10">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-1.5 text-base font-semibold rounded-full transition ${
              active ? "bg-[#34D399] text-black" : "golf-text-secondary"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
      <span className="text-sm text-white">{label}</span>
      {children}
    </div>
  );
}

function SettingsPage() {
  const { section } = Route.useSearch();
  const [distanceUnit, setDistanceUnit] = useState<"Feet" | "Meters">("Feet");
  const [speedUnit, setSpeedUnit] = useState<"m/s" | "mph">("m/s");
  const [voice, setVoice] = useState(true);
  const [sound, setSound] = useState(true);
  const [dark, setDark] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [shareSessions, setShareSessions] = useState(true);
  const [shareVideo, setShareVideo] = useState(false);
  const [highlighted, setHighlighted] = useState<SettingsSection | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!section) return;
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlighted(section);
    highlightTimer.current = setTimeout(() => setHighlighted(null), 2000);
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, [section]);

  return (
    <div className="relative p-4 min-h-full">
      <CoursePhotoBackdrop />
      <h1 className="sr-only">Settings</h1>
      <div className="relative flex w-full max-w-[1500px] flex-col gap-10 mx-auto">
        <Section id="account" title="Account Settings" highlighted={highlighted === "account"}>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <div className="flex items-start gap-5">
                <div className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-[#34D399] bg-[#34D399]/15">
                  DS
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-white">Dheeraj Singavarapu</div>
                  <div className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-base font-bold tracking-wider text-[#34D399] bg-[#34D399]/15">
                    GOLFER
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <div className="golf-label">Handicap</div>
                      <div className="golf-display text-lg text-white">8.2</div>
                    </div>
                    <div>
                      <div className="golf-label-sm whitespace-nowrap">Assigned Coach</div>
                      <div className="golf-display text-lg text-white">Coach Williams</div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="mt-5 w-full py-2.5 rounded-xl border border-[#34D399] text-[#34D399] text-sm font-semibold hover:bg-[#34D399]/10 transition">
                Edit Profile
              </button>
            </Card>

            <Card>
              <SectionHeader>Account</SectionHeader>
              <div className="space-y-3">
                <div>
                  <div className="golf-label">Email</div>
                  <div className="text-sm text-white">dheeraj@golfanalytics.com</div>
                </div>
                <div>
                  <div className="golf-label">Member Since</div>
                  <div className="text-sm text-white">July 2026</div>
                </div>
              </div>
              <button className="mt-5 w-full py-2.5 rounded-xl border border-[#EF4444] text-[#EF4444] text-sm font-semibold hover:bg-[#EF4444]/10 transition">
                Sign Out
              </button>
            </Card>
          </div>
        </Section>

        <Section id="hardware" title="Hardware Status" highlighted={highlighted === "hardware"}>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <SectionHeader>Sensor</SectionHeader>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Bluetooth size={18} className="text-[#34D399]" />
                    <span className="text-sm text-white">Putt Vector Sensor</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-base font-bold tracking-wider text-[#34D399] bg-[#34D399]/15">
                    CONNECTED
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="golf-label">Battery</span>
                  <span className="text-sm font-semibold text-white">82%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="golf-label">Firmware</span>
                  <span className="text-sm font-semibold text-white">2.4.1</span>
                </div>
              </div>
            </Card>

            <Card>
              <SectionHeader>Calibration</SectionHeader>
              <p className="text-sm golf-text-secondary leading-relaxed">
                Recalibrate before a session if the sensor has been moved or remounted.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="golf-label">Last Calibrated</span>
                <span className="text-sm font-semibold text-white">Today, 3:41 PM</span>
              </div>
              <button className="mt-5 w-full py-2.5 rounded-xl border border-[#34D399] text-[#34D399] text-sm font-semibold hover:bg-[#34D399]/10 transition flex items-center justify-center gap-2">
                <Crosshair size={16} />
                Calibrate Sensor
              </button>
            </Card>
          </div>
        </Section>

        <Section id="sharing" title="Coach Sharing" highlighted={highlighted === "sharing"}>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <SectionHeader>Assigned Coach</SectionHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-[#34D399] bg-[#34D399]/15">
                  CW
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Coach Williams</div>
                  <div className="text-base golf-text-secondary">
                    Golf Analytics Performance Academy
                  </div>
                </div>
              </div>
              <button className="mt-5 w-full py-2.5 rounded-xl border border-white/20 golf-text-secondary text-sm font-semibold hover:bg-white/5 hover:text-white transition flex items-center justify-center gap-2">
                <Share2 size={16} />
                Manage Sharing
              </button>
            </Card>

            <Card>
              <SectionHeader>What Your Coach Sees</SectionHeader>
              <div>
                <ToggleRow label="Session Analytics">
                  <Toggle on={shareSessions} onChange={setShareSessions} />
                </ToggleRow>
                <ToggleRow label="Stroke Video">
                  <Toggle on={shareVideo} onChange={setShareVideo} />
                </ToggleRow>
              </div>
            </Card>
          </div>
        </Section>

        <Section id="preferences" title="Preferences" highlighted={false}>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <SectionHeader>Preferences</SectionHeader>
              <div>
                <ToggleRow label="Distance Units">
                  <SegmentedToggle options={["Feet", "Meters"]} value={distanceUnit} onChange={setDistanceUnit} />
                </ToggleRow>
                <ToggleRow label="Speed Units">
                  <SegmentedToggle options={["m/s", "mph"]} value={speedUnit} onChange={setSpeedUnit} />
                </ToggleRow>
                <ToggleRow label="Voice Coaching">
                  <Toggle on={voice} onChange={setVoice} />
                </ToggleRow>
                <ToggleRow label="Sound Effects">
                  <Toggle on={sound} onChange={setSound} />
                </ToggleRow>
                <ToggleRow label="Dark Mode">
                  <Toggle on={dark} onChange={setDark} locked />
                </ToggleRow>
                <ToggleRow label="Auto-save Sessions">
                  <Toggle on={autoSave} onChange={setAutoSave} />
                </ToggleRow>
              </div>
            </Card>

            <Card>
              <SectionHeader>About</SectionHeader>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="golf-label">App Version</span>
                  <span className="text-sm font-semibold text-white">1.0.0 Beta</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="golf-label">Brand</span>
                  <span className="text-sm font-semibold text-white">Golf Analytics</span>
                </div>
                <div className="pt-3 mt-2 border-t border-white/10 text-base golf-text-secondary text-center">
                  Powered by Putt Vector AI
                </div>
              </div>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}
