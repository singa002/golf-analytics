import { createFileRoute, Link } from "@tanstack/react-router";
import { getPrePuttRead } from "@/lib/previewService";

export const Route = createFileRoute("/_authenticated/preview")({
  head: () => ({
    meta: [
      { title: "Preview — Putt Vector" },
      {
        name: "description",
        content: "Pre-putt read with distance, speed, break, and AI coaching.",
      },
      { property: "og:title", content: "Preview — Putt Vector" },
      {
        property: "og:description",
        content: "Pre-putt read with distance, speed, break, and AI coaching.",
      },
    ],
  }),
  component: PreviewPage,
});

const GREEN = "#22C55E";
const WHITE = "#FFFFFF";
const GRAY = "#9CA3AF";
const CARD = "#1C1C1E";
const COACHING_BG = "#26262A";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-2xl p-6"
      style={{ backgroundColor: CARD, maxWidth: 540 }}
    >
      {children}
    </div>
  );
}

function MetricRow({
  label,
  value,
  valueColor = WHITE,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-baseline justify-between py-3 border-b border-[#2C2C2E] last:border-b-0">
      <span className="text-[11px] uppercase tracking-widest" style={{ color: GRAY }}>
        {label}
      </span>
      <span className="text-2xl font-semibold tracking-tight" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

function PreviewPage() {
  const read = getPrePuttRead();

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-xl flex flex-col items-center gap-5">
        <div className="w-full flex items-center gap-2" style={{ maxWidth: 540 }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GREEN }} />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: GREEN }}
          >
            {read.status}
          </span>
        </div>

        <Card>
          <h1 className="sr-only">Pre-Putt Read</h1>

          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Next Putt
            </div>
            <div className="text-3xl font-bold text-foreground mt-1">
              {read.distanceFt} ft
            </div>
          </div>

          <div className="flex flex-col">
            <MetricRow label="Distance" value={`${read.distanceFt} ft`} />
            <MetricRow label="Speed" value={`${read.speedMs} m/s`} />
            <MetricRow
              label="Break"
              value={`${read.breakDeg}° ${read.breakDirection}`}
              valueColor={GREEN}
            />
            <MetricRow
              label="Start Line"
              value={`${read.startLineDeg}° ${read.startLineDirection}`}
            />
            <MetricRow label="Stimp" value={read.stimp.toString()} />
            <MetricRow
              label="Aim Point"
              value={`${read.aimPointFt} ft ${read.aimPointDirection}`}
            />
          </div>
        </Card>

        <div
          className="w-full rounded-xl p-5"
          style={{ backgroundColor: COACHING_BG, maxWidth: 540 }}
        >
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            AI Coaching
          </div>
          <p
            className="text-base italic leading-relaxed"
            style={{ color: GREEN }}
          >
            &ldquo;{read.coaching}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-4 w-full" style={{ maxWidth: 540 }}>
          <button
            className="flex-1 rounded-lg py-3.5 text-sm font-semibold tracking-wide"
            style={{ backgroundColor: GREEN, color: "#0A0A0A" }}
          >
            PREVIEW COMPLETE
          </button>
          <Link
            to="/practice"
            className="flex-1 rounded-lg py-3.5 text-sm font-semibold tracking-wide text-center border border-white"
            style={{ color: WHITE }}
          >
            START PRACTICE
          </Link>
        </div>
      </div>
    </div>
  );
}

