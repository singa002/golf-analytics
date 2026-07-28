import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/settings")({
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
    <div className={`rounded-2xl p-6 ${className}`} style={{ backgroundColor: "#1C1C1E" }}>
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
      {children}
    </div>
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
        on ? "bg-[#22C55E]" : "bg-[#3A3A3D]"
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
    <div className="inline-flex rounded-full p-1" style={{ backgroundColor: "#131315" }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition ${
              active ? "bg-[#22C55E] text-black" : "text-muted-foreground"
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
    <div className="flex items-center justify-between py-3 border-b border-[#2A2A2C] last:border-b-0">
      <span className="text-sm text-foreground">{label}</span>
      {children}
    </div>
  );
}

function SettingsPage() {
  const [distanceUnit, setDistanceUnit] = useState<"Feet" | "Meters">("Feet");
  const [speedUnit, setSpeedUnit] = useState<"m/s" | "mph">("m/s");
  const [voice, setVoice] = useState(true);
  const [sound, setSound] = useState(true);
  const [dark, setDark] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="p-4 h-full">
      <h1 className="sr-only">Settings</h1>
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-9rem)] overflow-y-auto">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-start gap-5">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-[#22C55E]"
                style={{ backgroundColor: "#0F2A17" }}
              >
                DS
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-foreground">Dheeraj Singavarapu</div>
                <div className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-[#22C55E]" style={{ backgroundColor: "#0F2A17" }}>
                  GOLFER
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Handicap</div>
                    <div className="text-lg font-semibold text-foreground">8.2</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Assigned Coach</div>
                    <div className="text-lg font-semibold text-foreground">Coach Williams</div>
                  </div>
                </div>
              </div>
            </div>
            <button className="mt-5 w-full py-2.5 rounded-xl border border-[#22C55E] text-[#22C55E] text-sm font-semibold hover:bg-[#22C55E]/10 transition">
              Edit Profile
            </button>
          </Card>

          <Card>
            <SectionHeader>Account</SectionHeader>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="text-sm text-foreground">dheeraj@golfanalytics.com</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Member Since</div>
                <div className="text-sm text-foreground">July 2026</div>
              </div>
            </div>
            <button className="mt-5 w-full py-2.5 rounded-xl border border-[#EF4444] text-[#EF4444] text-sm font-semibold hover:bg-[#EF4444]/10 transition">
              Sign Out
            </button>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
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
                <span className="text-sm text-muted-foreground">App Version</span>
                <span className="text-sm font-semibold text-foreground">1.0.0 Beta</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Brand</span>
                <span className="text-sm font-semibold text-foreground">Golf Analytics</span>
              </div>
              <div className="pt-3 mt-2 border-t border-[#2A2A2C] text-[11px] text-muted-foreground text-center">
                Powered by Putt Vector AI
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
