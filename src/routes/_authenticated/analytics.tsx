import { createFileRoute } from "@tanstack/react-router";
import { getSessionAnalytics } from "@/lib/analyticsService";
import { PuttMap } from "@/components/AnalyticsGrid";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Putt Vector" },
      {
        name: "description",
        content: "Your putting session at a glance: make %, total putts, and putt map.",
      },
      { property: "og:title", content: "Analytics — Putt Vector" },
      {
        property: "og:description",
        content: "A simple, focused view of your putting performance.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{children}</p>
  );
}

function AnalyticsPage() {
  const data = getSessionAnalytics();
  // TODO: mock — derive the real made-in-a-row streak from session data.
  const streak = 6;
  // TODO: mock — generate this insight dynamically from the session's tendencies.
  const insight = "Your putts are drifting left on breaking putts.";

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-[#0D1A0D] relative overflow-hidden">
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

      <div className="relative z-10 px-12 py-10 max-w-6xl mx-auto flex flex-col gap-8">
        <h1 className="sr-only">Session Analytics</h1>

        {/* Hero */}
        <div className="bg-[#1A2A1A] border border-white/10 rounded-[12px] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
          <Label>Make %</Label>
          <div className="flex items-baseline gap-4 mt-1">
            <span className="text-8xl font-bold text-white leading-none">{data.makePercent}</span>
            <span className="text-3xl font-medium text-[#22C55E]">%</span>
          </div>
          <p className="mt-6 text-xs text-white/60 font-medium">
            {data.made} made · {data.missed} missed this session
          </p>
        </div>

        {/* Supporting stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Total Putts", value: `${data.totalPutts}`, unit: "" },
            { label: "Avg Distance", value: `${data.avgDistanceFt}`, unit: "FT" },
            { label: "Streak", value: `${streak}`, unit: "MADE" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1A2A1A] border border-white/10 rounded-[12px] p-8">
              <Label>{s.label}</Label>
              <p className="text-5xl font-bold text-white mt-2">
                {s.value}
                {s.unit && <span className="text-sm ml-2 text-white/40 font-bold">{s.unit}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Single visual */}
        <PuttMap data={data} />

        {/* Plain-language insight */}
        <div className="bg-[#1A2A1A] border border-white/10 rounded-[12px] p-8">
          <Label>Insight</Label>
          <p className="mt-3 text-lg text-[#22C55E] italic">{insight}</p>
        </div>
      </div>
    </div>
  );
}
