import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { getPrePuttRead } from "@/lib/previewService";
import { SharedGreenView } from "@/components/SharedGreenView";
import { usePutt } from "@/context/PuttContext";
import { CoursePhotoBackdrop } from "@/components/CoursePhotoBackdrop";


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

const GREEN = "#34D399"; // --golf-accent
const WHITE = "#FFFFFF";
const CARD = "#0D1512"; // --golf-card
const COACHING_BG = "#040906"; // --golf-deep
const DEEP = "#040906"; // --golf-deep

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
    <div className="flex items-baseline justify-between py-3 border-b border-white/10 last:border-b-0">
      <span className="golf-label">
        {label}
      </span>
      <span className="golf-display text-2xl tracking-tight" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

// TODO: Replace with real-time camera feed from hardware SDK




function PreviewPage() {
  const read = getPrePuttRead();
  const { currentPutt } = usePutt();

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] p-6">
      <CoursePhotoBackdrop />
      <div className="relative w-full max-w-[1400px] mx-auto flex flex-col gap-5">

        <div className="w-full flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GREEN }} />
          <span
            className="text-base font-semibold uppercase tracking-widest"
            style={{ color: GREEN }}
          >
            {read.status}
          </span>
        </div>

        <h1 className="sr-only">Pre-Putt Read</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <div className="golf-glass w-full rounded-2xl p-6">
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
            </div>

            <div className="golf-glass-inner w-full rounded-xl p-5">
              <div className="golf-label mb-2">
                AI Coaching
              </div>
              <p
                className="text-base italic leading-relaxed"
                style={{ color: GREEN }}
              >
                &ldquo;{read.coaching}&rdquo;
              </p>
            </div>
          </div>

          {/* Right column */}
          <div
            className="relative w-full rounded-2xl p-4 flex items-center justify-center"
            style={{ backgroundColor: CARD, minHeight: 520 }}
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5 golf-text-secondary">
              <Camera size={12} strokeWidth={2} />
              <span className="text-base font-semibold uppercase tracking-widest">Live View</span>
            </div>
            <div className="w-full h-full max-h-[640px] flex items-center justify-center">
              <SharedGreenView
                ballAngle={currentPutt.ballAngle}
                ballDistance={currentPutt.ballDistance}
                breakDirection={read.breakDirection}
              />

            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full">
          <button
            className="flex-1 rounded-lg py-3.5 text-sm font-semibold tracking-wide border border-[#34D399]"
            style={{ color: GREEN }}
          >
            PREVIEW COMPLETE
          </button>
          <Link
            to="/practice"
            className="golf-accent-glow flex-1 rounded-lg py-3.5 text-sm font-semibold tracking-wide text-center border border-[#34D399]"
            style={{ backgroundColor: GREEN, color: DEEP }}
          >
            START PRACTICE
          </Link>
        </div>
      </div>
    </div>
  );
}
