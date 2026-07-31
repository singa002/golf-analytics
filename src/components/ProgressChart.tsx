import { Link } from "@tanstack/react-router";
import { useState } from "react";
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

const ACCENT = "#34D399"; // --golf-accent
const DEEP = "#040906"; // --golf-deep

type ProgressPoint = {
  id: string;
  date: string;
  makePercent: number;
  made: number;
  missed: number;
};

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
    <div className="rounded-[10px] border border-white/10 px-3 py-2 shadow-xl" style={{ backgroundColor: DEEP }}>
      <div className="golf-label-sm whitespace-nowrap">{point.date}</div>
      <div className="golf-display text-lg text-[#34D399] leading-tight">{point.makePercent}%</div>
      <div className="text-base golf-text-secondary">
        <span className="text-[#22C55E]">{point.made} made</span>
        {" · "}
        <span className="text-[#EF4444]">{point.missed} missed</span>
      </div>
    </div>
  );
}

/**
 * Dashboard progress chart: make % over the session history, one hoverable point
 * per session. Selecting a point re-targets the "View full history" link so it
 * opens Analytics on that session.
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

  const firstMake = series[0]?.makePercent ?? 0;
  const latestMake = series[series.length - 1]?.makePercent ?? 0;
  const progressDelta = latestMake - firstMake;

  const values = series.map((p) => p.makePercent);
  const domain: [number, number] = [
    Math.max(0, Math.floor(Math.min(...values) / 10) * 10 - 5),
    Math.min(100, Math.ceil(Math.max(...values) / 10) * 10 + 5),
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between items-center mb-4">
        <p className="golf-label">PROGRESS</p>
        <span className="text-base font-medium text-[#34D399]">
          {progressDelta >= 0 ? "+" : ""}
          {progressDelta}% since your first session
        </span>
      </div>

      <div className="w-full flex-1 min-h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={series}
            margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
            onClick={(state) => {
              const point = state?.activePayload?.[0]?.payload as ProgressPoint | undefined;
              if (point) setSelectedId(point.id);
            }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#B0B3AF", fontSize: 14 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={domain}
              tick={{ fill: "#B0B3AF", fontSize: 14 }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              content={<ProgressTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="makePercent"
              stroke={ACCENT}
              strokeWidth={2}
              isAnimationActive={false}
              dot={{ r: 4, fill: DEEP, stroke: ACCENT, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: ACCENT, stroke: DEEP, strokeWidth: 2, cursor: "pointer" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          to="/analytics"
          search={selectedId ? { session: selectedId } : {}}
          className="flex items-center gap-1 text-base font-semibold text-[#34D399] hover:text-[#6EE7B7] transition-colors"
        >
          View full history
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
