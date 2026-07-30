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
    <p className="golf-label">{children}</p>
  );
}

function AnalyticsPage() {
  const data = getSessionAnalytics();
  // TODO: mock — derive the real made-in-a-row streak from session data.
  const streak = 6;
  // TODO: mock — generate this insight dynamically from the session's tendencies.
  const insight = "Your putts are drifting left on breaking putts.";

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
      <div className="relative z-10 px-12 py-10 max-w-6xl mx-auto flex flex-col gap-8">
        <h1 className="sr-only">Session Analytics</h1>

        {/* Hero */}
        <div className="bg-[#0D1512] border border-white/10 rounded-[12px] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#34D399]/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
          <Label>Make %</Label>
          <div className="golf-accent-text-glow flex items-baseline gap-4 mt-1">
            <span className="golf-display text-8xl text-white leading-none">{data.makePercent}</span>
            <span className="golf-display text-3xl text-[#34D399]">%</span>
          </div>
          <p className="mt-6 text-xs golf-text-secondary font-medium">
            <span className="text-[#34D399]">{data.made} made</span>
            {" · "}
            <span className="text-[#EF4444]">{data.missed} missed</span>
            {" this session"}
          </p>
        </div>

        {/* Supporting stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Total Putts", value: `${data.totalPutts}`, unit: "" },
            { label: "Avg Distance", value: `${data.avgDistanceFt}`, unit: "FT" },
            { label: "Streak", value: `${streak}`, unit: "MADE" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0D1512] border border-white/10 rounded-[12px] p-8">
              <Label>{s.label}</Label>
              <p className="golf-display text-5xl text-white mt-2">
                {s.value}
                {s.unit && <span className="text-sm ml-2 golf-text-secondary font-bold">{s.unit}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Single visual */}
        <PuttMap data={data} />

        {/* Plain-language insight */}
        <div className="bg-[#0D1512] border border-white/10 rounded-[12px] p-8">
          <Label>Insight</Label>
          <p className="mt-3 text-lg text-[#34D399] italic">{insight}</p>
        </div>
      </div>
    </div>
  );
}
