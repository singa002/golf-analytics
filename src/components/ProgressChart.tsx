import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SessionSummary } from "@/lib/historyService";

const ACCENT = "#22C55E"; // --golf-accent (also MADE / positive data)
const DEEP = "#040906"; // --golf-deep
/** Ignore chart "taps" that moved farther than this (px) — treat as swipe/scroll instead. */
const TAP_MOVE_THRESHOLD_PX = 12;

type ProgressPoint = {
  id: string;
  date: string;
  makePercent: number;
  made: number;
  missed: number;
};

/** Short tick label so all sessions fit evenly without Recharts dropping ticks. */
function shortDateTick(date: string) {
  // "Mon Jul 27" → "Jul 27"
  const parts = date.split(" ");
  return parts.length >= 3 ? `${parts[1]} ${parts[2]}` : date;
}

function ProgressTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ProgressPoint }[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div
      className="rounded-[10px] border border-white/10 px-3.5 py-3 shadow-xl flex flex-col gap-1.5"
      style={{ backgroundColor: DEEP }}
    >
      <div className="golf-label-sm whitespace-nowrap">{point.date}</div>
      <div className="golf-display text-lg text-[#22C55E] leading-none">{point.makePercent}%</div>
      <div className="text-base golf-text-secondary leading-snug">
        <span className="text-[#22C55E]">{point.made} made</span>
        {" · "}
        <span className="text-[#EF4444]">{point.missed} missed</span>
      </div>
    </div>
  );
}

/** Visible dot + larger invisible hit target for finger taps. */
function SessionDot(props: {
  cx?: number;
  cy?: number;
  index?: number;
  pinnedIndex: number | null;
}) {
  const { cx, cy, index, pinnedIndex } = props;
  if (cx == null || cy == null || index == null) return null;
  const pinned = pinnedIndex === index;
  return (
    <g>
      {/* Invisible hit area — pointer-events only; visual circle below ignores events. */}
      <circle cx={cx} cy={cy} r={18} fill="transparent" style={{ cursor: "pointer" }} />
      <circle
        cx={cx}
        cy={cy}
        r={pinned ? 6 : 4}
        fill={pinned ? ACCENT : DEEP}
        stroke={ACCENT}
        strokeWidth={2}
        style={{ pointerEvents: "none" }}
      />
    </g>
  );
}

/**
 * Dashboard progress chart: make % over the session history, one hoverable point
 * per session. Selecting a point re-targets the "View full history" link so it
 * opens Analytics on that session. Tooltips work on hover (desktop) and tap (iPad).
 */
export function ProgressChart({ sessions }: { sessions: SessionSummary[] }) {
  // History is newest-first; the chart reads oldest → newest (latest on the right).
  const series: ProgressPoint[] = [...sessions].reverse().map((s) => ({
    id: s.id,
    date: s.date,
    makePercent: s.makePercent,
    made: s.made,
    missed: s.missed,
  }));

  const latestId = series[series.length - 1]?.id;
  const [selectedId, setSelectedId] = useState<string | undefined>(latestId);
  /** When set, tooltip is pinned for touch/click; null lets Recharts hover control it. */
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const chartWrapRef = useRef<HTMLDivElement | null>(null);
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const skipNextClick = useRef(false);

  // Dismiss pinned tooltip when tapping/clicking outside the chart.
  useEffect(() => {
    if (pinnedIndex === null) return;
    const onPointerDown = (event: PointerEvent) => {
      if (chartWrapRef.current?.contains(event.target as Node)) return;
      setPinnedIndex(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pinnedIndex]);

  const firstMake = series[0]?.makePercent ?? 0;
  const latestMake = series[series.length - 1]?.makePercent ?? 0;
  const progressDelta = latestMake - firstMake;

  const values = series.map((p) => p.makePercent);
  const domain: [number, number] = [
    Math.max(0, Math.floor(Math.min(...values) / 10) * 10 - 5),
    Math.min(100, Math.ceil(Math.max(...values) / 10) * 10 + 5),
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex justify-between items-center mb-2 xl:mb-4 shrink-0">
        <p className="golf-label">PROGRESS</p>
        <span className="text-sm xl:text-base font-medium text-[#22C55E]">
          {progressDelta >= 0 ? "+" : ""}
          {progressDelta}% since your first session
        </span>
      </div>

      {/* Fills leftover card height on iPad; no max-height cap (that left dead space). */}
      <div
        ref={chartWrapRef}
        className="w-full flex-1 min-h-[12rem] xl:min-h-52 touch-manipulation"
        onTouchStart={(event) => {
          const t = event.touches[0];
          touchOrigin.current = { x: t.clientX, y: t.clientY };
          skipNextClick.current = false;
        }}
        onTouchMove={(event) => {
          if (!touchOrigin.current) return;
          const t = event.touches[0];
          const dx = t.clientX - touchOrigin.current.x;
          const dy = t.clientY - touchOrigin.current.y;
          if (Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD_PX) {
            // Finger moved — treat as swipe/scroll, not a tooltip tap.
            skipNextClick.current = true;
          }
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={series}
            margin={{ top: 12, right: 12, left: 12, bottom: 36 }}
            onClick={(state) => {
              if (skipNextClick.current) {
                skipNextClick.current = false;
                return;
              }
              const index = state?.activeTooltipIndex;
              const point = state?.activePayload?.[0]?.payload as ProgressPoint | undefined;
              if (typeof index === "number" && point) {
                setPinnedIndex((prev) => (prev === index ? null : index));
                setSelectedId(point.id);
              } else {
                // Tap on empty chart area dismisses a pinned tooltip.
                setPinnedIndex(null);
              }
            }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              interval={0}
              tick={{ fill: "#B0B3AF", fontSize: 14 }}
              tickFormatter={shortDateTick}
              axisLine={false}
              tickLine={false}
              tickMargin={14}
              height={56}
              label={{
                value: "Date",
                position: "insideBottom",
                offset: -4,
                fill: "#B0B3AF",
                fontSize: 14,
              }}
            />
            <YAxis
              domain={domain}
              tick={{ fill: "#B0B3AF", fontSize: 14 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              width={58}
              tickFormatter={(v: number) => `${v}%`}
              label={{
                value: "Make %",
                angle: -90,
                position: "insideLeft",
                offset: 4,
                fill: "#B0B3AF",
                fontSize: 14,
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              // pinnedIndex set → force show that session (touch/click).
              // pinnedIndex null → active undefined → normal hover on desktop.
              active={pinnedIndex !== null ? true : undefined}
              defaultIndex={pinnedIndex ?? undefined}
              content={<ProgressTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="makePercent"
              stroke={ACCENT}
              strokeWidth={2}
              isAnimationActive={false}
              dot={(dotProps) => (
                <SessionDot
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  index={dotProps.index}
                  pinnedIndex={pinnedIndex}
                />
              )}
              activeDot={{ r: 7, fill: ACCENT, stroke: DEEP, strokeWidth: 2, cursor: "pointer" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 xl:mt-4 flex justify-end shrink-0">
        <Link
          to="/analytics"
          search={selectedId ? { session: selectedId } : {}}
          className="flex items-center gap-1 text-sm xl:text-base font-semibold text-[#22C55E] hover:text-[#4ADE80] transition-colors"
        >
          View full history
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
